<template>
  <div>
    <button @click="openRoom">创建房间</button>
    <div class="col-sm">
        <label id="previewLabel" class="text-white"></label>
        <video id="previewVideo" autoplay muted playsinline></video>
    </div>
    <div class="col-sm remoteVideo"></div>
  </div>
</template>

<script>
import { ZegoClient } from 'webrtc-zego'
let zg = new ZegoClient()
let appid = 1082937486
let previewVideo
let _config = {
  appid: appid * 1,
  idName: new Date().getTime() + '',
  nickName: 'u' + new Date().getTime(),
  server: 'wss://wsliveroom' + appid + '-api.zego.im:8282/ws',
  logLevel: 0,
  logUrl: '',
  remoteLogLevel: 0,
  audienceCreateRoom: true
}
let _otherConfig = {
  cgi_token: '',
  roomlist: '',
  signal: '',
  token: 'https://wsliveroom-demo.zego.im:8282/token'// "https://wsliveroom"+appid+"-api.zego.im:8282/token",
}

export default {
  name: 'App',
  data () {
    return {

    }
  },
  methods: {
    init () {
      previewVideo = $('#previewVideo')[0]
      zg.config(_config)

      this.enumDevices()
    },

    enumDevices () {
      zg.enumDevices(deviceInfo => {
        // console.log('enumDevices' + JSON.stringify(deviceInfo))
        if (deviceInfo.microphones) {
          for (let i = 0; i < deviceInfo.microphones.length; i++) {
            if (!deviceInfo.microphones[i].label) {
              deviceInfo.microphones[i].label = 'microphone' + i
            }
          }
        }

        if (deviceInfo.cameras) {
          for (let i = 0; i < deviceInfo.cameras.length; i++) {
            if (!deviceInfo.cameras[i].label) {
              deviceInfo.cameras[i].label = 'camera' + i
            }
          }
        }
      }, function (error) {
        console.error('enum device error: ' + error)
      })
    },
    openRoom () {
      let roomId = '123111145611111'
      let type = 1
      let that = this
      $.get(_otherConfig.token, {app_id: _config.appid, id_name: _config.idName, cgi_token: _otherConfig.cgi_token},
        function (token) {
          if (!token) {
            alert('get token failed')
          } else {
            console.log('gettoken success')
            that.startLogin(roomId, token, type)
          }
        }, 'text')
    },
    startLogin (roomId, token, type) {
      let that = this
      zg.login(roomId, type, token, function (streamList) {
        console.log('login success')
        that.loginSuccess(streamList, type)
      }, function (err) {
        alert('登录失败')
        console.error(err)
      })
    },
    loginSuccess (streamList, type) {
      // 开始预览本地视频
      type === 1 && this.doPreviewPublish()
    },
    doPreviewPublish () {
      let quality = 2
      var previewConfig = {
        'audio': true,
        'audioInput': 'default',
        'video': true,
        'videoInput': '4a0f3fd94f084c959c885f19652d54652dbaab04517f9066e817aa6a95307dfd',
        'videoQuality': quality * 1,
        'horizontal': true,
        'externalCapture': false,
        'externalMediaStream': null
      }
      let that = this
      console.log('previewConfig', previewConfig)
      var result = zg.startPreview(previewVideo, previewConfig, function () {
        console.log('preview success')
        that.publish()
        // 部分浏览器会有初次调用摄像头后才能拿到音频和视频设备label的情况，
        that.enumDevices()
      }, function (err) {
        alert(JSON.stringify(err))
        console.error('preview failed', err)
      })

      if (!result) alert('预览失败！')
    },
    publish () {
      zg.startPublishingStream(_config.idName, previewVideo)
    }

  },
  mounted () {
    this.init()
  }
}
</script>

    <style>
        video{
            width: 320px;
            height: auto;
        }
        .videoRow{
            margin-top: 30px;
        }
        #previewLabel{
            display: block;
            position: absolute;
        }
    </style>
