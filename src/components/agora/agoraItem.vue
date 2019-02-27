<template>
  <span
    class="agoraItem"
    :class="{currentStream: itemStream.getId() == currentStreamID, localStream: !itemStream.remote}"
    :style="styleObject"
    :id="itemStream.getId()"
    :data-stream-id="itemStream.getId()">
  </span>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'agoraItem',
  props: ['itemStream'],
  data () {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      styleObject: {
        width: '197px',
        height: '197px'
      }
    }
  },
  computed: mapState({
    currentStreamID: 'currentStreamID'
  }),
  methods: {
  },
  mounted () {
    // 播放视频
    this.itemStream.play(this.itemStream.getId())
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style rel="stylesheet/scss" lang="scss">
.agoraItem {
  position: relative;
  z-index: 2;
  display: inline-block;
  border: 1px solid white;
  overflow: hidden!important;
  vertical-align: top;
  cursor: pointer;
  div {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .change-current-wrap {
    position: absolute;
    z-index: 2!important;
    width: 100%;
    height: 100%;
    display: none;
    color: white;
    background-color: rgba(161,161,161,0.3);
    font-size: 14px;
    letter-spacing: 3px;
    .change-current {
      margin-bottom: 6px;
      width: 40px;
      height: 40px;
    }
  }
  &:hover {
    .change-current-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
.currentStream {
  transition: all 0.2s;
  cursor: auto!important;
  position: absolute;
  z-index: 1;
  height: 100%;
  top: 0;
  right: 100%;
  border-style: none!important;
  .change-current-wrap {
    display: none!important;
  }
}
.localStream {
  transform: scaleX(-1);
}
</style>
