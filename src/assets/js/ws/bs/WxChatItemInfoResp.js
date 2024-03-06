/* 会话详情 */
import store from '@/store/index.js';
import router from '@/router/index';
import {resUrl} from '@/assets/js/common';
const WxChatItemInfoResp=function(ws, event, commandName, bodyStr, bodyObj){
    // state.chatinfo=res.data;
    log("收到服务器消息", commandName,bodyObj);
    let storeWs=store.state.Ws;
    let {chatOn,chatList,islastmsg}=storeWs;
    let chatlinkid=bodyObj.chatlinkid;
    bodyObj.data.avatar=resUrl(bodyObj.data.avatar);
    if(islastmsg){
        store.commit("setIsLastMsg",false);
        let delchatInfo=chatList.find(item=>item.id==chatlinkid);
        if(delchatInfo){
            let data=bodyObj.data;
            Object.assign(delchatInfo,{msgresume:data.msgresume,toreadflag:data.toreadflag,lastmsgid:data.lastmsgid});
        }
    }
    
    if(chatlinkid!=chatOn){
        return;
    }
    store.commit('setChatInfo',bodyObj.data);
};
export default WxChatItemInfoResp;