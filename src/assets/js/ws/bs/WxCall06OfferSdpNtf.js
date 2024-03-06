/*
 * b执行此方法
 * a向b提供offer，需要提供 sdp
 */
import wsSend from '@/assets/js/ws/send';//发送消息方法
import {wscommand} from '@/assets/js/ws/command';//消息码
import store from '@/store/index.js';
import {callSetSomeValue,wxCallInitPeer,wxCallIsSelfToSelf,setRemoteSrcObjWhenSelfToSelf,setLocalSrcObj,wxHandleGetUserMediaError,getTurnserver } from '@/assets/js/call';

var WxCall06OfferSdpNtf = async function (ws, event, commandName, bodyStr, bodyObj) {
    // log("收到服务器消息", commandName, bodyObj);
    let callstate=store.state.Call;

    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值

    wxCallRemotePeerConf.iceServers =await getTurnserver();
    wcCallRemotePeer = new RTCPeerConnection(wxCallRemotePeerConf);
    wxCallInitPeer(wcCallRemotePeer);

    if (wxCallIsSelfToSelf()) {//自己跟自己视频，简单粗暴点

        setRemoteSrcObjWhenSelfToSelf(bodyObj);

    } else {
        wcCallRemotePeer.setRemoteDescription(new RTCSessionDescription(bodyObj.sdp)).then(function () {
            return navigator.mediaDevices.getUserMedia({
                "audio": true,
                "video": bodyObj.type == 2
                //		 video: { facingMode: "user" } //如果有前置摄像头的话使用前置摄像头
            }).then(async function (stream) {
                setLocalSrcObj(bodyObj, stream);
                stream.getTracks().forEach(track => wcCallRemotePeer.addTrack(track, stream));

            }).then(function () {
                return wcCallRemotePeer.createAnswer();
            }).then(function (answer) {
                return wcCallRemotePeer.setLocalDescription(answer);
            }).then(function () {
                req.sdp = wcCallRemotePeer.localDescription;
                wsSend(wscommand.WxCall07AnswerSdpReq, req);
            }).catch(function (e) {
                wxHandleGetUserMediaError(e);
            });
        }).catch(function (e) {
            log('fail to setRemoteDescription: ', e);
        });
    }
};
export default WxCall06OfferSdpNtf;