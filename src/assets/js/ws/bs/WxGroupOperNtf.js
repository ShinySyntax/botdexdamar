/*群操作通知*/
import store from '@/store/index';
import router from '@/router/index';
import {msgTips} from '@/axios/path';
import wsSend from '@/assets/js/ws/send';
import {wscommand} from '@/assets/js/ws/command.js';
import {resUrl} from '@/assets/js/common';
var WxGroupOperNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);

    let code=bodyObj.oper;//1:删除群;2:转让群-转让;3:接受群-转让;4:群加入;5:自己退出群聊;6:被踢出群聊;9:撤回消息;10:删除消息；21:修改群名称;22:自动修改群信息

    let state=store.state,
        stateWs=state.Ws;
    let curruid=state.User.currUid;
    let {applyThis,chatList,MessageList,allNotRead,chatOn,bizId}=stateWs;

    let currpath=router.history.current.path;//当前路径
    let chatlinkid=bodyObj.chatlinkid;
    let groupid=bodyObj.g;//群聊id

    let InHome=currpath=='/home';//home页面
    let InGroup=currpath=='/group';//group页面

    let inChatOn=chatOn==chatlinkid;//处在当前消息的会话窗口
    let inGroupOn=applyThis.groupid==groupid;//处在当前群聊窗口
    let isHasChat=chatList.find(item=>item.id==chatlinkid);//会话列表是否有此聊天

    //覆盖当前会话信息
    let chatItems=bodyObj.chatItems;
    if(chatItems){
        let obj=chatList.find(item=>item.id==chatlinkid);
        if(obj){
            let keys=Object.keys(chatItems);
            $.each(keys,function(i,v){
                if(v=='avatar'){
                    chatItems[v]=resUrl(chatItems[v]);
                }
                obj[v]=chatItems[v];
            })
            if(inChatOn&&chatItems.name){
                store.commit('setChatInfoKey',{key:'name',val:chatItems.name})
            }
        }
    }

    switch(code){
        case 1:
            //1.自己删除群聊;
            if(InHome){
                if(bodyObj.grouprole==1){
                    if(isHasChat){
                        let list=[...chatList];
                        let index=list.findIndex(item=>item.id==chatlinkid);
                        list.splice(index,1);
                        store.commit("setChatList",list);
                    }
                    if(inChatOn){
                        //如果删除的会话为当前聊天界面,默认显示第一条会话
                        applyThis.$refs.chatlist.chatColClick();
                        msgTips("解散本群成功");
                    }
                    return;
                }else {
                    //2.如果在此群的群聊页面中，更新会话详情
                    if(inChatOn){
                        //获取会话详情
                        wsSend(wscommand.WxChatItemInfoReq,{chatlinkid:chatOn});
                    }
                }
            }
            if(InGroup){
                applyThis.inGroupOutGroup(bodyObj);
            }
        break;
        case 2://转让
            if(inChatOn){
                store.commit("setGroupMore",false);
            }
            if(inGroupOn){
                applyThis.$refs.groupinfo.getGroupInfo();
                applyThis.$children[1].getAllGroupList()
            }
        break;
        case 3://接收
        break;

        case 4:
            if(InHome){
                if(inChatOn){
                    store.commit("setChatInfoKey",{key:'joinnum',val:bodyObj.bizdata});
                }
            }
            if(InGroup){
                // applyThis.inGroupOutGroup(bodyObj);
            }
            break;
        case 5:
            if(InHome){
                if(isHasChat){
                    let list=[...chatList];
                    let index=list.findIndex(item=>item.id==chatlinkid);
                    list.splice(index,1);
                    store.commit("setChatList",list);
                    store.commit("setGroupMore",false);
                }
                if(inChatOn){
                    //如果删除的会话为当前聊天界面,默认显示第一条会话
                    applyThis.$refs.chatlist.chatColClick();
                    msgTips("退出群聊");
                }
            }
            if(InGroup){
                applyThis.inGroupOutGroup(bodyObj);
            }
            break;
        case 6://被踢出群聊
            //如果在此群的群聊页面中，更新会话详情
            if(InHome){
                if(inChatOn){
                    //获取会话详情
                    wsSend(wscommand.WxChatItemInfoReq,{chatlinkid:chatOn});
                    store.commit("setGroupMore",false);
                }
            }
            if(InGroup){
                applyThis.inGroupOutGroup(bodyObj);
            }
            break;
        case 9://撤回消息
            if(InHome){
                if(inChatOn){
                    let midIndex=MessageList.findIndex(item=>item.mid==bodyObj.bizdata);
                    midIndex!=-1?MessageList.splice(midIndex,1):'';
                }
            }
            break;
        case 10://删除消息
            if(InHome){
                if(inChatOn){
                    let midIndex4=MessageList.findIndex(item=>item.mid==bodyObj.bizdata);
                    midIndex4!=-1?MessageList.splice(midIndex4,1):'';
                }
                let delchatInfo=chatList.find(item=>item.id==chatlinkid);
                if(delchatInfo.lastmsgid==bodyObj.operbizdata){
                    store.commit("setIsLastMsg",true);
                    wsSend(wscommand.WxChatItemInfoReq,{chatlinkid:chatlinkid});
                }
            }
            break;
        case 21://修改群名称
            if(InHome){
                let midIndex2=chatList.findIndex(item=>item.id==bodyObj.chatlinkid);
                let name=bodyObj.bizdata;
                if(midIndex2!=-1){
                    chatList[midIndex2].name=name;
                    if(inChatOn){
                        store.commit('setChatInfoKey',{key:'name',val:name})
                    }
                }
            }
            if(InGroup){
                let groupid=bodyObj.g;
                let changeGroup=applyThis.$refs.grouplist.groupList.find(item=>item.groupid==groupid);
                if(changeGroup){
                    changeGroup.name=bodyObj.bizdata;
                }
            }
            break;
        case 22://自动修改群信息
            let bizdata=JSON.parse(bodyObj.bizdata);
            if(InHome){
                let midIndex3=chatList.findIndex(item=>item.id==bodyObj.chatlinkid);
                if(midIndex3!=-1){
                    let keys=Object.keys(bizdata);
                    $.each(keys,function(i,v){
                        if(v=='avatar'){
                            bizdata[v]=resUrl(bizdata[v]);
                        }
                        chatList[midIndex3][v]=bizdata[v];
                    })
                    if(inChatOn&&bizdata.name){
                        store.commit('setChatInfoKey',{key:'name',val:bizdata.name})
                    }
                }
            }
            if(InGroup){
                applyThis.intGroupInfo(bodyObj);
            }
        break;
    }
};
export default WxGroupOperNtf;