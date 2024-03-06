import Vue from 'vue'
import Vuex from 'vuex'
import User from '@/store/modules/user'
import Ws from '@/store/modules/ws'
import Call from '@/store/modules/call'
import CommonInfo from '@/store/modules/commonInfo'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    User,
    Ws,
    Call,
    CommonInfo
  }
})
