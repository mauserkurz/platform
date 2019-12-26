import Vuex from 'vuex';
import Vue from 'vue';
import clone from 'ramda/src/clone';
import createVector from '@/models/vector/';
import createPlayer from '@/models/player/';
import createLava from '@/models/lava/';
import createInitialCoin from '@/models/coin/';
import level from '../level';
import core from '.';

Vue.use(Vuex);

describe('Store module level', () => {
  const defaultModules = { level, core };
  const createStore = (optionModules = {}) => new Vuex.Store({
    namespaced: true,
    modules: Object.assign({}, defaultModules, optionModules),
  });

  describe('getters', () => {
    it('player должен вернуть сущность игрока', () => {
      const coreClone = clone(core);
      const player = createPlayer(createVector(1, 0));

      coreClone.state.actors = [
        createLava(createVector(0, 0), '|'),
        createLava(createVector(2, 0), 'v'),
        player,
      ];
      const store = createStore({ core: coreClone });

      expect(store.getters['core/player']).toBe(player);
    });

    describe(`stateChange возвращяет элементы уровня, при изменении которых надо перерисовывать
      уровень`, () => {
      it('должен содержать подвижные сущности', () => {
        const coreClone = clone(core);
        const actors = [
          createLava(createVector(0, 0), '|'),
          createPlayer(createVector(1, 0)),
          createLava(createVector(2, 0), 'v'),
        ];

        coreClone.state.actors = actors;
        const store = createStore({ core: coreClone });

        expect(store.getters['core/stateChange']).toContain(actors);
      });

      it('должен содержать статус игры', () => {
        const coreClone = clone(core);
        const status = 'playing';

        coreClone.state.status = status;
        const store = createStore({ core: coreClone });

        expect(store.getters['core/stateChange']).toContain(status);
      });
    });
  });

  describe('actions', () => {
    describe('update обновляет данные подвижных объектов и статус игры', () => {
      it('должен обновить все подвижные объекты', async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);
        const lava = createLava(createVector(0, 0), '=');
        const player = createPlayer(createVector(1, 1));
        const coin = createInitialCoin(createVector(2, 1));
        const status = 'playing';
        const mockUpdate = entity => Object.assign(
          entity,
          { update: jest.fn().mockImplementation(entity.update) },
        );
        const actors = [lava, player, coin].map(mockUpdate);
        const mockList = actors.map(entity => entity.update);

        coreClone.state.status = status;
        coreClone.state.actors = actors;
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'wall'],
          ['empty', 'wall', 'wall', 'wall'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });
        const time = 0.07;
        const keys = { ArrowRight: true };

        await store.dispatch('core/update', { time, keys });
        mockList
          .forEach(mock => expect(mock)
            .toBeCalledWith(time, store.getters['level/touches'], keys));
      });

      it('должен столкновении игрока с лавой сменить стаус игры на проигрыш', async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);

        coreClone.state.status = 'playing';
        coreClone.state.actors = [
          createLava(createVector(2, 1), '='),
          createPlayer(createVector(2, 1)),
        ];
        levelClone.state.rows = [
          ['wall', 'empty', 'empty', 'empty'],
          ['wall', 'empty', 'empty', 'wall'],
          ['wall', 'wall', 'wall', 'wall'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });

        await store.dispatch('core/update', { time: 0.12, keys: {} });
        expect(store.state.core.status).toBe('lost');
      });

      it(`должен при столкновении игрока с неподвижной лавой сменить стаус игры
        на проигрыш`, async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);

        coreClone.state.status = 'playing';
        coreClone.state.actors = [createPlayer(createVector(2, 1))];
        levelClone.state.levelWidth = 4;
        levelClone.state.levelHeight = 3;
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'lava', 'empty', 'empty'],
          ['empty', 'wall', 'wall', 'empty'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });

        await store.dispatch('core/update', { time: 0.16, keys: { ArrowLeft: true } });
        expect(store.state.core.status).toBe('lost');
      });

      it('должен удалить монету при столкновении ее с игроком', async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);
        const coin = createInitialCoin(createVector(2, 1));

        coreClone.state.status = 'playing';
        coreClone.state.actors = [
          createInitialCoin(createVector(1, 1)),
          coin,
          createPlayer(createVector(2, 1)),
        ];
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'wall', 'wall', 'empty'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });

        await store.dispatch('core/update', { time: 0.12, keys: {} });
        expect(store.state.core.actors).not.toContain(coin);
      });

      it(`должен при столкновении последней монеты на уровне с игроком сменить
        статус игры на победу`, async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);

        coreClone.state.status = 'playing';
        coreClone.state.actors = [
          createInitialCoin(createVector(2, 1)),
          createPlayer(createVector(2, 1)),
        ];
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'wall', 'wall', 'empty'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });

        await store.dispatch('core/update', { time: 0.12, keys: {} });
        expect(store.state.core.status).toBe('won');
      });

      it('должен не обновлять статус игры если статус отличный от "играет"', async () => {
        const coreClone = clone(core);
        const levelClone = clone(level);
        const status = 'won';

        coreClone.state.status = status;
        coreClone.state.actors = [
          createLava(createVector(1, 1), '='),
          createPlayer(createVector(1, 1)),
        ];
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'wall'],
          ['empty', 'wall', 'wall', 'wall'],
        ];
        const store = createStore({ core: coreClone, level: levelClone });

        await store.dispatch('core/update', { time: 0.06, keys: {} });
        expect(store.state.core.status).toBe(status);
      });
    });
  });
});
