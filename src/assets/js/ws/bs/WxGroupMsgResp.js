/* 群聊列表历史消息 */
import store from '@/store/index.js';
import {defineScroll} from '@/assets/js/common';
const WxGroupMsgResp= async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName,bodyObj);
    let storeWs=store.state.Ws,
        curruid=store.state.User.currUid,
        chatOldMsg=storeWs.chatOldMsg;

    let chatlinkid=bodyObj.chatlinkid;
    if(chatlinkid!=storeWs.chatOn){
        return;
    }
    let isSendByMe,sendtype,fromuser;
    let data=bodyObj.data;
    if(!data||data.length==0){
        defineScroll($("#msgcontainer"));
        return;
    }
    let homeThis=storeWs.applyThis;//聊天页面的this
    homeThis.$refs.msglist.chatLength=data.length;//此页消息条数
    for(let i=0;i<data.length;i++){
        let item=data[i];
        isSendByMe = item.f == curruid; 
        sendtype=2;
        if(isSendByMe){
            sendtype=1;
        }
        fromuser={nick:item.nick,avatar:item.avatar};
        if(item.sendbysys==1){
            sendtype=3;
        }
        store.commit("chatMessageCt",{bodyObj:item,fromuser,sendtype,unshift:'unshift'});//处理消息格式
    }
    //处理聊天滚动
    homeThis.$refs.msglist.privorgroup(chatOldMsg.startmid);
};
export default WxGroupMsgResp;