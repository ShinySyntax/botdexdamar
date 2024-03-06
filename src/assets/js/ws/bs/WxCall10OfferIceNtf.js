/* 
 * b执行此方法
 * a向b提供offer，需要提供 e.candidate
 */
import store from '@/store/index.js';
import {callSetSomeValue} from '@/assets/js/call';
var WxCall10OfferIceNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    // log("收到服务器消息", commandName, bodyObj);

    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值
    req.candidate = bodyObj.candidate;
    // log("b 10", req, wcCallRemotePeer);

    if (req.candidate) {
        // wcCallRemotePeer.candidateQueue.push(req.candidate);
        if(wcCallRemotePeer){
            wcCallRemotePeer.addIceCandidate(new RTCIceCandidate(bodyObj.candidate))
            .catch(function (e) {

            });
        }
    } else {
    }

};
export default WxCall10OfferIceNtf;