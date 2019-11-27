import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue'
import router from './router'
import tracking from './plugins/tracking';

Vue.config.productionTip = false

Vue.use(tracking, { router });
Vue.use(VueRouter);

new Vue({
  render: h => h(App),
  router,
  components: {App}
}).$mount('#app')
