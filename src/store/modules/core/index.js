import { setProp } from '@/store/reusable';
import { PLAYER_CONFIG, LAVA_CONFIG, STATUS_MAP } from '@/consts';

/**
 * Вернет значение отвечающее на вопрос пересекает ли сущность actor1 другую сущность actor2
 * @param {object} actor1 - сущность, пересечение которой мы ищем
 * @param {object} actor2 - сущность с которой может пересечься actor1
 * @return {boolean} - значение пересечения
 */
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
    /**
     * Найдет игрока среди подвижных сущностей на текущем уровне
     * @param {object} state - состояние стора
     * @return {object} - сущность игрока
     */
    player(state) {
      return state.actors.find(a => a.type === PLAYER_CONFIG.TYPE);
    },

    /**
     * Вернет данные текущего уровня, изменения которых можно отслеживать для
     * @param {array} actors - подвижные объекты на уровне
     * @param {string} status - статус уровня, который может быть - победа, поражение или играет
     * последующей перерисовки во view
     * @return {array} - данные текущего уровня
     */
    stateChange({ actors, status }) {
      return [actors, status];
    },
  },

  mutations: {
    /**
     * Сохранит список подвижных сущностей на уровне
     */
    SET_ACTORS: setProp('actors'),

    /**
     * Сохранит статус игры
     */
    SET_STATUS: setProp('status'),
  },

  actions: {
    /**
     * Обновит состояние уровня в завистимости от действий подвижных сущностей
     * и действий игрока
     * @param {object} context - содержит данные стора и функции для управления им
     * @param {number} time - время в секундах, показываеющее разницу между прошлым
     * и следующим кадрами анимации
     * @param {object} keys - map в котором указаны нажатые клавиши
     * @return {string} - статус игры после обновления состояния уровня
     */
    update(context, { time, keys }) {
      const {
        state,
        getters,
        rootGetters,
        commit,
      } = context;
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
          const newState = actor.collide({ actors, status: state.status });

          commit('SET_ACTORS', newState.actors);
          commit('SET_STATUS', newState.status);
        }
      }
      return state.status;
    },
  },
};
