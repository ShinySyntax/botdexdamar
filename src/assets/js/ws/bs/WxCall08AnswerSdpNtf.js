/*
 * a执行此方法
 * b向a回复Answer，需要提供 sdp
 */
import store from '@/store/index.js';
import {callSetSomeValue} from '@/assets/js/call';
var WxCall08AnswerSdpNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    // log("收到服务器消息", commandName, bodyObj);
    /* let callstate=store.state.Call;
    let {wcCallLocalPeer}=callstate; */

    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值
    req.sdp = bodyObj.sdp;

    var sessionDescription = new RTCSessionDescription(bodyObj.sdp);
    wcCallLocalPeer.setRemoteDescription(sessionDescription, function () {
        log("setRemoteDescription success");
    }, function () {

    });
};
export default WxCall08AnswerSdpNtf;