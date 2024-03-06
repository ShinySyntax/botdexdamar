/*用户系统通知*/
import store from '@/store/index';
import router from '@/router/index';
import {resUrl} from '@/assets/js/common';
var WxUserSysNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let code=bodyObj.code;
    let currpath=router.history.current.path;
    let storeWs=store.state.Ws;
    let {personAudio,applyThis,chatList,chatOn}=storeWs;
    //覆盖当前会话信息
    let chatItems=bodyObj.chatItems;
    if(currpath=='/home'&&chatItems){
        let chatlinkid=chatItems.id;
        let obj=chatList.find(item=>item.id==chatlinkid);
        if(obj){
            if(chatItems.avatar){
                chatItems.avatar=resUrl(chatItems.avatar);
            }
            Object.assign(obj,chatItems);
            if(chatOn==chatlinkid){//处在当前消息的会话窗口
                store.commit("setChatInfo",chatItems);
            };
        }
    }
    switch(code){
        case 30:// 申请好友请求
            store.dispatch("getApplyData");//未通过申请添加好友个数

            //没有处在申请好友列表页面-播放消息提示声音;-处在新的好友页面-更新申请列表
            if(currpath!='/friend'){
                personAudio.play();
            }else{
                let friendtype=applyThis.type;
                if(friendtype==1){
                    //申请列表
                    store.dispatch("getApplyList");
                }else{
                    personAudio.play();
                }
            }
        break;
        case 31://好友发生新增
            store.dispatch("getApplyData");//未通过申请添加好友个数
            if(currpath!='/friend'){
                personAudio.play();
            }else{
                if(applyThis.type==1){
                    //申请列表
                    store.dispatch("getApplyList");
                }
                //好友列表
                applyThis.$refs.friendlist.getFriendsList();
            }
        break;
        case 32://好友发生变更-删除
            if(currpath=='/friend'){
                //展示的好友列表是否有-当前删除的好友
                applyThis.$refs.friendinfo.$refs.usercard.afterListDelFriend((JSON.parse(bodyObj.bizdata)).frienduid);
                // applyThis.getApplyList();
                store.dispatch("getApplyList");
            }
            if(currpath=='/home'){
                //如果删除的会话为当前聊天界面,默认显示第一条会话
                applyThis.$refs.msglist.$refs.usercard.afterHomeDelFriend();
            }
            break;
        case 33://好友发生变更-信息修改
            let bizdata=JSON.parse(bodyObj.bizdata);
            if(currpath=="/friend"){
                let findFriend=applyThis.$refs.friendlist.orgFriendList.find(item=>item.uid==bizdata.frienduid);
                if(findFriend){
                    bizdata.uid=bizdata.frienduid;
                    findFriend=Object.assign(findFriend,bizdata);
                }
            }
        break;
    }
};
export default WxUserSysNtf;