import Vue from 'vue'
import Router from 'vue-router'
import ChatBox from '../components/ChatBox.vue'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'ChatBox',
      component: ChatBox
    }
  ]
})


