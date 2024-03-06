/*异常通知*/
import store from '@/store/index.js';
import router from '@/router/index';
import {tiows} from '@/assets/js/ws/ws';
import {formatDateByTime} from '@/assets/js/common';
const WxFriendErrorNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let currpath=router.history.current.path;//当前路径 
    let errorcode=bodyObj.code,
        stateUser=store.state.User,
        stateWs= store.state.Ws,
        stateCall=store.state.Call;
    let {chatOn,allNotRead,$chatEditor,applyThis,personAudio,iscurrentpage}=stateWs;
    let {curruid,appcode,friendErrorCode,GroupErrorCode}= stateUser; //用户uid,异常码 ;好友相关错误码;群聊错误码
    let isSendByMe = bodyObj.uid == curruid; 
    //如果音视频窗口显示
    if(stateCall.callShow){
        store.commit('setCallShow',false);
    }
    bodyObj.t=formatDateByTime(bodyObj.t,'yyyy-MM-dd HH:mm:ss');//处理消息时间
    // alert(errorcode)
    switch(errorcode){
        case appcode.NOTLOGIN:
        case appcode.TIMEOUT:
        case appcode.KICKTED_PC:
            //断开心跳连接
            tiows.stop();
            location.reload();
            break;
        case friendErrorCode.SYS_ERROR_CODE:
            // alert(JSON.stringify(bodyObj))
            var msg = bodyObj.msg;
            
            var code = JSON.parse(msg).code;
            
            if (code == 101) {
                var groupid = JSON.parse(msg).groupid;
                store.commit("setGroupMsgRead", groupid);
            } else if (code == 100) {
                var isonline = JSON.parse(msg).isonline;
                var uid = JSON.parse(msg).uid;
                store.commit("setIsonlineuid", uid+"-"+isonline);
            }
            break;
        case friendErrorCode.SYS_ERROR:
        case friendErrorCode.BLACK:
        case friendErrorCode.Invalid_USER:
        case GroupErrorCode.SYS_ERROR:
        case GroupErrorCode.NO_LINK:
            //如果为好友信息异常通知&&当前为该聊天界面-将异常消息显示在页面
            if(currpath=='/home'){
                //如果有单通道sigleflag参数，sigleflag为1&&单通道uid等于当前用户id||sigleflag为2
                let sigleflag=bodyObj.sigleflag;
                if((sigleflag==1&&bodyObj.sigleuid==curruid)||sigleflag==2||!sigleflag){
                    bodyObj.singleshow=true;
                }
                store.commit("posMessage",{val:{...bodyObj,type:3,html:bodyObj.msg,noIn:true},pos:'push'});
                //如果为自己发送消息-清空输入框内容
                if(curruid==bodyObj.uid){
                    $chatEditor.html("");//清空输入内容
                }
                //自动滚动到底部
                applyThis.$refs.msglist.scrollBotm();
            }else{//处于其他页面
                store.commit("setAllNotRead",++allNotRead);//总未读条数
                personAudio.play();
                if(!iscurrentpage){
                    store.commit("setPageTitle");
                }
            }
            break;
        case friendErrorCode.NO_LINK: 
            if(currpath=='/home'&&chatOn==bodyObj.chatlinkid){
                // bodyhtml=`你还不是他(她)好友，请先发送好友验证请求，对方通过后才能聊天。<span class="sendVerif" uid="${bodyObj.uid}">发送好友验证</span>`;
                //如果有单通道sigleflag参数，sigleflag为1&&单通道uid等于当前用户id||sigleflag为2
                let sigleflag2=bodyObj.sigleflag;
                if((sigleflag2==1&&bodyObj.sigleuid==curruid)||sigleflag2==2||!sigleflag2){
                    bodyObj.singleshow=true;
                }
                store.commit("posMessage",{val:{...bodyObj,type:4,html:'你还不是他(她)好友',noIn:true},pos:'push'});

                //如果为自己发送消息-清空输入框内容
                if(curruid==bodyObj.uid){
                    $chatEditor.html("");//清空输入内容
                }
                //自动滚动到底部
                applyThis.$refs.msglist.scrollBotm();
            } else if(currpath=='/home'){//处于聊天室
                store.commit("changeChatList",bodyObj);
                
            }else{//处于其他页面
                store.commit("setAllNotRead",++allNotRead);//总未读条数
                personAudio.play();
                if(!iscurrentpage){
                    store.commit("setPageTitle");
                }
            }
        break;
    }
};
export default WxFriendErrorNtf;