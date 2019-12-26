import Vuex from 'vuex';
import Vue from 'vue';
import clone from 'ramda/src/clone';
import createVector from '@/models/vector/';
import createPlayer from '@/models/player/';
import createLava from '@/models/lava/';
import createInitialCoin from '@/models/coin/';
import core from '../core';
import level from '.';

Vue.use(Vuex);

describe('Store module level', () => {
  const defaultModules = { level, core };
  const createStore = (optionModules = {}) => new Vuex.Store({
    namespaced: true,
    modules: Object.assign({}, defaultModules, optionModules),
  });

  describe('getters', () => {
    describe('touches должен вернуть функцию', () => {
      it('которая вернет false при не пересечении объекта с указанным типом (wall)', () => {
        const levelClone = clone(level);

        levelClone.state.levelWidth = 15;
        levelClone.state.levelHeight = 10;
        levelClone.state.rows = [
          ['empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty'],
          ['wall', 'wall', 'wall'],
        ];
        const store = createStore({ level: levelClone });
        const touches = store.getters['level/touches'];

        expect(touches({ x: 1, y: 1 }, { x: 1, y: 1 }, 'wall')).toBe(false);
      });

      it('которая вернет true при пересечении объекта с указанным типом (wall)', () => {
        const levelClone = clone(level);

        levelClone.state.levelWidth = 15;
        levelClone.state.levelHeight = 10;
        levelClone.state.rows = [
          ['empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty'],
          ['wall', 'wall', 'wall'],
        ];
        const store = createStore({ level: levelClone });
        const touches = store.getters['level/touches'];

        expect(touches({ x: 1, y: 2 }, { x: 1, y: 1 }, 'wall')).toBe(true);
      });

      it('которая вернет true для объекта вне уровня', () => {
        const levelClone = clone(level);

        levelClone.state.levelWidth = 15;
        levelClone.state.levelHeight = 10;
        levelClone.state.rows = [[]];
        const store = createStore({ level: levelClone });
        const touches = store.getters['level/touches'];

        expect(touches({ x: -1, y: -1 }, { x: 0.5, y: 0.5 }, 'wall')).toBe(true);
      });
    });
  });

  describe('actions', () => {
    describe('start генерирует данные уровня перед отрисовкой анимации', () => {
      it('должен сохранить высоту уровня', async () => {
        const levelClone = clone(level);
        const store = createStore({ level: levelClone });

        await store.dispatch('level/start', '....\n....\n####');
        expect(store.state.level.levelHeight).toBe(3);
      });

      it('должен сохранить ширину уровня', async () => {
        const levelClone = clone(level);
        const store = createStore({ level: levelClone });

        await store.dispatch('level/start', '....\n....\n####');
        expect(store.state.level.levelWidth).toBe(4);
      });

      it('должен сохранить двумерный массив с неподвижными сущностями', async () => {
        const levelClone = clone(level);
        const store = createStore({ level: levelClone });

        await store.dispatch('level/start', '.=..\n#.o#\n####');
        expect(store.state.level.rows).toEqual([
          ['empty', 'empty', 'empty', 'empty'],
          ['wall', 'empty', 'empty', 'wall'],
          ['wall', 'wall', 'wall', 'wall'],
        ]);
      });

      it('должен сохранить массив с подвижными сущностями', async () => {
        const levelClone = clone(level);
        const store = createStore({ level: levelClone });
        const coin = createInitialCoin(createVector(3, 1));

        await store.dispatch('level/start', '.|..\n..@o\n####');
        delete coin.wobble;
        delete coin.pos;
        delete store.state.core.actors[2].wobble;
        delete store.state.core.actors[2].pos;

        expect(JSON.stringify(store.state.core.actors)).toBe(JSON.stringify([
          createLava(createVector(1, 0), '|'),
          createPlayer(createVector(2, 1)),
          coin,
        ]));
      });

      it('должен сохранить статус игры как "играет"', async () => {
        const levelClone = clone(level);
        const store = createStore({ level: levelClone });

        await store.dispatch('level/start', '.|..\n..@o\n####');
        expect(store.state.core.status).toBe('playing');
      });
    });
  });
});
