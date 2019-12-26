import { setProp, plus } from '@/store/reusable';
import createVector from '@/models/vector/';
import createPlayer from '@/models/player/';
import createLava from '@/models/lava/';
import createInitialCoin from '@/models/coin/';
import {
  LAVA_CONFIG,
  WALL_CONFIG,
  EMPTY_CONFIG,
  STATUS_MAP,
} from '@/consts';

const LEVEL_CHAR_MAP = {
  '.': EMPTY_CONFIG.TYPE,
  '#': WALL_CONFIG.TYPE,
  '+': LAVA_CONFIG.TYPE,
  '=': createLava,
  '|': createLava,
  v: createLava,
  o: createInitialCoin,
  '@': createPlayer,
};

export default {
  namespaced: true,

  state: {
    levelHeight: 0,
    levelWidth: 0,
    countEndLevel: 0,
    rows: [[]],
  },

  getters: {
    /**
     * Создаст функцию, чтобы можно было проверить пересечение сущности с краем
     * уровня или другой сущностью переданного типа (type), применяется для обработки
     * движения и с учетом столкновения с краем уровня или стеной
     * @param {object} state - состояние стора
     * @return {function} - функция для проверки пересечения, где аргументы
     * pos - позиция сущности,
     * size - размер сущности
     * type - тип сущности, пересечение с которой требуется найти
     * вернет булево значение, при этом true - когда сущность будет пересекать
     * с краем уровня или другой сущностью переданного типа (type)
     */
    touches: state => (pos, size, type) => {
      const xStart = Math.floor(pos.x);
      const xEnd = Math.ceil(pos.x + size.x);
      const yStart = Math.floor(pos.y);
      const yEnd = Math.ceil(pos.y + size.y);

      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          const isOutside = x < 0 || x >= state.levelWidth
            || y < 0 || y >= state.levelHeight;
          const here = isOutside ? WALL_CONFIG.TYPE : state.rows[y][x];

          if (here === type) {
            return true;
          }
        }
      }
      return false;
    },
  },

  mutations: {
    /**
     * Сохранит высоту уровня
     */
    SET_LEVEL_HEIGHT: setProp('levelHeight'),

    /**
     * Сохранит ширину уровня
     */
    SET_LEVEL_WIDTH: setProp('levelWidth'),

    /**
     * Сохранит двумерный массив неподвижных сущностей на уровне
     */
    SET_ROWS: setProp('rows'),

    /**
     * Добавит 1 к счетчику начала уровня, нужно для запуска уровня в компоненте
     * при смене значения счетчика
     */
    ADD_END_LEVEL: plus('countEndLevel'),
  },

  actions: {
    /**
     * Сгенерирует данные уровня на основе переданного шаблона (plan) и сохранит их в state,
     * сгенерированы и сохранены будут ширина и высота уровня,
     * данные сущностей на уровне и статус игры
     * @param {function} commit - запустит мутацию с перереданными параметрами
     * @param {string} plan
     */
    start({ commit }, plan) {
      const startActors = [];
      const rows = plan
        .trim()
        .split('\n')
        .map(row => row.trim().split(''))
        .map((row, y) => row.map((char, x) => {
          const entity = LEVEL_CHAR_MAP[char];

          if (typeof entity === 'string') {
            return entity;
          }

          startActors.push(entity(createVector(x, y), char));
          return EMPTY_CONFIG.TYPE;
        }));

      commit('SET_LEVEL_HEIGHT', rows.length);
      commit('SET_LEVEL_WIDTH', rows[0].length);
      commit('SET_ROWS', rows);
      commit('core/SET_ACTORS', startActors, { root: true });
      commit('core/SET_STATUS', STATUS_MAP.PLAYING, { root: true });
    },
  },
};
