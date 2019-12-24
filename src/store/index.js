import Vue from 'vue';
import Vuex from 'vuex';
import core from '@/store/modules/core/';
import level from '@/store/modules/level/';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  namespaced: true,

  modules: {
    core,
    level,
  },
});
