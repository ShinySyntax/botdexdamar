/*收到握手响应，这个时候可以开始做业务上的事了*/
import store from '@/store/index.js';
import router from '@/router/index';
import wsSend from '@/assets/js/ws/send';
import {wscommand} from '@/assets/js/ws/command.js';
var WxHandshakeResp= function (ws, event, commandName, bodyStr, bodyObj) {
	log("收到服务器消息", commandName, bodyObj);
	let stateWs=store.state.Ws;
	store.commit('setChannelContextid',bodyObj.cid);
    if(stateWs.isConnect){
		//首次进入页面为home聊天页面，页面内chatlinkid有值，请求进入home页面tcp连接
		if(stateWs.chatOn&&router.history.current.path=='/home'){
			let homeChatOn=stateWs.chatOn;
			//进入会话长连接
			wsSend(wscommand.WxSessionOperReq,{chatlinkid:homeChatOn,oper:1});
			//获取会话详情
			wsSend(wscommand.WxChatItemInfoReq,{chatlinkid:homeChatOn});
			//获取群聊消息|私聊历史消息
			let postdata={
				chatlinkid:homeChatOn,
				startmid:''
			};
			if(stateWs.isGroup){
				//群聊
				wsSend(wscommand.WxGroupMsgReq, postdata);
			}else{
				//私聊
				wsSend(wscommand.WxFriendMsgReq,postdata);
			}
		}
	}else{
		store.commit("setIsConnect",true);
	}
};
export default WxHandshakeResp;