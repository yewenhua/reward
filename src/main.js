import Vue from 'vue'
import App from './App'
import axios from './utils/http'

Vue.config.productionTip = false
Vue.prototype.axios = axios;

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
