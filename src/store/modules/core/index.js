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
    level: null,
    actors: [],
    status: '',
  },

  getters: {
    player(state) {
      return state.actors.find(a => a.type === PLAYER_CONFIG.TYPE);
    },

    state(state, getters) {
      return {
        level: state.level,
        actors: state.actors,
        status: state.status,
        player: getters.player,
      };
    },
  },

  mutations: {
    SET_LEVEL: setProp('level'),
    SET_ACTORS: setProp('actors'),
    SET_STATUS: setProp('status'),
  },

  actions: {
    start({ commit }, level) {
      commit('SET_LEVEL', level);
      commit('SET_ACTORS', level.startActors);
      commit('SET_STATUS', STATUS_MAP.PLAYING);
    },

    update({ state, getters, commit }, { time, keys }) {
      const actors = state.actors
        .map(actor => actor.update(time, { level: state.level }, keys));

      commit('SET_ACTORS', actors);
      if (state.status !== STATUS_MAP.PLAYING) {
        return state.status;
      }
      const { player } = getters;

      if (state.level.touches(player.pos, player.size, LAVA_CONFIG.TYPE)) {
        commit('SET_STATUS', STATUS_MAP.LOST);
        return state.status;
      }

      for (const actor of actors) {
        if (actor !== player && overlap(actor, player)) {
          const newState = actor.collide(getters.state);

          commit('SET_ACTORS', newState.actors);
          commit('SET_STATUS', newState.status);
        }
      }
      return state.status;
    },
  },
};
