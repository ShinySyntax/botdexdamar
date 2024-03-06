/*操作通知*/
import router from '@/router/index';
import store from '@/store/index.js';
import wsSend from '@/assets/js/ws/send';
import {wscommand} from '@/assets/js/ws/command.js';
import {formatDateByTime,resUrl} from '@/assets/js/common';
import {chatcom} from '@/axios/path';
var WxUserOperNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    //opera操作码：1:删除聊天会话；2：拉黑；3：恢复拉黑；4：激活通知；5：删除好友通知；7：好友已读通知；8：清空聊天通知 9:撤回消息 10:删除消息 21:置顶聊天 22:取消置顶 25：消息免打扰
    var oper=bodyObj.oper;
    let state=store.state,
        stateWs=state.Ws;
    let curruid=state.User.currUid;
    let {applyThis,chatList,chatinfo,MessageList,allNotRead,chatOn,bizId,chatInfo}=stateWs;
    let currpath=router.history.current.path;//当前路径
    let chatlinkid=bodyObj.chatlinkid;
    let inChatOn=chatOn==chatlinkid;//处在当前消息的会话窗口
    //覆盖当前会话信息
    let chatItems=bodyObj.chatItems;
    switch(oper){
        case 1:
        case 5:
        case 11:
            let chat=chatList.find(item=>item.id==chatlinkid);
            if(currpath=='/home'){
                if(chat){
                    let list=[...chatList];
                    let index=list.findIndex(item=>item.id==chatlinkid);
                    list.splice(index,1);
                    store.commit("setChatList",list);
                    //如果删除的会话为当前聊天界面,默认显示第一条会话
                    if(inChatOn){
                        applyThis.$refs.chatlist.chatColClick();
                    }
                }
            }
            if(chat){
                //未读消息条数
                let notread=allNotRead-chat.notreadcount;
                store.commit('setAllNotRead',notread);
            }
            break;
        case 4:
            bodyObj.t=formatDateByTime(bodyObj.t,'yyyy-MM-dd HH:mm:ss');
             //激活通知并且处于聊天室页面，手动添加处理左侧会话列表
            if(currpath=='/home'&&$("#tioim-chat-list").length>0){
                store.commit("changeChatList",bodyObj);
            }
            break;
        case 7:
            if(bizId==curruid){//当前与自己会话
                return;
            }
            //如果处在当前聊天界面-将消息列表中所有未读改成已读状态
            if(inChatOn){
                if(chatInfo.chatmode==1){//判断当前会话是否为私聊-chatmode聊天类型：1私聊，2群聊
                  // 会话列表循环已读，请求已读接口，判断是否为私聊==2如果是设置成已读
                    MessageList.map(item=>{
                        if(item.readflag==2){
                            item.readflag=1;
                        }
                    });
                    chatcom.chatReadAck({chatlinkid}).then(res=>{
                        if(res.ok){
                          log(res)
                        }else{
                          msgTips(res.msg||'系统错误');
                        }
                    })
                }
            }
            if(currpath=='/home'){//如果处在聊天室界面，将会话列表的最后一条状态进行修改
                chatList.map(item=>{
                    if(item.id==chatlinkid&&item.toreadflag==2){
                        item.toreadflag=1;
                    }
                });
            }
            break;
        case 9:
            if(inChatOn){
                let midIndex=MessageList.findIndex(item=>item.mid==bodyObj.operbizdata);
                midIndex!=-1?MessageList.splice(midIndex,1):'';
            }
            break;
        case 10://删除消息
            if(inChatOn){
                let midIndex2=MessageList.findIndex(item=>item.mid==bodyObj.operbizdata);
                midIndex2!=-1?MessageList.splice(midIndex2,1):'';
            }
            let delchatInfo=chatList.find(item=>item.id==chatlinkid);
            if(delchatInfo.lastmsgid==bodyObj.operbizdata){
                // mutations.setFromDelMsg(true);
                wsSend(wscommand.WxChatItemInfoReq,{chatlinkid:chatlinkid});
            }
            break;
        case 21://置顶聊天
            let topChatIndex=chatList.findIndex(item=>item.id==chatlinkid);
            if(topChatIndex==-1){
                return;
            }
            chatList[topChatIndex].topflag=1;
            if(topChatIndex!=0){
                let thiscol=chatList.splice(topChatIndex,1);
                chatList.splice(0, 0, thiscol[0]);
            }
            break;
        case 22://取消置顶
            let cancleChatIndex=chatList.findIndex(item=>item.id==chatlinkid);
            if(cancleChatIndex==-1){
                return;
            }
            let topNum=0;
            $.each(chatList,function(index,item){
                if(item.topflag==1){
                    topNum++;
                }
            });
            chatList[cancleChatIndex].topflag=2;
            let col=chatList.splice(cancleChatIndex,1);
            chatList.splice(topNum-1, 0, col[0]);
            break;
        case 25://消息免打扰
            let freeChatIndex=chatList.findIndex(item=>item.chatlinkid==chatlinkid);
            if(freeChatIndex==-1){
                return;
            }
            let msgfreeflag = bodyObj.chatItems.msgfreeflag;
            chatList[freeChatIndex].msgfreeflag = msgfreeflag;
            break;
        } 
        if(currpath=='/home'&&chatItems){
            let obj=chatList.find(item=>item.id==chatItems.id);
            if(obj){
                if(chatItems.avatar){
                    chatItems.avatar=resUrl(chatItems.avatar);
                }
                Object.assign(obj,chatItems);
                if(inChatOn){
                    store.commit("setChatInfo",chatItems);
                }
            }
        }
};
export default WxUserOperNtf;