<template>
  <div style="position: relative;" >
    <div v-if="type === '2'" class="verify-img-out" :style="{height: (parseInt(setSize.imgHeight) + vSpace) + 'px'}">
      <div class="verify-img-panel" :style="{width: setSize.imgWidth,height: setSize.imgHeight,}">
        <img :src="getImageFlag?'data:image/png;base64,'+backImgBase:require('@/assets/imgs/common/1.png')" alt="" style="width:100%;height:100%;display:block">
        <div class="verify-refresh" @click="refresh" v-show="showRefresh"><i class="iconfont icon-refresh"></i>
        </div>
        <transition name="tips">
          <span class="verify-tips" v-if="tipWords" :class="passFlag ?'suc-bg':'err-bg'">{{tipWords}}</span>
        </transition>
      </div>
    </div>
    <!-- 公共部分 -->
    <div class="verify-bar-area" :style="{width: setSize.imgWidth,
                                              height: barSize.height,
                                              'line-height':barSize.height}">
      <span class="verify-msg" v-text="text"></span>
      <div class="verify-left-bar" :style="{width: (leftBarWidth!==undefined)?leftBarWidth: barSize.height, height: barSize.height, 'border-color': leftBarBorderColor, transaction: transitionWidth}">
        <span class="verify-msg" v-text="finishText"></span>
        <div class="verify-move-block" @touchstart="start" @mousedown="start"
          :style="{width: barSize.height, height: barSize.height, 'background-color': moveBlockBackgroundColor, left: moveBlockLeft, transition: transitionLeft}">
          <i :class="['verify-icon iconfont', iconClass]" :style="{color: iconColor}"></i>
          <div v-if="type === '2'" class="verify-sub-block" :style="{'width':Math.floor(parseInt(setSize.imgWidth)*47/310)+ 'px',
                                  'height': setSize.imgHeight,
                                  'top':'-' + (parseInt(setSize.imgHeight) + vSpace) + 'px',
                                  'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
                                  }">
            <img :src="'data:image/png;base64,'+blockBackImgBase" alt="" style="width:100%;height:100%;display:block">
          </div>
        </div>
      </div>
    </div>
    <!-- 遮罩 -->
    <div class="mask_1" v-show="!getImageFlag">
      <div class="load-container load8">
        <div class="loader"></div>
      </div>
    </div>
  </div>
</template>
<script type="text/babel">
    /**
     * VerifySlide
     * @description 滑块
     * */
    import {aesEncrypt} from "./../utils/ase"
    import {resetSize} from './../utils/util'
    import { user } from "@/axios/path"
    export default {
        name: 'VerifySlide',
        props: {
            captchaType:{
                type:String,
            },
            type: {
                type: String,
                default: '1'
            },
            //弹出式pop，固定fixed
            mode: {
                type: String,
                default: 'fixed'
            },
            vSpace: {
                type: Number,
                default: 5
            },
            explain: {
                type: String,
                default: '向右滑动完成验证'
            },
            imgSize: {
                type: Object,
                default() {
                    return {
                        width: '310px',
                        height: '155px'
                    }
                }
            },
            blockSize: {
                type: Object,
                default() {
                    return {
                        width: '50px',
                        height: '50px'
                    }
                }
            },
            barSize: {
                type: Object,
                default() {
                    return {
                        width: '310px',
                        height: '40px'
                    }
                }
            }
        },
        data() {
            return {
                secretKey:'',        //后端返回的加密秘钥 字段
                passFlag:'',         //是否通过的标识
                backImgBase:'',      //验证码背景图片
                blockBackImgBase:'', //验证滑块的背景图片
                backToken:"",        //后端返回的唯一token值
                startMoveTime:"",    //移动开始的时间
                endMovetime:'',      //移动结束的时间
                tipsBackColor:'',    //提示词的背景颜色
                tipWords:'',
                text: '',
                finishText:'',
                setSize: {
                    imgHeight: 0,
                    imgWidth: 0,
                    barHeight: 0,
                    barWidth: 0
                },
                top: 0,
                left: 0,
                moveBlockLeft: undefined,
                leftBarWidth: undefined,
                // 移动中样式
                moveBlockBackgroundColor: undefined,
                leftBarBorderColor: '#ddd',
                iconColor: undefined,
                iconClass: 'icon-right',
                status: false,	    //鼠标状态
                isEnd: false,		//是够验证完成
                showRefresh: true,
                transitionLeft: '',
                transitionWidth: '',
                getImageFlag:false
            }
        },
        computed: {
            barArea() {
                return this.$el.querySelector('.verify-bar-area')
            },
            resetSize() {
                return resetSize
            }
        },
        methods: {
            init() {
                this.text = this.explain
                // this.getPictrue();
                this.$nextTick(() => {
                    let setSize = this.resetSize(this)	//重新设置宽度高度
                    for (let key in setSize) {
                        this.$set(this.setSize, key, setSize[key])
                    }
                    this.$parent.$emit('ready', this)
                })

                var _this = this

                window.removeEventListener("touchmove", function (e) {
                    _this.move(e);
                });
                window.removeEventListener("mousemove", function (e) {
                    _this.move(e);
                });

                //鼠标松开
                window.removeEventListener("touchend", function () {
                    _this.end();
                });
                window.removeEventListener("mouseup", function () {
                    _this.end();
                });

                window.addEventListener("touchmove", function (e) {
                    _this.move(e);
                });
                window.addEventListener("mousemove", function (e) {
                    _this.move(e);
                });

                //鼠标松开
                window.addEventListener("touchend", function () {
                    _this.end();
                });
                window.addEventListener("mouseup", function () {
                    _this.end();
                });
            },

            //鼠标按下
            start: function (e) {
                e = e || window.event
                if (!e.touches) {  //兼容PC端 
                    var x = e.clientX;
                } else {           //兼容移动端
                    var x = e.touches[0].pageX;
                }
                this.startLeft =Math.floor(x - this.barArea.getBoundingClientRect().left);
                this.startMoveTime = +new Date();    //开始滑动的时间
                if (this.isEnd == false) {
                    this.text = ''
                    this.moveBlockBackgroundColor = '#337ab7'
                    this.leftBarBorderColor = '#337AB7'
                    this.iconColor = '#fff'
                    e.stopPropagation();
                    this.status = true;
                }
            },
            //鼠标移动
            move: function (e) {
                e = e || window.event
                if (this.status && this.isEnd == false) {
                    if (!e.touches) {  //兼容PC端 
                        var x = e.clientX;
                    } else {           //兼容移动端
                        var x = e.touches[0].pageX;
                    }
                    var bar_area_left = this.barArea.getBoundingClientRect().left;
                    var move_block_left = x - bar_area_left //小方块相对于父元素的left值
                    if (move_block_left >= this.barArea.offsetWidth - parseInt(parseInt(this.blockSize.width) / 2) - 2) {
                        move_block_left = this.barArea.offsetWidth - parseInt(parseInt(this.blockSize.width) / 2) - 2;
                    }
                    if (move_block_left <= 0) {
                        move_block_left = parseInt(parseInt(this.blockSize.width) / 2);
                    }
                    //拖动后小方块的left值
                    this.moveBlockLeft = (move_block_left - this.startLeft) + "px"
                    this.leftBarWidth = (move_block_left - this.startLeft) + "px"
                }
            },

            //鼠标松开
            end: function () {
                this.endMovetime = +new Date(); 
                var _this = this;
                //判断是否重合
                if (this.status && this.isEnd == false) {
                    var moveLeftDistance = parseInt((this.moveBlockLeft || '').replace('px', ''));
                    moveLeftDistance = moveLeftDistance * 310/ parseInt(this.setSize.imgWidth)
                    let data = {
                        captchaType:this.captchaType,
                        "pointJson":this.secretKey ? aesEncrypt(JSON.stringify({x:moveLeftDistance,y:5.0}),this.secretKey):JSON.stringify({x:moveLeftDistance,y:5.0}),
                        "token":this.backToken
                    }
                    user.reqCheck(data).then(res=>{
                        if (res.ok === true) {
                            this.moveBlockBackgroundColor = '#5cb85c'
                            this.leftBarBorderColor = '#5cb85c'
                            this.iconColor = '#fff'
                            this.iconClass = 'icon-check'
                            this.showRefresh = false
                            this.isEnd = true;   
                            if (this.mode=='pop') {
                                setTimeout(()=>{
                                    this.$parent.clickShow = false;
                                    this.refresh();
                                },1500)
                            }
                            this.passFlag = true
                            this.tipWords = `${((this.endMovetime-this.startMoveTime)/1000).toFixed(2)}s验证成功`
                            var captchaVerification = this.secretKey ? aesEncrypt(this.backToken+'---'+JSON.stringify({x:moveLeftDistance,y:5.0}),this.secretKey):this.backToken+'---'+JSON.stringify({x:moveLeftDistance,y:5.0})
                            setTimeout(()=>{
                                this.tipWords = ""
                                this.$parent.closeBox();
                                this.$parent.$emit('success', {captchaVerification})
                            },1000)
                        }else{
                            this.moveBlockBackgroundColor = '#d9534f'
                            this.leftBarBorderColor = '#d9534f'
                            this.iconColor = '#fff'
                            this.iconClass = 'icon-close'
                            this.passFlag = false
                            setTimeout(function () {
                                _this.refresh();
                            }, 1000);
                            this.$parent.$emit('error',this)
                            this.tipWords = "验证失败"
                            setTimeout(()=>{
                                    this.tipWords = ""
                            },1000)
                        }
                    })
                    this.status = false;
                }
            },

            refresh: function () {
                this.showRefresh = true
                this.finishText = ''

                this.transitionLeft = 'left .3s'
                this.moveBlockLeft = 0

                this.leftBarWidth = undefined
                this.transitionWidth = 'width .3s'

                this.leftBarBorderColor = '#ddd'
                this.moveBlockBackgroundColor = '#fff'
                this.iconColor = '#000'
                this.iconClass = 'icon-right'
                this.isEnd = false

                this.getPictrue()
                setTimeout(() => {
                    this.transitionWidth = ''
                    this.transitionLeft = ''
                    this.text = this.explain
                }, 300)
            },

            // 请求背景图片和验证图片
            getPictrue(){
                let data = {
                    captchaType:this.captchaType
                }
                this.getImageFlag = false
                user.reqGet(data).then(res=>{
                    if (res.ok === true) {
                        this.getImageFlag = true
                        this.backImgBase = res.data.originalImageBase64
                        this.blockBackImgBase = res.data.jigsawImageBase64
                        this.backToken = res.data.token
                        this.secretKey = res.data.secretKey
                    }else{
                        this.tipWords = res.repMsg;
                    }
                })
            }
        },
        watch: {
            // type变化则全面刷新
            type: {
                immediate: true,
                handler() {
                    this.init()
                }
            }
        },
        mounted() {
            // 禁止拖拽
            this.$el.onselectstart = function () {
                return false
            }

        },
    }
</script>
<style lang="less" scoped>
.mask_1{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, .5);
    z-index: 1000;
}
@foreground: #fff;

.load8 .loader,
.load8 .loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}
.load8 .loader {
  margin: 60px auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(255, 255, 255, 0.2);
  border-right: 1.1em solid rgba(255, 255, 255, 0.2);
  border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
  border-left: 1.1em solid #ffffff;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}
@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>