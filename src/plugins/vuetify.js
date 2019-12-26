import Vue from 'vue';
import Vuetify from 'vuetify';
import { THEME } from '@/consts';

Vue.use(Vuetify);

export default new Vuetify({ theme: { themes: { light: THEME } } });
