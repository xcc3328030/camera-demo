import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    camera: [],
    currentStreamID: '',
    isSpreaded: false, // 平铺
    screenFull: false // 全屏
  },
  actions: {
    // 获取所有音视频输入
    GET_DEVICES ({ commit }) {
      AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.INFO)
      AgoraRTC.getDevices(function (devices) {
        let cameras = devices.filter(function (item) {
          if (item.kind === 'videoinput') {
            return true
          }
        })
        commit('SET_COMPUTER_CAMERA', JSON.parse(JSON.stringify(cameras)))
      })
    }
  },
  mutations: {
    // 设置camera
    SET_COMPUTER_CAMERA: (state, payload) => {
      state.camera = payload
    },
    // 设置currentStreamID
    SET_CURRENT_STREAM_ID: (state, payload) => {
      state.currentStreamID = payload
    },
    // 设置isSpreaded
    SET_ISSPREADED: (state, payload) => {
      state.isSpreaded = payload
      if (payload) {
        state.currentStreamID = ''
      }
    },
    // 设置screenFull
    SET_SCREEN_FULL: (state, payload) => {
      state.screenFull = payload
    }
  }
})
export default store
