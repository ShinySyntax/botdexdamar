const state={
    callObj:{//视频通话-video是否srcObject有值，默认为有值为接通状态
        localsrc:false,
        remotesrc:false
    },

    callInfo:null,//发送者||接受者信息
    remoteReq:{},//接收方发送同意tcp请求的传参
    callRole:1,//1:发送方 ；2：接受方
    fullState:false,//是否处于全屏状态
    talk:{//音视频通话
        time:'00:00',//时长
        timer:''//计时器
    },
    calltype:1,//1:音频通话；2：视频通话
    callShow:false,//音视频通话弹框显示状态
};
const mutations={
    setCallInfo(state,val){
        state.callInfo=val;
    },
    //设置音视频弹框是否显示
    setCallShow(state,val){
        state.callShow=val;
    },
    //设置音视频通话角色
    setCallRole(state,val){
        state.callRole=val;
    },
    //设置音视频通话类型
    setCallType(state,val){
        state.calltype=val
    },
    //设置视频通话全屏状态
    setFullState(state,val){
        state.fullState=val;
    },
    //设置视频通话接听发送tcp请求时传参
    setRemoteReq(state,obj){
        if(obj.key){
            state.remoteReq[obj.key]=obj.val; 
        }else{
            state.remoteReq=obj;
        }
    },
    //重设通话状态
    resetCallObj(state){
        state.callObj.localsrc=false;
        state.callObj.remotesrc=false;
    },
    /* 退出全屏 */
    exitFullScreen(state){
        state.fullState=false;
        // $(window).unbind();
        var elem=document;
        if(elem.webkitCancelFullScreen){
            elem.webkitCancelFullScreen();    
        }else if(elem.mozCancelFullScreen){
            elem.mozCancelFullScreen();
        }else if(elem.cancelFullScreen){
            elem.cancelFullScreen();
        }else if(elem.exitFullscreen){
            elem.exitFullscreen();
        }else{
            //浏览器不支持全屏API或已被禁用
        }
        this.commit('removeListen');
    },

    /* 监听esc退出全屏-浏览器全屏状态下esc键盘监听不到-使用resize监听事件判断浏览器退出全屏 */
    listenFull(){
        let _this=this;
        $(window).on("resize",function(){
            var isFull = document.webkitIsFullScreen|| window.fullScreen;
            if (isFull === undefined){
                isFull = false;
            }
            if (!isFull) {
                //触发esc事件，退出全屏事件。
                _this.commit('exitFullScreen');
            }
        })
    },
    /* 卸载监听浏览器resize */
    removeListen(){
        $(window).unbind("resize");
    },
    /* 通话成功开启计时器 */
    setTalkTimer(state){
        let hour = 0, minute = 0, second = 0;
        let t = 0;
        if(state.talk.timer){
            state.talk.time='00:00';
            clearInterval(state.talk.timer);
        }
        state.talk.timer=setInterval(function(){
            hour=Math.floor(t/60/60);
            minute=Math.floor(t/60%60);
            second=Math.floor(t%60);
            if(minute<10){
                minute = "0" + minute;
            }
            if(second<10){
                second = "0" + second;
            }
            state.talk.time=minute+":"+second;
            t = t + 1;
        },1000);
    },
};
export default {
    state,
    mutations
}