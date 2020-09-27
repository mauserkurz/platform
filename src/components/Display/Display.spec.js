import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import 'jest-canvas-mock';
import clone from 'ramda/src/clone';
import core from '@/store/modules/core/';
import level from '@/store/modules/level/';
import createPlayer from '@/models/player';
import createVector from '@/models/vector';
import createLava from '@/models/lava';
import { createCoin } from '@/models/coin/';
import Display from './Display.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('component Display', () => {
  const createWrapper = ({ options = {}, modules = {}, needsRendering = false } = {}) => {
    const store = new Vuex.Store({
      namespaced: true,
      modules: Object.assign({}, { core, level }, modules),
    });
    const defaultOptions = { localVue, store };
    const customMount = needsRendering ? mount : shallowMount;
    const wrapper = customMount(Display, Object.assign({}, defaultOptions, options));

    return { store, wrapper };
  };
  // eslint-disable-next-line no-underscore-dangle
  const checkCanvas = wrapper => expect(wrapper.vm.cx.__getEvents()).toMatchSnapshot();
  const clientStub = {
    clientWidth: 600,
    clientHeight: 450,

    reset() {
      this.clientWidth = 600;
      this.clientHeight = 450;
    },
  };

  Date.now = jest.fn().mockReturnValue(1577416453535);
  Object.defineProperty(document.documentElement, 'clientWidth', {
    get() {
      return clientStub.clientWidth;
    },
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    get() {
      return clientStub.clientWidth;
    },
  });

  describe('rendering', () => {
    it('should render html', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('store interaction', () => {
    it(`при изменении статуса игры должен выставить корректно
      ширину и высоту canvas`, () => {
      const levelClone = clone(level);
      const coreClone = clone(core);

      levelClone.state.levelHeight = 3;
      levelClone.state.levelWidth = 4;
      levelClone.state.rows = [
        ['empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'wall'],
        ['empty', 'wall', 'wall', 'wall'],
      ];
      coreClone.state.actors = [
        createLava(createVector(0, 0), '='),
        createPlayer(createVector(2, 1)),
      ];
      const { wrapper, store } = createWrapper({ modules: { level: levelClone, core: coreClone } });

      store.commit('core/SET_STATUS', 'playing');
      expect(wrapper.vm.$refs.canvas).toMatchObject({ width: 160, height: 120 });
    });

    describe('при изменении stateChange', () => {
      it('должен отрисовать анимацию на canvas', () => {
        const levelClone = clone(level);
        const coreClone = clone(core);
        const lava = createLava(createVector(0, 0), '=');
        const player = createPlayer(createVector(2, 1));
        const coin = createCoin(createVector(3, 0.5), createVector(3, 0.5), Math.PI);
        const time = 0.12;

        levelClone.state.levelHeight = 3;
        levelClone.state.levelWidth = 4;
        levelClone.state.rows = [
          ['empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'wall'],
          ['lava', 'wall', 'wall', 'wall'],
        ];
        coreClone.state.actors = [lava, player, coin];
        const { wrapper, store } = createWrapper({
          modules: {
            level: levelClone,
            core: coreClone,
          },
        });

        store.commit('core/SET_ACTORS', [
          lava.update(time, () => true),
          player.update(time, () => true, { ArrowLeft: true }),
          coin.update(time, () => true),
        ]);
        store.commit('core/SET_STATUS', 'playing');
        checkCanvas(wrapper);
      });

      it(`должен обновить положение видимой части canvas при движении игрока
        вверх и вправо`, async () => {
        const levelClone = clone(level);
        const coreClone = clone(core);

        levelClone.state.levelHeight = 30;
        levelClone.state.levelWidth = 30;
        levelClone.state.rows = Array.from(
          { length: 30 },
          (index) => {
            const entity = index === 8 ? 'wall' : 'empty';

            return Array.from({ length: 30 }, () => entity);
          },
        );
        coreClone.state.actors = [createPlayer(createVector(7, 18.5))];
        const { wrapper, store } = createWrapper({
          modules: {
            level: levelClone,
            core: coreClone,
          },
        });

        store.commit('core/SET_ACTORS', [createPlayer(createVector(14.2, 0.5))]);
        store.commit('core/SET_STATUS', 'playing');
        expect(wrapper.vm.viewport).toMatchObject({ top: 0, left: 4.600000000000001 });
      });

      it(`должен обновить положение видимой части canvas при движении игрока
        вниз и влево`, async () => {
        const levelClone = clone(level);
        const coreClone = clone(core);

        levelClone.state.levelHeight = 30;
        levelClone.state.levelWidth = 30;
        levelClone.state.rows = Array.from(
          { length: 30 },
          (index) => {
            const entity = index === 8 ? 'wall' : 'empty';

            return Array.from({ length: 30 }, () => entity);
          },
        );
        coreClone.state.actors = [createPlayer(createVector(20, 0.5))];
        const { wrapper, store } = createWrapper({
          modules: {
            level: levelClone,
            core: coreClone,
          },
        });

        store.commit('core/SET_ACTORS', [createPlayer(createVector(2.2, 17.5))]);
        store.commit('core/SET_STATUS', 'playing');
        expect(wrapper.vm.viewport).toMatchObject({ top: 7.75, left: 0 });
      });
    });

    it('при изменении countEndLevel должен очистить canvas', () => {
      const levelClone = clone(level);
      const coreClone = clone(core);

      levelClone.state.levelHeight = 3;
      levelClone.state.levelWidth = 4;
      levelClone.state.rows = [
        ['empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'wall'],
        ['empty', 'wall', 'wall', 'wall'],
      ];
      coreClone.state.actors = [
        createLava(createVector(0, 0), '='),
        createPlayer(createVector(2, 1)),
      ];
      const { wrapper, store } = createWrapper({ modules: { level: levelClone, core: coreClone } });
      const mock = jest.fn();

      store.commit('core/SET_STATUS', 'playing');
      wrapper.vm.cx.clearRect = mock;
      store.commit('level/ADD_END_LEVEL');
      expect(mock).toBeCalledWith(0, 0, 160, 120);
    });
  });

  describe('events', () => {
    it('должен по событию resize переписать размеры viewport и canvas', () => {
      const levelClone = clone(level);
      const coreClone = clone(core);
      const map = {};

      window.addEventListener = (event, cb) => {
        map[event] = cb;
      };
      levelClone.state.levelHeight = 30;
      levelClone.state.levelWidth = 30;
      levelClone.state.rows = Array.from(
        { length: 30 },
        (index) => {
          const entity = index === 8 ? 'wall' : 'empty';

          return Array.from({ length: 30 }, () => entity);
        },
      );
      coreClone.state.actors = [createPlayer(createVector(20, 0.5))];
      const { wrapper, store } = createWrapper({
        modules: {
          level: levelClone,
          core: coreClone,
        },
      });

      store.commit('core/SET_ACTORS', [createPlayer(createVector(2.2, 17.5))]);
      store.commit('core/SET_STATUS', 'playing');
      clientStub.clientWidth = 800;
      map.resize(new Event('resize'));
      expect(wrapper.vm.viewport).toMatchObject({ top: 7.75, left: 0 });
      clientStub.reset();
    });
  });
});
