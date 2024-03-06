var wscommand_len = 5;
var wscommand = {
   /**
      * 心跳请求
      */
   HeartbeatReq: 1,

   /**
      * 握手请求
      */
   HandshakeReq: 2,
   /**
      * 握手响应
      */
   HandshakeResp: 3,

   /**
      * 进入群组请求
      */
   JoinGroupReq: 4,
   /**
      * 进入群组响应
      */
   JoinGroupResp: 5,

   /**
      * 进入群组通知
      */
   JoinGroupNtf: 6,

   /**
      * 离开群组通知
      */
   LeaveGroupNtf: 7,

   /**
      * 点对点聊天（私聊）请求
      */
   P2pChatReq: 8,

   /**
      * 点对点聊天（私聊）通知
      */
   P2pChatNtf: 9,

   /**
      * 群聊请求
      */
   GroupChatReq: 10,

   /**
      * 群聊通知
      */
   GroupChatNtf: 11,

   /**
     * 获取p2p聊天记录数据-请求
     */
   P2pQueryChatRecordReq: 12,

   /**
     * 运行js脚本
     */
   RunJsNtf: 14,

   /**
     * 让客户端关闭当前页面（只作用于WEB端）
     */
   ClosePage: 15,

   /**
      * 消息提示
      */
   MsgTip: 16,



   /**
     * 分页获取在线观众请求
     */
   PageOnlineReq: 18,

   /**
     * 分页获取在线观众响应
     */
   PageOnlineResp: 19,

   /**
     * 更新token
     */
   UpdateTokenReq: 20,

   /**
     * 更新token响应
     */
   UpdateTokenResp: 21,

   /**
     * 撤回消息
     */
   UnsendMsgReq: 22,

   /**
     * 撤回消息通知
     */
   UnsendMsgNtf: 23,
   /**
     * 用户动作日志
     */
   UserActionLogReq: 24,
   /**
     * 我告诉服务器，张三发给我的私聊消息已读
     */
   P2pAlreadyReadReq: 25,
	/**
	 * 服务器告诉张三，张三发给李四的私聊，李四已经阅读
	 */
   P2pAlreadyReadNtf: 26,
   /**
	 *  查询未读私聊消息数请求
	 */
   P2pRecentChatListReq: 27,
	/**
	 *  查询未读私聊消息数响应
	 */
   P2pRecentChatListResp: 28,



   //	 ----------- 下面是微信的命令码 --------------------------------------------------------------------------------

   /**
	 * Wx握手请求
	 */
   WxHandshakeReq: 599,
	/**
	 * Wx握手响应
	 */
   WxHandshakeResp: 600,

	/**
	 *  服务器通知用户"有人请求加你为好友啦"-- Server-->Client
	 */
   WxApplyFriendNtf: 601,

   /**
	 *  朋友间的聊天请求-- Client-->Server
	 */
   WxFriendChatReq: 602,

	/**
	 *  朋友间的聊天通知-- Server-->Client
	 */
   WxFriendChatNtf: 603,

	/**
	 * 获取两好友间聊天记录--请求-- Client-->Server
	 */
   WxFriendMsgReq: 604,

	/**
	 * 获取两好友间聊天记录--响应-- Server-->Client
	 */
   WxFriendMsgResp: 605,

	/**
	 * 群聊请求-- Client-->Server
	 */
   WxGroupChatReq: 606,
	/**
	 * 群聊通知-- Server-->Client
	 */
   WxGroupChatNtf: 607,

   /**
 * 已读请求： 告诉服务器，和某人的私聊信息已经阅读了
 */
   WxFriendAlreadyReadReq: 608,
	/**
	 * 已读通知： 服务器转告张三，张三发给李四的私聊，李四已经阅读
	 */
   WxFriendAlreadyReadNtf: 609,

   /**
	 * 已读请求： 告诉服务器，某群的信息已经阅读了
	 */
   WxGroupAlreadyReadReq: 610,
	/**
	 * 已读通知： 服务器转告群员，张三已经阅读过群消息（暂不实现）
	 */
   // WX_GROUP_ALREADY_READ_NTF: 611,

   /**
	 * 撤回消息请求
	 * 规则：
	 * 1、自己只能撤回两分钟以内的消息
	   2、超级管理员可以不受限制地随时随地撤回任何人的消息（前端用isSuper标识的，后端会二次检查）
	 */
   WxWithdrawMsgReq: 612,
	/**
	 * 撤回消息通知
	 */
   WxWithdrawMsgNtf: 613,

   /**
	 * 离群通知。当某用户被T出群，或群被删除时，用户会收到这个通知
    * 消息体中有个type字段，用以标示离群原因：1：主动退群；2：被T出群；3：群被删除
	 */
   WxLeaveGroupNtf: 614,

   /**
	 * 你们不是好友
	 * 你发消息给对方时，你并不是对方的好友，这时候前端提示当前用户发送申请好友请求
	 */
   WxNotFriendNtf: 615,
   
   /* 群聊消息请求 */
   WxGroupMsgReq: 620,
   /* 群聊消息响应 */
   WxGroupMsgResp:621,

   /* 操作通知 */
   WxUserOperNtf: 700,

   /* 异常通知 */
   WxFriendErrorNtf:701,
   
    /* 会话详情信息请求 */
    WxChatItemInfoReq:708,

    /* 会话详情信息响应 */
    WxChatItemInfoResp:709,

   /* 进入会话-离开会话 */
   WxSessionOperReq:710,

   /*用户系统通知*/
   WxUserSysNtf:738,
   
   /* 群操作通知(TCP) */
   WxGroupOperNtf:750,

   /* 焦点状态机请求(TCP) */
   WxFocusReq:776,

  /* 焦点刷新 */
  WxFocusRefReq:775,
  
   /* 焦点状态机通知(TCP) */
   WxFocusNtf:777,

   /* ------ webrtc start ----------- */
   /**
	 * a --> s   a向b发起通话请求
	 */
	WxCall01Req: 800,
	/**
	 * s --> b   s通知b，此时a和b要处于“占线”状态，后续呼入要直接拒绝
	 */
	WxCall02Ntf: 801,
	/**
	 * b --> s   b回复s：同意通话，或拒绝通话（拒绝原因：1、对方拒接，2、对方不在线， 3、对方占线，99、其它原因）
	 */
	WxCall03ReplyReq: 802,
	/**
	 * s --> a   s转告a
	 */
	WxCall04ReplyNtf: 803,
	/**
	 * a --> s   a向b提供offer，需要提供 sdp
	 */
	WxCall05OfferSdpReq: 804,
	/**
	 * s --> b   s转发给b
	 */
	WxCall06OfferSdpNtf: 805,
	/**
	 * b --> s   b向a回复Answer，需要提供 sdp
	 */
	WxCall07AnswerSdpReq: 806,
	/**
	 * s --> a   s转发给a
	 */
	WxCall08AnswerSdpNtf: 807,
	/**
	 * a --> s   a向b提供offer，需要提供 e.candidate
	 */
	WxCall09OfferIceReq: 808,
	/**
	 * s --> b   s转发给b
	 */
	WxCall10OfferIceNtf: 809,
	/**
	 * b --> s   b向a回复Answer，需要提供 e.candidate
	 */
	WxCall11AnswerIceReq: 810,
	/**
	 * s --> a   s转发给a
	 */
	WxCall12AnswerIceNtf: 811,
	/**
	 * a或b --> s   发起结束通话请求
	 */
	WxCall13EndReq: 812,
	/**
	 * s    --> a和b   通知结束通话，通话原因：1、对方主动挂电话；2、网络不好
	 */
   WxCall14EndNtf: 813,
   /**
	 * a    --> s   取消通话请求（a发起通话后，在对方响应前进行了取消操作）
	 */
	WxCall02_1CancelReq: 814,
	/**
	 * s    --> a&b   取消通话通知（a发起通话后，在对方响应前进行了取消操作）
	 */
   WxCall02_2CancelNtf: 815,
   /* ------ webrtc end ----------- */
   WxCallRespNtf:888,

   xxxxx: 99999
};


var formatCommand = function (command) {
   var commandstr = command + "";
   if (commandstr.length < wscommand_len) {
      var gap = wscommand_len - commandstr.length;
      var supplystr = "";
      for (var index = 0; index < gap; index++) {
         supplystr += "0";
      }

      if (command < 0) {
         commandstr = "-" + supplystr + commandstr.substring(1);
      } else {
         commandstr = supplystr + commandstr;
      }
   }
   // log("init command: " + command + ", fomatted command: " + commandstr);
   return commandstr;
};


var commandReverse = {};

for (var commandName in wscommand) {
   var commandValue = wscommand[commandName];
   commandReverse[formatCommand(commandValue)] = commandName;
}

// log(commandReverse);
export {
   wscommand_len,
   wscommand,
   formatCommand,
   commandReverse
} 
