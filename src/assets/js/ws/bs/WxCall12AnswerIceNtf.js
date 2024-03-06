/*
 * a执行此方法
 * b向a回复Answer，需要提供 e.candidate
 */
import store from '@/store/index.js';
import {callSetSomeValue} from '@/assets/js/call';

var WxCall12AnswerIceNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    // log("收到服务器消息", commandName, bodyObj);
   /*  let callstate=store.state.Call;
    let {wcCallLocalPeer}=callstate;
 */
    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值
    req.candidate = bodyObj.candidate;
    log("a 12", req, wcCallLocalPeer);

    if (req.candidate) {
        // wcCallLocalPeer.candidateQueue.push(req.candidate);

        wcCallLocalPeer.addIceCandidate(new RTCIceCandidate(bodyObj.candidate))
            .catch(function (e) {

            });

    } else {
        // addIceCandidateFromQueue(wcCallLocalPeer);
    }
};
export default WxCall12AnswerIceNtf;