/*
 * b执行此方法
 * a向b发起通话请求
 */
import wsSend from '@/assets/js/ws/send';//发送消息方法
import {wscommand} from '@/assets/js/ws/command';//消息码
import store from '@/store/index.js';
import {callSetSomeValue,hasAudioinput,hasVideoinput} from '@/assets/js/call';
import {resUrl} from '@/assets/js/common';
import {msgTips} from '@/axios/path.js';

var WxCall02Ntf = async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);

    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值
    
    let check = true;
    if (bodyObj.type == 1) {
        let hasaudio = await hasAudioinput();
        if (!hasaudio) {
            check = false;
        }
    }
    if (bodyObj.type == 2) {
        let hasvideo = await hasVideoinput();
        if (!hasvideo) {
            check = false;
        }
    }

    if (!check) {
        req.result = 3;  //1、同意通话；2、拒接；3、没有通话设备
        wsSend(wscommand.WxCall03ReplyReq, req);
        return;
    }
     
    store.commit('setCallType',bodyObj.type);//通话类型  1：音频；2：视频
    let friendInfo=await store.dispatch('getUserInfo',bodyObj.fromuid);//发起方信息
    store.commit('setRemoteReq',req);//接收方发送消息时的参数
    //获取发送方信息
    friendInfo.avatar=resUrl(friendInfo.avatar);
    store.commit("setCallInfo",friendInfo);
    store.commit('setCallShow',true);
    store.commit('setCallRole',2);

    wxCallLocalAudio.muted = true;//设置本地音频通话静音
};
export default WxCall02Ntf;