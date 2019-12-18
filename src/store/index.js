import Vue from 'vue';
import Vuex from 'vuex';
import core from '@/store/modules/core/';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    core,
  },
});
