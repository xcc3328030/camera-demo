<template>
  <div class="agoraComponent">
    <div class="agora-content" >
      <div class="agora-list">
        <div>
          <agora-item
            v-for="item in totalStreams"
            :itemStream="item"
            :key="item.getId()">
          </agora-item>

          <agora-item
            v-for="item in totalStreams1"
            :itemStream="item"
            :key="item.getId()">
          </agora-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import agoraDefaultConfig from '@/api/agoraAPP'
import agoraItem from './agoraItem'
export default {
  name: 'agoraComponent',
  data () {
    return {
      ifInUse: false,
      totalStreams: [], // 包含本地流
      totalStreams1: [], // 包含本地流
      camera: [],
    }
  },
  components: {
    agoraItem
  },
  computed: mapState({
    currentStreamID: 'currentStreamID'
  }),
  methods: {
    // 初始化
    init () {
      this.initClient()
      // this.initVideo()
    },
    initVideo (){
      let clientVideo = AgoraRTC.createClient({mode: 'rtc'})
      clientVideo.init(agoraDefaultConfig.key, obj => console.log(obj))
      let localStreamConfigVideo = {
        'streamID': '',
        'audio': true,
        'video': true,
        'screen': false,
        'local': true,
        'cameraId': ''
      }
      // 本地进入房间
      clientVideo.join(agoraDefaultConfig.key, '7ef27ed8e0a546ef8d7118ebce3c4f96', 0, (uid) => {
          localStreamConfigVideo['streamID'] = uid
          localStreamConfigVideo['cameraId'] = this.camera[1].deviceId
          let localStreamVideo = AgoraRTC.createStream(localStreamConfigVideo)
          localStreamVideo.setVideoProfile(agoraDefaultConfig.videoProfile)
          localStreamVideo.init(() => {
             this.totalStreams1 = []

            clientVideo.publish(localStreamVideo, suc => console.log('suc'), err => console.log('err'))
            localStreamVideo['remote'] = false
            this.totalStreams1.push(localStreamVideo)
          }, err => console.log(err))
      })
        //对方离开房间
      clientVideo.on('peer-leave', evt => {
        if(evt.stream){
            evt.stream.stop();
            $("#"+evt.stream.getId()).remove();
        }
        this.totalStreams1 = this.totalStreams1.filter(function(stream){
            return stream.getId() != evt.stream.getId()
        })
      })

      //对方离开房间
      clientVideo.on('stream-removed', evt => {
        evt.stream.stop();
        $("#"+evt.stream.getId()).remove();

        this.totalStreams1 = this.totalStreams1.filter(function(stream){
            return stream.getId() != evt.stream.getId()
        });
      });

      //对方进入房间
      clientVideo.on('stream-added', evt => {
        clientVideo.subscribe(evt.stream,err => console.log(err))
      });

      //订阅到视频流
      clientVideo.on('stream-subscribed',evt => {
        /*
        * 统计是否有远程视频进行连线，并推入到第一个流的位置，更新总流数
        * 只有正在进行状态，且在远程流进入后，才会发起start
        * 进行中状态不会发起start
        */
        evt.stream['remote'] = true;
        this.totalStreams1.unshift(evt.stream);
      })
    },
    initClient () {
        // 初始化agora
        let client = AgoraRTC.createClient({mode: 'h264_interop'})
        client.init(agoraDefaultConfig.key, obj => console.log(obj))

        // 本地进入房间
        client.join(agoraDefaultConfig.key, '123456', 0, (uid) => {
          console.log()
            let localStreamConfig = {
              'streamID': uid,
              'audio': true,
              'video': true,
              'screen': false,
              'local': true,
              'cameraId': this.camera[0].deviceId
            }
            let localStream = AgoraRTC.createStream(localStreamConfig)
            localStream.setVideoProfile(agoraDefaultConfig.videoProfile)
            localStream.init(() => {
              this.totalStreams = []
              client.publish(localStream, suc => console.log('suc111111111111111111111111'), err => console.log('err'))
              localStream['remote'] = false
              this.totalStreams.push(localStream)
            }, err => console.log(err))

            let localStreamConfig1 = {
              'streamID': uid + '1',
              'audio': true,
              'video': true,
              'screen': false,
              'local': true,
              'cameraId': this.camera[1].deviceId
            }

            let localStreamVideo = AgoraRTC.createStream(localStreamConfig1)
            localStreamVideo.setVideoProfile(agoraDefaultConfig.videoProfile)
            localStreamVideo.init(() => {
              client.publish(localStreamVideo, suc => console.log('suc2222222222222222222222222'), err => console.log('err'))
              localStreamVideo['remote'] = false
              this.totalStreams.push(localStreamVideo)
            }, err => console.log(err))
        })
      //对方离开房间
      client.on('peer-leave', evt => {
        if(evt.stream){
            evt.stream.stop();
            $("#"+evt.stream.getId()).remove();
        }

        this.totalStreams = this.totalStreams.filter(function(stream){
            return stream.getId() != evt.stream.getId()
        });
      })

      //对方离开房间
      client.on('stream-removed', evt => {
        evt.stream.stop();
        $("#"+evt.stream.getId()).remove();

        this.totalStreams = this.totalStreams.filter(function(stream){
            return stream.getId() != evt.stream.getId()
        });
      });

      //对方进入房间
      client.on('stream-added', evt => {
        client.subscribe(evt.stream,err => console.log(err))
      });

      //订阅到视频流
      client.on('stream-subscribed',evt => {
        /*
        * 统计是否有远程视频进行连线，并推入到第一个流的位置，更新总流数
        * 只有正在进行状态，且在远程流进入后，才会发起start
        * 进行中状态不会发起start
        */
        evt.stream['remote'] = true;
        this.totalStreams.unshift(evt.stream);
      });
    }
  },
  mounted () {
    AgoraRTC.getDevices(devices => {
      let cameras = devices.filter(item => {
        if (item.kind === 'videoinput') {
          return true
        }
      })
      this.camera = cameras
      this.init()
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style rel="stylesheet/scss" lang="scss">
.agoraComponent {
  position: fixed;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 788px;
  height: 100%;
  .agora-title {
    height: 50px;
    padding-left: 12px;
    display: flex;
    align-items: center;
    color: #ffffff;
    font-size: 14px;
    background: #1F364D;
    cursor: move;
    border-radius: 5px 5px 0 0;
  }
  .agora-content {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    height: 788px;
    overflow: hidden;
    flex: 1;
    .agora-exhibition {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      flex: 1;
      background: black;
      .agoraInvite {
        position: absolute;
        top: 50%;
        transform: translateY(-60%);
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #fff;
        user-select: none;
        .invite-word {
          line-height: 28px;
          color: rgba(255, 255, 255, 1);
          font-size: 20px;
          text-align: center;
          font-family: PingFangSC-Regular;
        }
        .invite-button-wrap {
          button {
            margin-top: 15px;
            width: 183px;
            height: 40px;
            border-radius: 4px;
            background: #2590FA;
            border: 0.5px solid rgba(6, 174, 166, 1);
            span {
              line-height: 20px;
              color: rgba(255, 255, 255, 1);
              font-size: 14px;
              font-family: PingFangSC-Light;
            }
          }
        }
      }
      .agoraControllers-left {
        position: absolute;
        bottom: 18px;
        z-index: 3;
        margin: inherit !important;
        width: 415px;
        height: 60px;
        display: flex;
        justify-content: space-around;
        margin-bottom: 5px;
        .icon {
          opacity: 0.8;
          width: 60px!important;
          height: 60px!important;
          cursor: pointer;
        }
      }
    }
    .agora-list {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #404040;
      #right-video-container {
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
        transition: all 0.2s;
        .spread-videos-wrapper {
          position: relative;
          z-index: 2;
          display: inline-block;
          border: 1px solid white;
          overflow: hidden!important;
          cursor: pointer;
          background-color: #4b4b4b;
          .spread-videos-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 14px;
            letter-spacing: 3px;
            cursor: pointer;
            .spread-videos {
              margin-bottom: 6px;
              width: 40px;
              height: 40px;
            }
          }
        }
      }
      .agoraControllers-right {
        position: absolute;
        z-index: 5;
        bottom: 18px;
        width: 400px;
        display: flex;
        justify-content: space-around;
        .icon {
          opacity: 0.8;
          width: 60px!important;
          height: 60px!important;
          cursor: pointer;
        }
      }
    }
    .agora-content-hover {
      position: absolute;
      z-index: 10;
      cursor: none;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
}
</style>
