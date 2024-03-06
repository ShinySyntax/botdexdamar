//音视频通话
import wsSend from '@/assets/js/ws/send';//发送消息方法
import {wscommand} from '@/assets/js/ws/command';//消息码
import store from '@/store/index.js';
import {resUrl} from '@/assets/js/common';
import {getTurnServer,msgTips} from '@/axios/path.js';

var waitDuration=0;//等待接听的时间
var waitTimer=null;//等待接听计时器
/* 等待接听计时器函数 */
function waitHangUp(){
    waitDuration=0;
    waitTimer=setInterval(function(){
        waitDuration++;
        if(waitDuration==45){
            clearInterval(waitTimer);
            wsSend(wscommand.WxCall02_1CancelReq,{});
        }
    },1000);
}

/**
 * 结束通话类型
 */
var WxCall_Hanguptype = {
    /**
     * 正常挂断
     */
    NORMAL: 1,
    /**
     * 拒接挂断
     */
    REJECT: 2,
    /**
     * 对方正在通话
     */
    OTHER_SIDE_CALLING: 3,
    /**
     * TCP断开时，系统自动挂断
     */
    TCP_DROPPED: 4,
    /**
     * 客户端出现异常，系统自动挂机（譬如获取摄像头失败等），这个请求是客户端发起的挂断请求
     */
    CLIENT_ERROR: 5,
    /**
     * ICE服务器异常，这个请求是客户端发起的挂断请求
     */
    ICE_ERROR: 6,
    /**
     * 系统重启
     */
    SYSTEM_RESTART: 7,
    /**
     * 对方不在线
     */
    OFFLINE: 8,
    /**
     * 等待响应超时
     */
    RESP_TIMEOUT: 9,
    /* 
    *发起方取消了通话 
    */
    CANCELED:10,
    /**
     * 还没有挂断
     */
    NOT_HANGUP: 99
};

let state=store.state;
let {callObj,callShow }=state.Call;
// $(function () {
//     wxCallLocalVideo = document.getElementById('wxCallLocalVideo');
//     wxCallRemoteVideo = document.getElementById('wxCallRemoteVideo');

//     wxCallLocalAudio = document.getElementById('wxCallLocalAudio');
//     wxCallRemoteAudio = document.getElementById('wxCallRemoteAudio');
// });


/**
 * 设置本地流媒体数据
 * @param {*} bodyObj 
 * @param {*} stream 
 */
function setLocalSrcObj(bodyObj, stream) {
    if (bodyObj.type == 2) {
        wxCallLocalVideo.srcObject = stream;   //视频通话
    } else {
        wxCallLocalAudio.srcObject = stream;   //语音通话
    }
    callObj.localsrc=true;
}

/**
 * 如果是自己和自己通话（一般用于测试或娱乐）
 * @param {*} bodyObj 
 */
function setRemoteSrcObjWhenSelfToSelf(bodyObj) {
    if (bodyObj.type == 2) {
        wxCallRemoteVideo.srcObject = wxCallLocalVideo.srcObject;   //视频通话
    } else {
        wxCallRemoteAudio.srcObject = wxCallLocalAudio.srcObject;   //语音通话

        // const streamVisualizer = new StreamVisualizer(wxCallRemoteAudio.srcObject, wxCallAudiowave);
        // streamVisualizer.start();
    }
    callObj.remotesrc=true;
}

/**
 * 当前计算机是否有指定的输入设备
 * @param {*} kind 视频设备："videoinput", 音频设备："audioinput"
 */
async function hasTheInput(kind) {
    // let checking = [kind];
    let ret = false;
    await navigator.mediaDevices.enumerateDevices().then((devices) => {
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            if (device.kind == kind) {
                ret = true;
                break;
            }
        }
    }).catch(function (err) {
        log(err);
    });
    return ret;
}

/**
 * 当前计算机 是否有视频输入设备（是否有摄像头）
 */
function hasVideoinput() {
    return hasTheInput("videoinput");
}
/**
 * 当前计算机 是否有音频输入设备（是否有麦克风）
 */
function hasAudioinput() {
    return hasTheInput("audioinput");
}

/**
 * 通话资源释放
 */
function wxCallClear() {
    if (wxCallRemoteStream) {
        try {
            wxCallRemoteStream.getTracks().forEach(track => track.stop());
            wxCallRemoteStream = null;
        } catch (error) {

        }

    }


    if (wxCallLocalVideo) {
        if (wxCallLocalVideo.srcObject) {
            try {
                wxCallLocalVideo.srcObject.getTracks().forEach(track => track.stop());
                wxCallLocalVideo.srcObject = null;
            } catch (error) {
            }
        }
    }
    if (wxCallRemoteVideo) {
        try {
            if (wxCallRemoteVideo.srcObject) {
                wxCallRemoteVideo.srcObject.getTracks().forEach(track => track.stop());
                wxCallRemoteVideo.srcObject = null;
            }
        } catch (error) {
        }
    }


    if (wxCallLocalAudio) {
        if (wxCallLocalAudio.srcObject) {
            try {
                wxCallLocalAudio.srcObject.getTracks().forEach(track => track.stop());
                wxCallLocalAudio.srcObject = null;
            } catch (error) {
            }
        }
    }
    if (wxCallRemoteAudio) {
        try {
            if (wxCallRemoteAudio.srcObject) {
                wxCallRemoteAudio.srcObject.getTracks().forEach(track => track.stop());
                wxCallRemoteAudio.srcObject = null;
            }
        } catch (error) {
        }
    }

    if (wcCallLocalPeer) {
        wcCallLocalPeer.close();
        wcCallLocalPeer = null;
    }
    if (wcCallRemotePeer) {
        wcCallRemotePeer.close();
        wcCallRemotePeer = null;
    }
}

/**
 * 通话初始化
 */
function wxCallInit() {
    wxCallClear();
}

/**
 * 挂机
 * @param {*} notifyServer 是否发通知到服务器（信令服务器）
 * @param {*} hanguptype 
 */
function wxCallHangUp(notifyServer, hanguptype) {
    if (wxCallMeta) {
        var req = {};
        callSetSomeValue(req, wxCallMeta, true);
        wxCallMeta = null;  //这个一定要放在
        if (req.fromuid == state.User.currUid) {
            switch (req.hanguptype) {
                case WxCall_Hanguptype.RESP_TIMEOUT:
                    $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
                    $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
                    msgTips("对方没有应答");
                    break;
                case WxCall_Hanguptype.OTHER_SIDE_CALLING:
                    $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
                    $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
                    msgTips("对方忙线中...");
                    break;
                case WxCall_Hanguptype.OFFLINE:
                    $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
                    $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
                    msgTips("对方不在线");
                    break;
                case WxCall_Hanguptype.REJECT:
                    $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
                    $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
                    msgTips("对方已拒绝");
                    break;

                default:
                    break;
            }
        } else {
        }
        if (notifyServer/* && !wxCallIsSelfToSelf()*/) {
            req.hanguptype = hanguptype;
            wsSend(wscommand.WxCall13EndReq, req);
        }
        wxCallClear();
    }
}

/**
 * 是不是自己和自己通话
 */
function wxCallIsSelfToSelf() {
    if (wxCallMeta) {
        var ret = wxCallMeta.fromcid == wxCallMeta.tocid;
        return ret;
    }
    return false;
}

function wxCallInitPeer(peer) {
    peer.candidateQueue = new Queue(200);

    peer.ontrack = wxHandleTrackEvent;
    peer.onremovetrack = wxHandleRemoveTrackEvent;
    peer.onnegotiationneeded = wxHandleNegotiationNeededEvent;
    peer.oniceconnectionstatechange = wxHandleICEConnectionStateChangeEvent;
    peer.onicegatheringstatechange = wxHandleICEGatheringStateChangeEvent;
    peer.onsignalingstatechange = wxHandleSignalingStateChangeEvent;
    peer.onicecandidate = wxHandleICECandidateEvent;
    ////////////////
    peer.onconnectionstatechange = wxHandleConnectionStateChangeEvent;
}




function wxHandleConnectionStateChangeEvent(ev) {
    log("wxHandleConnectionStateChangeEvent----", ev.target.connectionState);
    switch (ev.target.connectionState) {
        case "connected":
            // The connection has become fully connected
            break;
        case "disconnected":
        case "failed":
            // One or more transports has terminated unexpectedly or in an error
            break;
        case "closed":
            // The connection has been closed
            break;
    }
}

/**
 * 1、浏览器会触发这个事件
 * 2、音视频发起方才会触发这个事件
 * @param {*} e 
 */
function wxHandleNegotiationNeededEvent(e) {
    log("来了，wxHandleNegotiationNeededEvent", e);
    wcCallLocalPeer.createOffer().then(function (desc) {
        return wcCallLocalPeer.setLocalDescription(desc);
    }).then(function () {
        var req = {};
        callSetSomeValue(req, wxCallMeta);
        req.sdp = wcCallLocalPeer.localDescription;
        wsSend(wscommand.WxCall05OfferSdpReq, req);
    }).catch(function (reason) {
        log('fail to createOffer: ' + reason);
    });
}

/**
 * 打开音视频时出现异常
 * @param {*} e 
 */
function wxHandleGetUserMediaError(e) {
    wxCallHangUp(true, 5);
    switch (e.name) {
        case "NotFoundError":
            msgTips("未发现音视频设备");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            msgTips("没有权限使用音视频设备");
            break;
        default:
            msgTips("打开音视频设备时出现了异常: " + e.message);
            break;
    }
    callShow=false;
}

function wxHandleTrackEvent(ev) {
    if (ev.streams && ev.streams[0]) {
        if (wxCallMeta.type == 1) {
            if (!wxCallRemoteAudio.srcObject) {
                wxCallRemoteAudio.srcObject = ev.streams[0];
            }
        } else {
            if (!wxCallRemoteVideo.srcObject) {
                wxCallRemoteVideo.srcObject = ev.streams[0];
            }
        }
    } else {
        if (!wxCallRemoteStream) {
            wxCallRemoteStream = new MediaStream();
            wxCallRemoteStream.addTrack(ev.track);
        }

        if (wxCallMeta.type == 1) {
            if (!wxCallRemoteAudio.srcObject) {
                wxCallRemoteAudio.srcObject = wxCallRemoteStream;
            }

            // const streamVisualizer = new StreamVisualizer(wxCallRemoteStream, wxCallAudiowave);
            // streamVisualizer.start();
        } else {
            wxCallRemoteVideo.srcObject = wxCallRemoteStream;
            //setVideoObj('remotesrc',wxCallRemoteVideo.srcObject);
        }
    }
    callObj.remotesrc=true;
}

function wxHandleRemoveTrackEvent(ev) {
    var stream = wxCallRemoteVideo.srcObject;
    if (stream) {
        var trackList = stream.getTracks();
        if (trackList.length == 0) {
            wxCallHangUp(false);
        }
    }
}




function addIceCandidateFromQueue(peer) {
    //先检查有没有currentRemoteDescription
    if (!peer.currentRemoteDescription || !peer.currentRemoteDescription.type) {
        log("延时一下");
        setTimeout(function () {
            addIceCandidateFromQueue(peer);
        }, 100);
        return;
    }



    while (true) {
        var candidate = peer.candidateQueue.pop();
        if (!candidate) {
            break;
        }
        peer.addIceCandidate(new RTCIceCandidate(candidate)).then(function () {
            log("addIceCandidate success", peer);
        }).catch(function (e) {
            error("addIceCandidate fail", peer, e);
        });
    }
}


function wxHandleICECandidateEvent(ev) {
    if (ev.candidate) {
    } else {
        log("All ICE candidates have been sent");
    }

    var cmd = null;
    if (ev.target == wcCallLocalPeer) {
        cmd = wscommand.WxCall09OfferIceReq;
    } else {
        cmd = wscommand.WxCall11AnswerIceReq;
    }
    var req = {};

    var req = {};
    callSetSomeValue(req, wxCallMeta);
    if (ev.candidate) {
        req.candidate = ev.candidate;
    }
    wsSend(cmd, req);
}




/**
 * ice候选人收集状态
 * @param {*} ev 
 */
function wxHandleICEGatheringStateChangeEvent(ev) {
    let peer = ev.target;
    switch (peer.iceGatheringState) {
        case "new":
            log("new new new The peer connection was just created and hasn't done any networking yet");
            break;
        case "gathering":
            log("gathering gathering gathering The ICE agent is in the process of gathering candidates for the connection");  // collection of candidates has begun
            break;
        case "complete":
            log("Candidate收集完成");
            // addIceCandidateFromQueue(peer);
            break;
    }
}

/**
 * ice服务器状态事件
 * @param {*} event 
 */
function wxHandleICEConnectionStateChangeEvent(event) {
    switch (event.target.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            log("ice服务器出问题了：" + event.target.iceConnectionState, event);
            wxCallHangUp(true, 6);
            break;
        default: //log("这里 oniceconnectionstatechange " + event.target.iceConnectionState, event);
    }
}

/**
 * 信令服务器状态事件
 * @param {*} ev 
 */
function wxHandleSignalingStateChangeEvent(ev) {
    var pc = ev.target;
    switch (pc.signalingState) {
        case "closed":
            wxCallHangUp(true, 4);
            break;
    }
};


/**
 * 获取turnserver
 */
var getTurnserver = async function () {
   /*  var cacheName = "/im/turnserver";
    var key = "x";
    var exp = 10;
    return getWithCache(cacheName, key, exp, function () {
        var data = null;
        ajax.get(cacheName, {
            data: {},
            async: false,
            success: function (res) {
                if (res.ok) {
                    data = res.data;
                }
            }
        });
        return data;
    }); */
    let data=await getTurnServer();
    return data;
}


/**
 * 设置一些属性值
 * @param {*} req 
 * @param {*} ntf 
 */
function callSetSomeValue(req, ntf, setAll) {
    if (!ntf) {  //ntf可能被清空了
        return;
    }

    req.id = ntf.id || null;
    if (setAll) {
        req.type = ntf.type || null;
        req.status = ntf.status || null;
        req.result = ntf.result || null;
        req.calltime = ntf.calltime || null;
        req.resptime = ntf.resptime || null;
        req.connectedtime = ntf.connectedtime || null;
        req.endtime = ntf.endtime || null;
        req.waitduration = ntf.waitduration || null;
        req.callduration = ntf.callduration || null;
        req.hanguptype = ntf.hanguptype || null;
        req.hangupuid = ntf.hangupuid || null;
        req.fromuid = ntf.fromuid || null;
        req.fromcid = ntf.fromcid || null;
        req.fromipid = ntf.fromipid || null;
        req.fromdevice = ntf.fromdevice || null;
        req.touid = ntf.touid || null;
        req.tocid = ntf.tocid || null;
        req.toipid = ntf.toipid || null;
        req.todevice = ntf.todevice || null;
        req.errorcode = ntf.errorcode || null;
        req.streamwait = ntf.streamwait || null;
        req.errorcode = ntf.errorcode || null;
        req.errorcode = ntf.errorcode || null;
    }

    wxCallMeta = ntf;
}
/**
 * 一个简单的队列
 */
function Queue(size) {
    var list = [];

    //向队列中添加数据
    this.push = function (data) {
        if (data == null) {
            return false;
        }
        //如果传递了size参数就设置了队列的大小
        if (size != null && !isNaN(size)) {
            if (list.length == size) {
                this.pop();
            }
        }
        list.unshift(data);
        return true;
    }

    //从队列中取出数据
    this.pop = function () {
        return list.pop();
    }

    //返回队列的大小
    this.size = function () {
        return list.length;
    }

    //返回队列的内容
    this.quere = function () {
        return list;
    }
}

export {
    waitHangUp,
    setLocalSrcObj,
    setRemoteSrcObjWhenSelfToSelf,
    waitTimer,
    hasTheInput,
    hasVideoinput,
    hasAudioinput,
    wxCallClear,
    wxCallInit,
    wxCallHangUp,
    wxCallIsSelfToSelf,
    wxCallInitPeer,
    wxHandleConnectionStateChangeEvent,
    wxHandleNegotiationNeededEvent,
    wxHandleGetUserMediaError,
    wxHandleTrackEvent,
    wxHandleRemoveTrackEvent,
    addIceCandidateFromQueue,
    wxHandleICECandidateEvent,
    wxHandleICEGatheringStateChangeEvent,
    wxHandleICEConnectionStateChangeEvent,
    wxHandleSignalingStateChangeEvent,
    getTurnserver,
    callSetSomeValue,

}