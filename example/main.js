import Vue from 'vue';
import App from './App.vue'

import VueCardPayment from '../src/index.js';
Vue.use(VueCardPayment);

new Vue({
  el: '#app',
  render: h => h(App)
})
