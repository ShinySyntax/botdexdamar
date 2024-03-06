/*
*通话通知
*/
import store from '@/store/index.js';
var WxCallRespNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let curruser=store.state.User.currUser;
    let channelContextid=store.state.Ws.channelContextid;
    let {touid,todevice,fromuid,contextid,fromcid}=bodyObj;
    // if(touid==fromuid&&touid==curruser.id){
    //     return;
    // }
    log("contextid:" + contextid + "channelContextid:" + channelContextid);
    if(touid==curruser.id && fromcid != channelContextid && (todevice!=1|| channelContextid!=contextid )){
        store.commit('setCallShow',false);
    }
};
export default WxCallRespNtf;