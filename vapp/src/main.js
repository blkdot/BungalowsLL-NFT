import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import drizzleVuePlugin from '@drizzle/vue-plugin'
import drizzleOptions from './drizzleOptions';

Vue.use(Vuex);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

const store = new Vuex.Store({ state: {} });
Vue.use(drizzleVuePlugin, { store, drizzleOptions });
Vue.config.productionTip = false
Vue.prototype.MetaMask = window.ethereum
Vue.prototype.Window = window

const app = new Vue({
    store,
    render (h) {
        return h(App)
    }
}).$mount('#app')

console.log(app)
