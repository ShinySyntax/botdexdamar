/*朋友聊天通知-- Server-->Client*/
import store from '@/store/index.js';
import {formatDateByTime} from '@/assets/js/common';
import router from '@/router/index';
var WxFriendChatNtf =async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let stateWs= store.state.Ws;
    let {chatOn,allNotRead,chatSofftop,personAudio,iscurrentpage,focuskeys}=stateWs;
    let curruid=store.state.User.currUid;//当前用户id
    let currpath=router.history.current.path;//当前路径
    let bodytouid=bodyObj.touid,//接收方userid
        bodyuid=bodyObj.uid;//发送方userid
    var isSendByMe = bodyuid == curruid;  //true: 是我发给别人的；fase：是别人发给我的
    var fromuser = {avatar:bodyObj.avatar,nick:bodyObj.nick};//发送人的信息
    bodyObj.t=formatDateByTime(bodyObj.t,'yyyy-MM-dd HH:mm:ss');
    let sendbysys=bodyObj.sendbysys;//是否为系统消息 1:系统消息；2:非系统消息
    //处于home聊天室页面并且处于当前聊天对话
    let isinChat=focuskeys.find(item=>item==bodyObj.chatlinkid);
    log('朋友聊天通知')
    log('chatOn')
    log(chatOn)
    log('bodyObj.chatlinkid')
    log(bodyObj.chatlinkid)
    if(chatOn!=''&&chatOn==bodyObj.chatlinkid){
        //sendtype  1:自己发送-显示在聊天右侧  2：好友发送-显示聊天左侧  3：系统消息 -显示在中间
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
                stateWs.applyThis.$refs.msglist.scrollBotm();
            }
        }
        log("朋友聊天通知:chatOn!=''&&chatOn==bodyObj.chatlinkid")
        store.commit("changeChatList",bodyObj);
    }else if(currpath=='/home'){
        log("朋友聊天通知:currpath=='/home'")
        store.commit("changeChatList",bodyObj);
        if(!isSendByMe&&sendbysys!=1&&!isinChat){
            personAudio.play();
            if(!iscurrentpage){
                store.commit("setPageTitle")
            }
        }
    }else{
        log("朋友聊天通知:总未读条数")
        if(!isSendByMe&&sendbysys!=1&&!isinChat){
            store.commit("setAllNotRead",++allNotRead);//总未读条数
            personAudio.play();
            if(!iscurrentpage){
                store.commit("setPageTitle")
            } 
        }
    }
};
export default WxFriendChatNtf;
