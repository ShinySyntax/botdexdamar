<template>
  <div class="chatlist">
    <div
      id="tioim-chat-list"
      class="tioim-chat-list"
    >
      <ul>
        <!-- 会话列表右键添加hover类，当前会话添加active类 -->
        <li
          :class="[
            'chat-col',
            contextmenushow && contextmenu.data.chatlinkid == item.id
              ? 'hover'
              : '',
            chatOn == item.id ? 'active' : '',
          ]"
          v-for="item in chatList"
          :key="item.id"
          @click="chatColClick(item)"
          @contextmenu.prevent="chatContextMenu($event, item)"
        >
          <span
            class="triangtop"
            v-show="item.topflag == 1"
          ></span>
          <el-image
            class="chat-avatar"
            :src="item.avatar"
          >
            <div
              slot="error"
              class="image-slot"
            >
              <img
                src="~@/assets/imgs/common/avatar.jpg"
                class="error-img"
              />
            </div>
          </el-image>
          <div class="chat-col-right">
            <p class="chat-info-top">
              <span class="chat-name">{{ (item.remarkname == null || item.remarkname == '') ? item.name : item.remarkname }}</span>
              <span
                class="chat-notread"
                v-if="item.notreadcount > 0&&item.msgfreeflag!=1"
              >{{
                item.notreadcount > 99 ? "..." : item.notreadcount
              }}</span>
            </p>
            <p class="chat-info-bottom">
              <span class="chat-last-msg">
                <span
                  class="msgfreeNotread"
                  v-if="item.notreadcount > 0&&item.msgfreeflag==1"
                >[{{item.notreadcount > 99 ? "..." : item.notreadcount}}条消息]</span>
                <!-- 是否已读；最后一条消息发送者为自己&&为私聊-toreadflag 1-已读；2-未读 -->
                <span
                  v-show="
                    item.sysflag&&item.sysflag == 2 &&
                      item.toreadflag &&
                      item.lastmsguid == curruid &&
                      item.chatmode == 1
                  "
                  :class="[item.toreadflag == 2 ? 'notread' : 'readed']"
                >
                  {{ item.toreadflag == 2 ? "[未读]" : "[已读]" }}
                </span>
                <span
                  v-show="item.atreadflag == 2"
                  class="notread"
                >[有人@你]</span>
                <!-- 如果为群聊，显示 昵称:内容 chatmode（1为私聊，2为群聊）sysflag（最后一条消息系统标识：1：是系统消息；2：是正常消息） -->
                <span
                  v-html="// 除了红包消息的其他群聊正常消息
                    (item.chatmode == 2 &&item.sysflag&&item.sysflag == 2 &&item.ct != 12 &&item.msgtype ==1&&item.msgresume&&item.ct != 13) || (item.ct &&
                      item.chatmode == 2 &&
                      item.msgtype == 1&&item.msgresume&&item.sysflag&&item.sysflag==2&&item.ct != 13)
                      ? item.fromnick + '：' + item.msgresume
                      : item.chatmode == 2 &&
                        item.sysflag&&item.sysflag == 2 &&
                        item.msgresume &&
                        item.ct == 12 // 正常通知红包消息
                      ? item.msgresume
                      : item.ct != 1 &&
                        item.msgtype == 12 &&
                        item.uid == item.lastmsguid // 是自己发红包
                      ? '发出红包，请在手机端查看'
                      : item.ct != 1 &&
                        item.msgtype == 12 &&
                        item.uid !== item.lastmsguid // 不是自己发红包
                      ? '收到红包，请在手机端查看'
                      : item.msgtype==88
                      ? '分享一个链接'
                      : item.msgresume
                  "
                  class="chat-last-bot"
                ></span>
              </span>
              <span
                class="chat-last-time"
                v-show="!(callShow && callInfo.id == item.bizid)"
              >{{ getShowTime(item.sendtime, "chat") }}</span>
              <i
                :class="[
                  'iconfont',
                  'rtcicon',
                  calltype == 1 ? 'iconvoicecall' : 'iconVideocall',
                ]"
                v-if="callShow && callInfo.id == item.bizid"
              ></i>
            </p>
          </div>
          <div
            class="chat-msgfree"
            v-show="item.msgfreeflag==1"
          >
            <p
              class="icon_msgfree_notread"
              v-show="item.notreadcount > 0"
            ></p>
            <img
              class="icon_msgfree"
              src="~@/assets/imgs/common/icon_msgfree.png"
              alt=""
            >
          </div>

        </li>
      </ul>
    </div>
    <!-- 会话右键操作框 -->
    <ul
      v-show="contextmenushow"
      class="contextmenu-ul"
      :style="{ top: contextmenu.top, left: contextmenu.left }"
    >
      <!-- 会话列表右键-置顶 -->
      <li @click="chatOper(contextmenu.data.topflag == 1 ? 22 : 21)">
        {{ contextmenu.data.topflag == 1 ? "取消置顶" : "置顶聊天" }}
      </li>
      <!-- 会话列表-删除聊天 -->
      <li @click="delChat">删除聊天</li>
      <!-- 会话列表-消息免打扰 -->
      <li @click="modifyGroupPush(contextmenu.data.msgfreeflag == 1 ? 2 : 1)">{{contextmenu.data.msgfreeflag==1?"取消免打扰":"消息免打扰"}}</li>
      <!-- 会话列表的群聊右键-修改群名称 -->
      <li
        @click="editGroupName(contextmenu.data)"
        v-show="contextmenu.data.bizrole == 1"
      >
        修改群名称
      </li>
    </ul>
    <!-- 修改群名称 -->
    <GroupName
      :show.sync="group.show"
      :name.sync="group.name"
      :groupid="group.groupid"
    ></GroupName>
    <!-- 删除会话 -->
    <Dialog v-show="delshow">
      <div class="modelbody delchat">
        <div class="maintitle">
          <p>确定删除该聊天吗？</p>
          <!-- <p class="smtitle">删除后，该聊天记录将被清空</p> -->
          <p class="tmcheckbox">
            <input
              type="checkbox"
              v-model="delcheck"
            />
            同时删除聊天记录
          </p>
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleDel"
          >取消</button>
          <button
            class="primarybtn"
            @click="chatOper(delcheck ? 1 : 11)"
            :disabled="loading"
          >
            确定
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex"
import { chatcom, msgTips, group } from "@/axios/path"
import { chatcoms } from "@/axios/paths"
import { defineScroll, getShowTime, setContextmenu } from "@/assets/js/common"
import wsSend from "@/assets/js/ws/send" //发送消息方法
import { wscommand } from "@/assets/js/ws/command" //消息码
import GroupName from "@/components/GroupName" //群名称弹框
import store from '@/store/index.js';
export default {
  data () {
    return {
      contextmenushow: false, //右键弹框显示状态
      contextmenu: {
        //会话列表右键
        top: 0,
        left: 0,
        data: {},
      },
      group: {
        //修改群名称
        show: false, //弹框显示状态
        name: "", //群名称
        groupid: "",
      },
      delshow: false, //删除会话
      delcheck: false, //同时删除聊天记录
      loading: false,
      time: null,
      Sec: 0
    }
  },
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid, //当前用户uid
      chatList: (state) => state.Ws.chatList, //会话列表
      chatOn: (state) => state.Ws.chatOn, //当前会话id
      bizId: (state) => state.Ws.bizId, //当前会话-群聊groupid或私聊好友uid
      allNotRead: (state) => state.Ws.allNotRead, //总未读条数
      $chatEditor: (state) => state.Ws.$chatEditor,
      callShow: (state) => state.Call.callShow,
      callInfo: (state) => state.Call.callInfo,
      calltype: (state) => state.Call.calltype,
    }),
  },
  components: {
    GroupName,
  },
  methods: {
    ...mapActions(["getChatRecent", "getChatGroupInfo"]),
    ...mapMutations([
      "setChatOn",
      "setAllNotRead",
      "setChatOldMsg",
      "initChatRoom",
      "setChatInfo",
      "setGroupMore"
    ]),
    /* 销毁聊天 */
    chatLeaveChat () {
      //操作码：1：进入会话；2：离开会话
      wsSend(wscommand.WxSessionOperReq, { chatlinkid: this.chatOn, oper: 2 })
    },
    /* 获取会话列表 */
    async getChatList () {
      await this.getChatRecent()
      this.$nextTick(() => {
        /* 会话列表自定义滚动条 */
        defineScroll($("#tioim-chat-list"), "", "", {
          mouseWheel: { scrollAmount: 200 },
        })
        /* 设置选中会话 */
        this.setCurrChat()
      })
    },
    /* 设置选中会话 */
    setCurrChat () {
      //首次进入没有指定会话，默认显示第一条会话列表的聊天界面
      let isGroup = true
      if (this.chatOn == "") {
        let topChat = this.chatList[0]
        if (topChat.chatmode == 1) {
          isGroup = false
        }
        else {
          this.getChatGroupInfo(topChat.bizid)
        }
        this.setChatOn({ chatOn: topChat.id, bizid: topChat.bizid, isGroup })
        //@状态
        if (topChat.atreadflag == 2) {
          topChat.atreadflag = 1
        }
        this.setAllNotRead(this.allNotRead - topChat.notreadcount)
        topChat.notreadcount = 0
        // this.WxfocusSetInterval(topChat.id)
      } else {
        //如果左侧会话列表有指定的会话
        let hasChat = this.chatList.find((item) => item.id == this.chatOn)
        if (hasChat) {
          this.setAllNotRead(this.allNotRead - hasChat.notreadcount) //未读消息条数
          hasChat.notreadcount = 0

          if (hasChat.chatmode == 1) {
            isGroup = false
          }
          this.setChatOn({ chatOn: this.chatOn, bizid: this.bizId, isGroup })
          // this.WxfocusSetInterval(this.chatOn)
        }
      }
      //设置聊天历史参数
      this.setChatOldMsg({
        startmid: "",
        unshift: "",
        chattype: isGroup,
        chatlinkid: this.chatOn,
      })
      this.$nextTick(() => {
        this.$chatEditor.focus()
      })
    },
    /* 会话点击事件 */
    chatColClick (item) {
      // ???定位表
      // console.log(item);
      /* 群聊 */
      this.setGroupMore(false);
      let chatList = this.chatList
      if (!item && chatList.length == 0) {
        this.setChatOn({ chatOn: "", bizid: "", isGroup: false })
        return
      }
      if (!item) {
        item = chatList[0]
      }
      //操作码：1：进入会话；2：离开会话
      wsSend(wscommand.WxSessionOperReq, { chatlinkid: this.chatOn, oper: 2 })

      let chaton = item.id
      if (chaton == this.chatOn) {
        return
      }
      this.$chatEditor.html("")
      //初始化聊天列表和图片列表
      this.initChatRoom([])
      //会话类型-是否为群聊
      let isGroup = true
      if (item.chatmode == 1) {
        isGroup = false
      }
      //当前会话at
      if (item.atreadflag == 2) {
        item.atreadflag = 1
      }
      // this.chatLeaveChat();//销毁聊天室
      //保存当前会话变量
      this.setChatOn({ chatOn: chaton, bizid: item.bizid, isGroup })

      let hasobj = chatList.find((v) => v.id == item.id)
      if (hasobj) {
        let count = this.allNotRead - hasobj.notreadcount
        this.setAllNotRead(count)
        hasobj.notreadcount = 0
      }
      //避免接收会话详情通知时间差，消息列表标题显示闪动问题，设置会话信息
      this.setChatInfo({ ...item })
      //获取会话详情
      wsSend(wscommand.WxChatItemInfoReq, { chatlinkid: chaton })
      // this.WxfocusSetInterval(chaton)
      this.$emit("getMsg")
      this.$nextTick(() => {
        this.$chatEditor.focus()
      })
    },
    /* 会话右键 */
    chatContextMenu (e, v) {
      let pos = setContextmenu(e, 130)
      this.contextmenu = {
        top: pos.otop,
        left: pos.oleft,
        data: v,
      }
      this.contextmenushow = true
      this.$setAddEventListener("contextmenushow")
    },
    /* 会话操作 */
    chatOper (oper) {
      this.loading = true
      let mesContextmenu = this.contextmenu.data
      let chatlinkid = mesContextmenu.id
      let postdata = {
        chatlinkid: chatlinkid,
        oper: oper,
      }
      chatcoms.chatOper(postdata).then((res) => {
        if (res.ok) {
          this.contextmenushow = false
          this.delshow = false
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /**消息免打扰 */
    modifyGroupPush (freeflag) {
      let mesContextmenu = this.contextmenu.data
      let data = {
        freeflag
      }
      if (mesContextmenu.chatmode == 1) {//聊天会话的模型：1：私聊；2：群聊
        data.touid = mesContextmenu.bizid
      } else {
        data.groupid = mesContextmenu.bizid
      }
      var tips = freeflag == 1 ? '开启免打扰成功' : '已关闭免打扰'
      chatcoms.msgfreeflag(data).then(res => {
        if (res.ok) {
          mesContextmenu.msgfreeflag = freeflag
          msgTips(tips)

        } else {
          msgTips(res.msg)
        }
      })
    },
    /* “删除会话”按钮点击事件 */
    delChat () {
      this.delshow = true
    },
    /* 取消-删除会话 */
    cancleDel () {
      this.delshow = false
    },
    /* 群聊名称 */
    editGroupName (v) {
      this.group.show = true
      this.group.name = v.name
      this.group.groupid = v.bizid
    },
    /* 时间 */
    getShowTime (time, type) {
      return getShowTime(time, type)
    },
    /* 焦点刷新 */
    WxfocusSetInterval (chatlinkid) {
      this.$once('hook:beforeDestroy', () => {
        // log('销毁定时器')
        clearInterval(this.time);
        this.time = null;
        this.Sec = 0
      })
      if (this.time) {
        // log('清除定时器')
        clearInterval(this.time);
        this.time = null;
        this.Sec = 0
      }
      this.time = setInterval(() => {
        this.Sec++
        // log('-+++++++++定时器in')
        // log(this.Sec)
        wsSend(wscommand.WxFocusRefReq, { chatlinkid: chatlinkid, oper: 1 })
      }, 60000)
    }
  },
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/home/chatlist.less";
</style>
