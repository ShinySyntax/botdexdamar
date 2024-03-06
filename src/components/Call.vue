<template>
<div>
    <!-- 视频通话 -->
    <div :class="[fullState?'fullscreen':'']" >
        <div class="modelbody callercontent" v-show="callShow&&calltype==2">
        <!-- 发起方 -->
            <div class="exchange-content">
                <div class="playcontent left-big-content" @click="changeFrame">
                    <p class="calltips" v-show="!callObj.remotesrc">
                        {{callRole==2?'对方向你发起视频通话邀请...':'等待对方接听...'}}
                    </p>
                    <video id="wxCallRemoteVideo" autoplay="autoplay" playsinline v-show="callObj.remotesrc"/>
                </div>
                <div class="playcontent right-sml-content" @click="changeFrame">
                    <video id="wxCallLocalVideo" class="wxCallLocalVideo" autoplay="autoplay" muted playsinline v-show="callObj.localsrc"/>
                </div>
            </div>
            <div class="opera-content">
                <div class="opera-left">
                    <el-image  class="calleravatar" :src="callInfo&&callInfo.avatar">
                        <div slot="error" class="image-slot">
                            <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                        </div>
                    </el-image>
                    <span class="audio-nick">{{callInfo&&callInfo.nick}}</span>
                </div>
                 <!-- 接通后计时 -->
                <div class="opera-center">
                    <span class="talktime"  v-show="callObj.localsrc">{{talk.time}}</span>
                </div>
                <div class="opera-right">
                    <span v-show="!callObj.localsrc">
                        <!-- 发送方取消 -->
                        <button class="callbtn canclebtn" @click="localCancleCall" v-show="callRole==1">取消</button>
                        <!-- 接收方拒接和接听 -->
                        <button class="callbtn canclebtn"  @click="remoteRefuseVideo" v-show="callRole==2">拒绝</button>
                        <button class="callbtn agreebtn"  @click="remoteAgreeVideo" v-show="callRole==2">接听</button>
                    </span>
                    <!-- 已接通双方 -->
                    <button class="callbtn canclebtn"  @click="videoHangUp" v-show="callObj.localsrc">
                        挂断
                    </button>
                    <!-- 全屏 -->
                    <i class="iconfont iconIMweb_extend iconfull" v-show="!fullState&&callObj.localsrc"  @click="setFullScreen"></i>
                    <!-- 退出全屏 -->
                    <i class="iconfont iconIMweb_shrink iconfull"  @click="exitFullscreen" v-show="fullState&&callObj.localsrc"></i>
                </div>
            </div>
        </div>
    </div>
    <!-- 音频通话 -->
    <div class="modelbody" v-show="callShow&&calltype==1">
        <div class="audiomain">
            <el-image  class="audio-avatar" :src="callInfo&&callInfo.avatar">
                <div slot="error" class="image-slot">
                    <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                </div>
            </el-image>
            <p class="audio-nick">{{callInfo&&callInfo.nick}}</p>
            <img src="~@/assets/imgs/common/audio.png" class="audiowave"/>
            <!-- 接通后计时  -->
            <p class="call-time" v-show="callObj.remotesrc">{{talk.time}}</p>
            <p class="waiting-msg" v-show="!callObj.remotesrc">
                {{callRole==2?'对方向你发起语音通话邀请...':'等待对方接听...'}}
            </p>
            <div class="call-opera">
                <button class="callbtn canclebtn" v-show="callObj.localsrc" @click="videoHangUp">
                    挂断
                </button>
                <div v-show="!callObj.localsrc" class="loadingcall">
                    <!-- 主叫方取消音频通话 -->
                    <button class="callbtn canclebtn" v-show="callRole==1" @click="localCancleCall">
                        取消
                    </button>
                    <!-- 接收方 -->
                    <button class="callbtn canclebtn" v-show="callRole==2" @click="remoteRefuseVideo">拒绝</button>
                    <button class="callbtn agreebtn" v-show="callRole==2" @click="remoteAgreeVideo">接听</button>
                </div>
            </div>
        </div>
        <div style="display:none;">
            <audio id="wxCallRemoteAudio" autoplay="autoplay"></audio>
            <audio id="wxCallLocalAudio" autoplay="autoplay" muted></audio>
        </div>
    </div>
</div>
</template>
<script>
import { mapState,mapActions, mapMutations } from 'vuex';
import {wxCallInit,wxCallHangUp} from '@/assets/js/call';
import wsSend from '@/assets/js/ws/send';//发送消息方法
import {wscommand} from '@/assets/js/ws/command';//消息码
import {msgTips} from '@/axios/path.js';
export default {
    data(){
        return {
            wxCallLocalVideo:wxCallLocalVideo,
            wxCallRemoteVideo:wxCallRemoteVideo,
            wxCallLocalAudio:wxCallLocalAudio,
            wxCallRemoteAudio:wxCallRemoteAudio,
            
        }
    },
    computed:{
        ...mapState({
            curruser:(state)=>state.User.currUser,
            callShow:(state)=>state.Call.callShow,
            callInfo:(state)=>state.Call.callInfo,
            calltype:(state)=>state.Call.calltype,
            callObj:state=>state.Call.callObj,
            talk:state=>state.Call.talk,
            callRole:state=>state.Call.callRole,//当前会话-群聊groupid或私聊好友uid
            remoteReq:state=>state.Call.remoteReq,
            fullState:state=>state.Call.fullState
        }),
    },
    mounted(){
        this.$nextTick(()=>{
            wxCallLocalVideo = document.getElementById('wxCallLocalVideo'),
            wxCallRemoteVideo = document.getElementById('wxCallRemoteVideo'),
            wxCallLocalAudio = document.getElementById('wxCallLocalAudio'),
            wxCallRemoteAudio = document.getElementById('wxCallRemoteAudio');
        })
    },
    methods:{
        ...mapMutations(['setRemoteReq','setTalkTimer','setCallShow','setFullState','listenFull','exitFullScreen']),
        /* 接收方拒绝视频通话 */
        remoteRefuseVideo(){
            this.setRemoteReq({val:2,key:'result'});
            wsSend(wscommand.WxCall03ReplyReq, this.remoteReq);
            $(".iconvoicecall").removeClass("icon_select"); // 音频移除点击后的样式
            $(".iconVideocall").removeClass("icon_select"); // 视频移除点击后的样式 
            msgTips("通话结束");
        },
        /* 接收方同意视频通话 */
        remoteAgreeVideo(){
            wxCallInit();
            this.setRemoteReq({val:1,key:'result'});
            wsSend(wscommand.WxCall03ReplyReq, this.remoteReq);
            this.setTalkTimer();
        },
        /* 发送方取消视频通话 */
        localCancleCall(){
            wsSend(wscommand.WxCall02_1CancelReq,{});
        },
        /* 挂断视频通话 */
        videoHangUp(){
            if(this.talk.timer){
                this.talk.time='00:00';
                clearInterval(this.talk.timer);
            }
            this.setCallShow(false);
            $(".iconvoicecall").removeClass("icon_select"); // 音频移除点击后的样式
            $(".iconVideocall").removeClass("icon_select"); // 视频移除点击后的样式 
            msgTips("通话结束");
            wxCallHangUp(true, 1);
        },
        /* 远端/本地画面切换 */
        changeFrame(e){
            let current=$(e.currentTarget);
            let leftClass=current.hasClass("left-big-content");
            let rightClass=current.hasClass("right-sml-content");
            if(leftClass){
                current.removeClass("left-big-content").addClass("right-sml-content");
                current.siblings().removeClass("right-sml-content").addClass("left-big-content");
            }
            if(rightClass){
                current.removeClass("right-sml-content").addClass("left-big-content");
                current.siblings().removeClass("left-big-content").addClass("right-sml-content");
            }
        },
        /* 全屏 */
        setFullScreen(){
            this.setFullState(true);
            let elem=document.body;
            if(elem.webkitRequestFullScreen){
                elem.webkitRequestFullScreen();   
            }else if(elem.mozRequestFullScreen){
                elem.mozRequestFullScreen();
            }else if(elem.requestFullScreen){
                elem.requestFullscreen();
            }else{
                //浏览器不支持全屏API或已被禁用
                this.setFullState(false);
            }
            this.listenFull();
        },
        /* 点击退出全屏 方法 */
        exitFullscreen(){
            this.exitFullScreen();
        },
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/call.less";
</style>