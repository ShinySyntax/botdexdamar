<template>
  <div class="mainbody">
    <div class="listcontent">
      <!-- 搜索 -->
      <Search :show.sync="searchShow"></Search>
      <!-- 会话列表 -->
      <ChatList ref="chatlist" @getMsg="getMsg" v-show="!searchShow"></ChatList>
    </div>
    <!-- 消息列表 -->
    <MsgList ref="msglist"></MsgList>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import Search from "@/components/Search" //搜索
import ChatList from "@/components/home/ChatList" //会话列表
import MsgList from "@/components/home/MsgList" //消息列表
import wsSend from "@/assets/js/ws/send" //发送消息方法
import { wscommand } from "@/assets/js/ws/command.js" //消息码
export default {
  data() {
    return {
      searchShow: false, //搜索显示状态
    }
  },
  components: {
    Search,
    ChatList,
    MsgList,
  },
  computed: {
    ...mapState({
      chatOn: (state) => state.Ws.chatOn, //当前会话id
      isConnect: (state) => state.Ws.isConnect, //首次进入页面websocket是否连接完成
    }),
  },
  async created() {
    this.initChatRoom([]) //初始化imgList和MessageList
    this.initData()
  },
  async mounted() {
    await this.$refs.chatlist.getChatList() //会话列表
    //如果websocket连接完成
    if (this.isConnect && this.chatOn) {
      //获取焦点
      this.getFocus()
      //获取会话详情
      wsSend(wscommand.WxChatItemInfoReq, { chatlinkid: this.chatOn })
      this.$refs.msglist.getMsgList() //历史消息
    } else {
      this.setIsConnect(true)
    }
  },
  beforeDestroy() {
    this.initChatRoom()
    this.setChatInfo({ name: "", chatmode: 1, joinnum: 0 })
    wsSend(wscommand.WxSessionOperReq, { chatlinkid: this.chatOn, oper: 2 })
    this.setChatOn({ chatOn: "", bizid: "", isGroup: true }) //销毁前初始化参数
  },
  methods: {
    ...mapMutations([
      "initChatRoom",
      "setIsConnect",
      "setApplyThis",
      "setChatOn",
      "setChatInfo",
    ]),
    /* 初始化对象 */
    initData() {
      this.setApplyThis(this) //设置本页面的this对象
    },
    /* 焦点接口 */
    getFocus() {
      wsSend(wscommand.WxSessionOperReq, { chatlinkid: this.chatOn, oper: 1 })
    },
    /* 进入焦点及获取聊天列表 */
    getMsg() {
      //历史消息
      this.$refs.msglist.getMsgList()
      this.getFocus() //焦点接口
    },
    /* 隐藏搜索列表 */
    hideSearchList() {
      this.searchShow = false
    },
  },
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/search.less";
@import "~@/assets/style/less/home/home.less";
</style>
