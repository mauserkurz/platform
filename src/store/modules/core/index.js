import { setProp } from '@/store/reusable';
import { PLAYER_CONFIG, LAVA_CONFIG, STATUS_MAP } from '@/consts';

// TODO add comments
const overlap = (actor1, actor2) => actor1.pos.x + actor1.size.x > actor2.pos.x
  && actor1.pos.x < actor2.pos.x + actor2.size.x
  && actor1.pos.y + actor1.size.y > actor2.pos.y
  && actor1.pos.y < actor2.pos.y + actor2.size.y;

export default {
  namespaced: true,

  state: {
    actors: [],
    status: '',
  },

  getters: {
    player(state) {
      return state.actors.find(a => a.type === PLAYER_CONFIG.TYPE);
    },

    stateChange(state, _, rootState) {
      return [
        state.actors,
        state.status,
        rootState.level.levelHeight,
        rootState.level.levelWidth,
        rootState.level.rows,
      ];
    },
  },

  mutations: {
    SET_ACTORS: setProp('actors'),
    SET_STATUS: setProp('status'),
  },

  actions: {
    start({ commit, dispatch }, plan) {
      dispatch('level/createLevel', plan, { root: true });
      commit('SET_STATUS', STATUS_MAP.PLAYING);
    },

    // eslint-disable-next-line object-curly-newline
    update({ state, getters, rootGetters, commit }, { time, keys }) {
      const touches = rootGetters['level/touches'];
      const actors = state.actors
        .map(actor => actor.update(time, touches, keys));

      commit('SET_ACTORS', actors);
      if (state.status !== STATUS_MAP.PLAYING) {
        return state.status;
      }
      const { player } = getters;

      if (touches(player.pos, player.size, LAVA_CONFIG.TYPE)) {
        commit('SET_STATUS', STATUS_MAP.LOST);
        return state.status;
      }

      for (const actor of actors) {
        if (actor !== player && overlap(actor, player)) {
          const newState = actor.collide(state);

          commit('SET_ACTORS', newState.actors);
          commit('SET_STATUS', newState.status);
        }
      }
      return state.status;
    },
  },
};
