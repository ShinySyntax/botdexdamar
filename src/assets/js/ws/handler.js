import {wscommand,wscommand_len,commandReverse} from '@/assets/js/ws/command.js';
import pako from 'pako';
import * as wsBs from '@/assets/js/ws/bs';
import wsSend from '@/assets/js/ws/send';
import store from '@/store/index.js';
import router from '@/router/index';
var wshandler = function() {
	var self = this;

	this.closed=false;//websocket是否断连
	this.onopen = function(event, ws) {
		//websocket重连后处在会话页面-获取焦点
		if(this.closed&&router.history.current.path=="/home"){
			log("websocket重连后处在会话页面-获取焦点");
			store.state.Ws.applyThis.getFocus();
			this.closed=false;
		}
		// siteim.joinGroup();
	};

	/**
   * 收到服务器发来的消息
   * @param {*} event 
   * @param {*} ws 
   */
	this.onmessage = function(event, ws) {
		var arrayBuffer = event.data;

		// log('receive data: ', arrayBuffer, ws)
		var uint8array = null;
		var firstbyte = new Uint8Array(arrayBuffer, 0, 2);
		var firstchar = new TextDecoder('utf-8').decode(firstbyte);
		var isZipped = false;
		var isZippedStr = '';
		if (firstchar.indexOf('x') != -1) {
			// 压缩过的
			isZipped = true;
			isZippedStr = '(zipped)';
			var zipedUint8array = new Uint8Array(arrayBuffer, 2);
			uint8array = pako.ungzip(zipedUint8array);
		} else {
			uint8array = new Uint8Array(arrayBuffer);
		}

		var data = new TextDecoder('utf-8').decode(uint8array);
		// log('receive data' + isZippedStr + ': ' + data)

		if (!data || data.length < wscommand_len) {
			error('data wrong' + isZippedStr + ', the data length must be >= ' + wscommand_len, data);
			return;
		}

		var commandstr = data.substr(0, wscommand_len);

		var commandName = commandReverse[commandstr];
		if (!commandName) {
			info('commandstr is ' + commandstr + isZippedStr + ', but con not find commandName');
			return;
		}

		// var bshandler = bs[commandName];
		var bshandler = wsBs[commandName]//window[commandName];
		if (!bshandler) {
			info('can not found wx_handler, command is ' + commandName + isZippedStr);
			return;
		}

        var bodyStr = null;
        var bodyObj = null;
		if (data.length > wscommand_len) {
			bodyStr = data.substr(wscommand_len);
			log('received:' + commandName + isZippedStr + '\r\n, body string is :' + bodyStr);
			try {
				bodyObj = JSON.parse(bodyStr);
			} catch (err) {
				error(
					'can not parse to object, commandName is ' +
						commandName +
						isZippedStr +
						', body string is ' +
						bodyStr
				);
				return;
			}
		}
		bshandler.call(bshandler, ws, event, commandName, bodyStr, bodyObj);


		//
	};

	this.onclose = function(e, ws) {
		this.closed=true;//websocket是否断连
		// error(e, ws)
	};

	this.onerror = function(e, ws) {
		// error(e, ws)
	};

	/**
   * 发送心跳，本框架会自动定时调用该方法，请在该方法中发送心跳
   * @param {*} ws 
   */
	this.ping = function(ws) {
		wsSend(wscommand.HeartbeatReq, null);
	};
};
export default wshandler;
