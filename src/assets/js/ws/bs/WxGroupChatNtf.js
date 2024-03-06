/*群聊通知-- Server-->Client*/
import store from '@/store/index.js';
import {formatDateByTime} from '@/assets/js/common';
import router from '@/router/index';
var WxGroupChatNtf =async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let stateWs= store.state.Ws;
    let {chatOn,bizId,allNotRead,chatSofftop,groupAudio,iscurrentpage,focuskeys }=stateWs;
    let curruid=store.state.User.currUid;
    var isSendByMe = bodyObj.f == curruid;  
    let wxgroupid=bodyObj.g;
    bodyObj.t=formatDateByTime(bodyObj.t,'yyyy-MM-dd HH:mm:ss');
    let sendbysys=bodyObj.sendbysys;//是否为系统消息 1:系统消息；2:非系统消息
    //接收的消息为当前打开的聊天界面信息
    let isinChat=focuskeys.find(item=>item==bodyObj.chatlinkid);
    log('群聊通知')
    log('chatOn')
    log(chatOn)
    log('bodyObj.chatlinkid')
    log(bodyObj.chatlinkid)
    if(chatOn!=''&&chatOn==bodyObj.chatlinkid){
        var fromuser={nick:bodyObj.nick,avatar:bodyObj.avatar};
        var sendtype=2;
        if(isSendByMe){
            sendtype=1;
        }
        if(sendbysys==1){
            sendtype=3;
        }
        //处理消息格式
        store.commit("chatMessageCt",{bodyObj,fromuser,sendtype});
        //如果聊天滚动条距离底部一定距离，不滚动到底部;否则自动滚动到底部
        if($("#msgcontainer li:last").length>0){
            let botHeig=$("#msgcontainer li:last").offset().top;
            if((chatSofftop>botHeig-100)||isSendByMe){
                // scrollBotm();
                stateWs.applyThis.$refs.msglist.scrollBotm();
            }
        }
        log("群聊通知:chatOn!=''&&chatOn==bodyObj.chatlinkid")
        store.commit("changeChatList",bodyObj);
    }else if(router.history.current.path=='/home'){
        log("群聊通知:router.history.current.path=='/home'")
        store.commit("changeChatList",bodyObj);
        if(!isSendByMe&&sendbysys!=1){
            groupAudio.play();
            if(!iscurrentpage){
                store.commit("setPageTitle");
            }
        }
    }else{
        log("群聊通:总未读条数")
        if(!isinChat&&sendbysys!=1){
            store.commit("setAllNotRead",++allNotRead);//总未读条数
            groupAudio.play();
            if(!iscurrentpage){
                store.commit("setPageTitle");
            }
        }
    }
};
export default WxGroupChatNtf;