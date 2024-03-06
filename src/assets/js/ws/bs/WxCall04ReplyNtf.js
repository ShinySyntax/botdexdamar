/*
 * a执行此方法
 * b回复a：同意通话，或拒绝通话（拒绝原因：1、对方拒接，2、对方不在线， 3、对方占线，99、其它原因）
 */
import store from '@/store/index.js';
import {waitTimer,callSetSomeValue,wxCallInit,getTurnserver,setLocalSrcObj,wxHandleGetUserMediaError,wxCallInitPeer} from '@/assets/js/call';
import {msgTips} from '@/axios/path';
var WxCall04ReplyNtf = async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let callstate=store.state.Call;
    /* let {wxCallLocalPeerConf,wcCallLocalPeer,wxCallLocalAudio}=callstate; */
    clearInterval(waitTimer);//清除等待计时器
    var req = {};
    if (bodyObj.result == 1) {  //b同意通话
        callSetSomeValue(req, bodyObj);  //透传填值
        wxCallInit();
        wxCallLocalPeerConf.iceServers = await getTurnserver();

        wcCallLocalPeer = new RTCPeerConnection(wxCallLocalPeerConf);
        wxCallInitPeer(wcCallLocalPeer);

        navigator.mediaDevices.getUserMedia({
            "audio": true,
            "video": bodyObj.type == 2
            //		 video: { facingMode: "user" } //如果有前置摄像头的话使用前置摄像头
        }).then(async function (stream) {

            setLocalSrcObj(bodyObj, stream);
            stream.getTracks().forEach(track => wcCallLocalPeer.addTrack(track, stream));
            
        }).catch(function (e) {
            wxHandleGetUserMediaError(e);
        });
        store.commit('setTalkTimer');//执行通话计时器
        wxCallLocalAudio.muted = true;//设置本地音频通话静音
    } else {  //不同意通话，或者其它原因导致的不能通话
        msgTips(bodyObj.reason);
    }
};
export default WxCall04ReplyNtf;