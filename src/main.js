import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import "@/assets/js/plugin/elementui.js";//引入elementui
import '@/assets/style/reset.css';
import '@/assets/iconfont/iconfont.css';/* iconfont */
import "@/assets/js/plugin/protofun.js";//引入全局函数
import 'element-ui/lib/theme-chalk/index.css';
import {initWs} from '@/assets/js/ws/ws';//连接im
import tioCookie from '@/assets/js/ws/tiocookie';
import { user, msgTips, allconfigs} from "@/axios/path"
import {changeURLArgs,getQueryString,getCookie} from '@/assets/js/common.js';
Vue.config.productionTip = false

import Dialog from "@/components/Dialog";//弹框组件
Vue.component('Dialog', Dialog);
store.commit('currentPage');//监听页面激活


Vue.prototype.$bus = new Vue()

// _hmt变量上面要加 // eslint-disable-next-line 让ESLint不检测这一行代码
// eslint-disable-next-line
// ??????????????????百度统计代码注释
// const _hmt = _hmt || [];
// // eslint-disable-next-line
// window._hmt = _hmt; // 必须把_hmt挂载到window下，否则找不到
// (function () {
//   const hm = document.createElement('script');
//   hm.src = 'https://hm.baidu.com/hm.js?33826f1f45b98aa96af3a5ce4ff2e1f8';
//   const s = document.getElementsByTagName('script')[0];
//   s.parentNode.insertBefore(hm, s);
// }());

var sessionid =''
let isInitWs=true;//websocket初始化连接
let firstInTx=true;//首次进入项目
//websocket连接后请求接口,false请求，true不请求；当首次进入/home页面需请求进入会话tcp连接，此连接需要在websocket连接后请求，否则报错
var isConnect=false;
router.beforeEach(async (to, from, next) => {
	// eslint-disable-next-line
	// if (_hmt) {
	// 	if (to.path) {
	// 		// eslint-disable-next-line
	// 		_hmt.push(['_trackPageview', to.fullPath]);
	// 	}
	// }

	let toPath=to.path;
	let state=store.state;
	if(toPath=="/"){
		next({path: '/home'})
	}
    if(firstInTx){
		// 所有配置接口
		let allConfig = sessionStorage.getItem("allconfig");
		if (allConfig) {

		} else {
			var vdata = await allconfigs.getAllConfigs();
			if (vdata.ok) {
				var data =vdata.data;

				var allconfigDict = {};
				for(var i = 0; i<data.length;i++) {
					var name = data[i].name;
					var newname = name.replaceAll(".","_");
					var value = data[i].value;

					allconfigDict[newname] = value;

				}
				sessionStorage.setItem("allconfig", JSON.stringify(allconfigDict))
			}
		}
		
		//相关参数配置
		let tioConfig=sessionStorage.getItem("tiocomconfig");
		if(tioConfig){
			tioConfig=JSON.parse(tioConfig);
		}else{
			tioConfig=await store.dispatch("getComView");
		}
		$("#tiotitle").html(tioConfig.tioim_title);//标题
		$("#tiodescription").html(tioConfig.tioim_description);//meta描述
		$("#tiokeywords").html(tioConfig.tioim_keywords);//meta关键词
		var sessionName=tioConfig.session_cookie_name;
		var bs_tio_session = getQueryString("bs_tio_session");

		if (bs_tio_session) {
			console.log("sessionName1:",sessionName+state.User.currUid)
			tioCookie.set(sessionName, bs_tio_session, { expires: 15 });
			sessionid = bs_tio_session
			changeURLArgs([
				['bs_tio_session','']
			])
		}
 	}
  
	//获取当前用户
	await store.dispatch("getCurrUser");
	//更新cookie
  	tioCookie.init();
	if(store.state.User.isLogined){
    log('已登录')
    if(sessionid){
      await  user.ndapiAutologin({sessionid}).then(res=>{
          if(res.ok){
            location.reload();
          }
      })
      return
    }
	if(toPath=="/login"){
		next({path: '/home'})
    }
		//只创建一次连接
	if(isInitWs){
      log('只创建一次连接')
			initWs();//初始化ws
			isInitWs=false;
			//如果进入页面不处在首页页面，请求会话列表接口计算未读个数
			if (toPath != "/home") {
				store.dispatch("getChatRecent");
			}
			store.dispatch("getApplyData") //未通过申请添加好友个数
		}
		next();
	}else if(toPath!='/login'){
		log('未登录')

		isInitWs=true;
		if(sessionid){
		user.ndapiAutologin({sessionid}).then(res=>{
			if(res.ok){
			next({path: '/home'})
			}else{
				next({path: '/login'})
			}
		})
		return
		}
		next({path: '/login'})
	}else{
		next();
	}
})
router.afterEach((to,from)=>{
	if(firstInTx){
		//私聊\群聊音效dom
		let personaudio=document.getElementById("nofity_audio");
		let groupaudio=document.getElementById("group_audio");
		store.commit("setAudioDom",{person:personaudio,group:groupaudio});//存储音效Dom
		firstInTx=false;
	}
	
})

Vue.use(ElementUI)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
