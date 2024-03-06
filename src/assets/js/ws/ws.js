import tioWsObj from '@/assets/js/ws/tiows.js';
import {wscommand_len} from '@/assets/js/ws/command.js';
import wshandler from '@/assets/js/ws/handler.js';
import tioCookie from '@/assets/js/ws/tiocookie.js';
import Axios from 'axios';
import {changeURLArgs,getQueryString} from '@/assets/js/common.js';
import store from '@/store/index.js';
let ws_protocol = 'wss'; // ws 或 wss

let ws_server;// = '127.0.0.13';
let ws_port;// = 93253;

let heartbeatTimeout = 5 * 1000; // 心跳超时时间，单位：毫秒
let reconnInterval = 3 * 1000;   // 重连间隔时间，单位：毫秒

let ws_binaryType = 'arraybuffer'; // 'blob' or 'arraybuffer';//arraybuffer是字节
let wsHandler = new wshandler();

let tiows;
let tioWs=tioWsObj.tioWs;
/**
 * 初始化websocket
 */
function initWs() {
	var param = null; 
	tiows = new tioWs(
		async function(reconn) {
			let data=await  Axios.get('/im/imserver'+process.env.VUE_APP_sufFix,{
				baseURL:process.env.VUE_APP_apiCtx,
				timeout: 5000
			}).then(resp => {
				let res=resp.data;
				if(res.ok){
          if(res.data.timeout){
            heartbeatTimeout = res.data.timeout
          }
					return res.data;
				}else{
					return null;
				}
			}).catch((error) => {
				return null;
			});
			if(!data){
				return null;
			}
			if (!wscommand_len) {
				location.reload();
			}
			// let data = resp.data;
			let state=store.state;

			ws_server = data.ip;
			ws_port = data.port;
			ws_protocol=data.ssl==1?'wss':'ws';
			let tioConfig=JSON.parse(sessionStorage.getItem("tiocomconfig"));
			var sessionName=tioConfig.session_cookie_name;
			let realSessionName = sessionName+"_"+state.User.currUid
			var _tio_session = getQueryString("tio_session");
			if (_tio_session) {
				console.log("sessionName2:",sessionName)
        tioCookie.set(sessionName, _tio_session, { expires: 15 });
        log(tioCookie.get(sessionName))
        changeURLArgs([
          ['tio_session','']
        ])
			}
			var sessionValue = tioCookie.getLast(sessionName); 
			var tesoegEgac = 'tio_access_token';
			var tesft_tio_fdfdse = tioCookie.getLast(tesoegEgac);
			var queryString = "wx=1&" + sessionName + '=' + encodeURIComponent(sessionValue);
			queryString += "&frompath=" + encodeURIComponent(window.location.pathname);
			if (tesft_tio_fdfdse) {
				queryString += '&' + tesoegEgac + '=' + encodeURIComponent(tesft_tio_fdfdse);
			}
			var url = ws_protocol + '://' + ws_server + ':' + ws_port + '?' + queryString;

			if (reconn) {
				url += '&tiows_reconnect=true';
			}
			// return url;
			return {url:url, timeout:heartbeatTimeout};
		},
		param,
		wsHandler,
		heartbeatTimeout,
		reconnInterval,
		ws_binaryType
	);
	tiows.connect();
}

export {initWs,tiows};



