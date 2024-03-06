/*焦点状态机通知-- Server-->Client*/
import store from '@/store/index.js';
var WxFocusNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    //处理同一用户多端进入不同会话
    let focusMap=bodyObj.focusMap;
    let focuskeys=Object.keys(focusMap);
    store.commit('setFocusKeys',focuskeys);
    let storeWs=store.state.Ws;
    let {chatList,allNotRead,chatOn}=storeWs;
    focuskeys.map(item=>{
        if(focusMap[item]==1&&chatOn!=item){
            let chatcol=chatList.find(v=>v.id==item);
            if(chatcol){
                if(chatcol.atreadflag==2){
                    chatcol.atreadflag=1;
                }
                store.commit("setAllNotRead",allNotRead-chatcol.notreadcount);//总未读条数
                chatcol.notreadcount=0;
               
            }
        }
    })
};
export default WxFocusNtf;