import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import clone from 'ramda/src/clone';
import core from '@/store/modules/core/';
import level from '@/store/modules/level/';
import GAME_LEVELS from '@/gameLevels';
import DisplayWrap from './DisplayWrap.vue';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Vuetify);

describe('component DisplayWrap', () => {
  const createWrapper = ({ options = {}, modules = {}, needsRendering = false } = {}) => {
    const store = new Vuex.Store({
      namespaced: true,
      modules: Object.assign({}, { core, level }, modules),
    });
    const defaultOptions = { localVue, store, stubs: { Display: '<div class="display"></div>' } };
    const customMount = needsRendering ? mount : shallowMount;
    const wrapper = customMount(DisplayWrap, Object.assign({}, defaultOptions, options));

    return { store, wrapper };
  };

  describe('rendering', () => {
    it('should render html', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('mounted', () => {
    it('должен запустить игру через экшн start', () => {
      const levelClone = clone(level);
      const spy = jest.spyOn(levelClone.actions, 'start');

      createWrapper({ modules: { level: levelClone } });
      expect(spy.mock.calls[0][1]).toBe(GAME_LEVELS[0]);
    });

    it('должен по событию нажатия кнопки обновить уровень вызвав экнш update', () => {
      const coreClone = clone(core);
      const spy = jest.spyOn(coreClone.actions, 'update');
      const map = {};
      let frameCallBack = null;

      window.addEventListener = jest.fn((event, cb) => {
        map[event] = cb;
      });
      window.requestAnimationFrame = (frame) => {
        frameCallBack = frame;
      };
      createWrapper({ modules: { core: coreClone } });
      map.keydown({ key: 'ArrowLeft', type: 'keydown', preventDefault() {} });
      frameCallBack(0);
      frameCallBack(50);

      expect(spy.mock.calls[0][1]).toEqual({ keys: { ArrowLeft: true }, time: 0.05 });
    });

    it('должен если статус игры не "играет" по событию нажатия кнопки не реагировать', () => {
      const coreClone = clone(core);
      const spy = jest.spyOn(coreClone.actions, 'update');
      const map = {};
      let frameCallBack = null;

      window.addEventListener = jest.fn((event, cb) => {
        map[event] = cb;
      });
      window.requestAnimationFrame = (frame) => {
        frameCallBack = frame;
      };
      const { store } = createWrapper({ modules: { core: coreClone } });

      store.commit('core/SET_STATUS', 'won');
      map.keydown({ key: 'ArrowUp', type: 'keydown', preventDefault() {} });
      frameCallBack(0);
      frameCallBack(100);

      expect(spy.mock.calls[0][1]).toEqual({ keys: {}, time: 0.1 });
    });

    it(`должен запустить этот же уровень через 1 секунду после поражения через
      экшн start`, async () => {
      const levelClone = clone(level);
      const spy = jest.spyOn(levelClone.actions, 'start');
      let frameCallBack = null;

      window.requestAnimationFrame = (frame) => {
        frameCallBack = frame;
      };
      const { store } = createWrapper({ modules: { level: levelClone } });
      store.commit('core/SET_STATUS', 'lost');
      Array.from({ length: 13 }, (_, index) => frameCallBack(index * 100));

      await flushPromises();
      expect(spy.mock.calls[1][1]).toBe(GAME_LEVELS[0]);
    });

    it(`должен запустить этот новый уровень через 1 секунду после победы через
      экшн start`, async () => {
      const levelClone = clone(level);
      const spy = jest.spyOn(levelClone.actions, 'start');
      let frameCallBack = null;

      window.requestAnimationFrame = (frame) => {
        frameCallBack = frame;
      };
      const { store } = createWrapper({ modules: { level: levelClone } });
      store.commit('core/SET_STATUS', 'won');
      Array.from({ length: 13 }, (_, index) => frameCallBack(index * 100));

      await flushPromises();
      expect(spy.mock.calls[1][1]).toBe(GAME_LEVELS[1]);
    });

    it('должен при звершении всех уровней отобразить сообщений о победе', async () => {
      const levelClone = clone(level);
      let frameCallBack = null;

      window.requestAnimationFrame = (frame) => {
        frameCallBack = frame;
      };
      const { wrapper, store } = createWrapper({ modules: { level: levelClone } });

      for (let i = 0; i < GAME_LEVELS.length; i += 1) {
        store.commit('core/SET_STATUS', 'won');
        // eslint-disable-next-line no-loop-func
        Array.from({ length: 13 }, (_, index) => frameCallBack(index * 100));
        // eslint-disable-next-line no-await-in-loop
        await flushPromises();
      }
      expect(wrapper.find('v-alert-stub').text()).toBe("You've won!");
    });
  });
});
