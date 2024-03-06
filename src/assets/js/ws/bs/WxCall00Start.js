/**
 * @param {*} type 1、语音通话；，2、视频通话
 * @param {*} touid 想和谁通话
 */
import wsSend from '@/assets/js/ws/send';//发送消息方法
import {wscommand} from '@/assets/js/ws/command';//消息码
import store from '@/store/index.js';
import {hasAudioinput,hasVideoinput,waitHangUp} from '@/assets/js/call';
import {resUrl} from '@/assets/js/common';
import {msgTips} from '@/axios/path.js';

var WxCall00Start =  async function(type, touid) {
    if (type == 1) {
        let hasaudio = await hasAudioinput();
        if (!hasaudio) {
            $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式 
            msgTips('您没有音频设备');
            return;
        }
    }
    if (type == 2) {
        let hasvideo = await hasVideoinput();
        if (!hasvideo) {
            $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式 
            msgTips('您没有视频设备');
            return;
        }
    }
    let {wxCallMeta}=store.state.Call;
    
    if (wxCallMeta) {
        $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
        $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
        msgTips('您正在通话，请挂断后再发起新的通话');
        return;
    }
    let sendreq = {
        type: type, // 1、语音通话；，2、视频通话
        touid: touid
    };

    //获取接收方信息
    let remoteInfo=await store.dispatch('getUserInfo',touid);
    remoteInfo.avatar=resUrl(remoteInfo.avatar);

    store.commit('setCallInfo',remoteInfo);
    store.commit('setCallShow',true);//显示发送方视频弹框
    store.commit('setCallRole',1);//设置通话角色 1：发送方 2：接收方
    
    waitHangUp();//通话等待计时器
    wsSend(wscommand.WxCall01Req, sendreq);
};
export default WxCall00Start;