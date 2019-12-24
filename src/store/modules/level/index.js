import { setProp, plus } from '@/store/reusable';
import Vector from '@/models/Vector';
import Player from '@/models/Player';
import Lava from '@/models/Lava';
import Coin from '@/models/Coin';
import { LAVA_CONFIG, WALL_CONFIG, EMPTY_CONFIG } from '@/consts';

const LEVEL_CHAR_MAP = {
  '.': EMPTY_CONFIG.TYPE,
  '#': WALL_CONFIG.TYPE,
  '+': LAVA_CONFIG.TYPE,
  '=': Lava,
  '|': Lava,
  v: Lava,
  o: Coin,
  '@': Player,
};

// TODO add comments
export default {
  namespaced: true,

  state: {
    levelHeight: 0,
    levelWidth: 0,
    countStartLevel: 0,
    countEndLevel: 0,
    rows: [],
  },

  getters: {
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
    SET_LEVEL_HEIGHT: setProp('levelHeight'),
    SET_LEVEL_WIDTH: setProp('levelWidth'),
    SET_ROWS: setProp('rows'),
    ADD_START_LEVEL: plus('countStartLevel'),
    ADD_END_LEVEL: plus('countEndLevel'),
  },

  actions: {
    createLevel({ commit }, plan) {
      const startActors = [];
      const rows = plan
        .trim()
        .split('\n')
        .map(row => row.trim().split(''))
        .map((row, y) => row.map((char, x) => {
          const type = LEVEL_CHAR_MAP[char];

          if (typeof type === 'string') {
            return type;
          }

          startActors.push(type.create(new Vector(x, y), char));
          return EMPTY_CONFIG.TYPE;
        }));

      commit('SET_LEVEL_HEIGHT', rows.length);
      commit('SET_LEVEL_WIDTH', rows[0].length);
      commit('SET_ROWS', rows);
      commit('core/SET_ACTORS', startActors, { root: true });
      commit('ADD_START_LEVEL');
    },
  },
};
