var wcCallLocalPeer = null;  //通话发起方的RTCPeerConnection
var wcCallRemotePeer = null; //通话对方的RTCPeerConnection

var wxCallLocalAudio = null;  //本地音频
var wxCallRemoteAudio = null; //对端音频

var wxCallLocalVideo = null;  //本地音视频
var wxCallRemoteVideo = null; //对端音视频

var wxCallRemoteStream = null;  //远端音视频

//透传的元数据
var wxCallMeta = null;

var wxCallLocalPeerConf = {
};
var wxCallRemotePeerConf = {
};