<template>
  <div>
    <!-- 个人名片弹框 -->
    <div
      class="friendcard"
      v-show="show"
      :style="{top:userCard.top,left:userCard.left}"
      @click.stop="stopProp"
    >
      <div
        class="user-info-top flexbox"
        @click.stop="hideEditIpt"
      >
        <div class="top-left">
          <p
            v-show="userCard.isfriend&&!showRemark"
            class="user-name"
            @click.stop="showEditIpt"
          >
            <span class="overell">{{userCard.data.remarkname||userCard.data.nick}}</span>
            <i
              class="iconfont iconttubiao_bianji"
              v-show="curruid!=userCard.data.id"
            ></i>
          </p>
          <p
            class="user-name"
            v-show="!userCard.isfriend"
          >{{userCard.data.nick}}</p>
          <div
            class="edit-name"
            v-show="showRemark"
            @click.stop="stopProp"
          >
            <input
              type="text"
              v-model="userremark"
              maxlength="30"
              placeholder="请输入备注名"
              @mouseup.stop="stopProp"
            />
            <span
              class="edit-sure"
              @click="sureSaveRemark"
            >
            </span>
          </div>
        </div>
        <el-image
          class="user-avatar"
          :src="userCard.data.avatar"
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
      </div>
      <div @click.stop="hideEditIpt">
        <div
          class="user-info-center"
          v-show="userCard.isfriend"
        >
          <label class="flexshrink">昵称</label>
          <span class="overell">{{userCard.data.nick}}</span>
        </div>
        <div class="user-info-center">
          <label>地区</label>
          <span>{{userCard.data.province?userCard.data.province:''}}
            {{userCard.data.city?userCard.data.city:''}}</span>
        </div>
        <!-- 新的朋友列表 不是好友 -->
        <p
          class="applyreson"
          v-show="!userCard.isfriend&&userCard.data.greet"
        >
          {{userCard.data.greet}}
        </p>
        <!--非好友 申请好友操作 -->
        <p
          class="user-opera"
          v-show="!userCard.isfriend&&!userCard.data.greet"
        >
          <span class="card-opera">
            <i
              class="iconfont iconIMweb_addfriends"
              @click="applyFriend"
            ></i>
          </span>
        </p>
        <!-- 好友操作 删除|发消息  -->
        <p
          class="user-opera"
          v-show="userCard.isfriend"
        >
          <span
            class="card-opera"
            v-show="userCard.data.id!=curruid"
          >
            <i
              class="iconfont iconIMweb_deldte"
              @click="showDelModel"
            ></i>
          </span>

        </p>
        <p class="user-opera">
          <span class="card-opera">
            <i
              class="iconfont iconIMweb_news"
              @click="userSendChat"
            ></i>
          </span>
        </p>

      </div>
    </div>
    <!-- 删除好友确认弹框 -->
    <Dialog
      v-show="delshow"
      :zindex="zindex"
    >
      <div class="modelbody deluser nm99">
        <div class="maintitle">
          <p>确认删除当前好友，</p>
          <p class="smtitle">同时删除与该好友的所有聊天记录？</p>
        </div>

        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleDel"
          >取消</button>
          <button
            class="primarybtn"
            @click="userDelFriend"
            :disabled="loading"
          >删除</button>
        </div>
      </div>
    </Dialog>
    <!-- 添加好友 -->
    <Dialog
      v-show="addshow"
      :zindex="zindex"
    >
      <div class="modelbody addbody">
        <p class="title">
          <label>添加好友</label>
          <i
            class="iconfont iconIMweb_cancel_cancel"
            @click="closeApply"
          ></i>
        </p>
        <div class="add-content">
          <div class="add-info">
            <el-image
              class="add-avatar"
              :src="userCard.data.avatar"
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
            <div class="add-name">
              <p class="add-nick">{{userCard.data.nick}}</p>
              <p class="add-area">{{userCard.data.province?userCard.data.province:''}}
                {{userCard.data.city?userCard.data.city:''}}</p>
            </div>
          </div>
          <div class="add-greet">
            <div class="greet-content">
              <input
                type="text"
                maxlength="30"
                v-model="greet"
              />
              <span class="count">{{greet.length}}/30</span>
            </div>
            <button
              class="primarybtn"
              @click="sendApply"
              :disabled="loading"
            >发送</button>
          </div>
        </div>
      </div>
    </Dialog>
  </div>

</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import { chatcom, friend, msgTips } from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import { resUrl } from '@/assets/js/common';
export default {
  props: ['show', 'userCard'],
  data () {
    return {
      showRemark: false,//显示编辑备注名
      greet: '',//添加好友的-打招呼
      applyid: '',//申请好友id
      userremark: '',//名片内备注
      delshow: false,//删除好友确认弹框
      addshow: false,//添加好友
      greet: '',//申请备注
      loading: false,
      zindex: 1999,
    }
  },
  watch: {
    show (nv) {
      if (nv) {
        Object.assign(this.$data, this.$options.data());//初始化data
        this.setAddEventListener();
      }
    }
  },
  computed: {
    ...mapState({
      bizId: state => state.Ws.bizId,
      curruser: (state) => state.User.currUser,
      curruid: (state) => state.User.currUid,
      chatInfo: state => state.Ws.chatInfo,//当前会话信息
      chatList: state => state.Ws.chatList,//会话列表
      applyThis: state => state.Ws.applyThis//当前页面this
    }),
  },
  methods: {
    ...mapMutations(['setChatInfoKey', 'setChatOn', 'setGroupMore']),
    ...mapActions(['getUserInfo']),
    /* 组织冒泡 */
    stopProp () {
    },
    setAddEventListener () {
      let _this = this;
      document.addEventListener('click', function (e) { _this.unbindListen(e) }, false);
    },
    /* 解绑监听 */
    unbindListen (e) {
      if (this.showRemark) {
        let selection = getSelection();
        if (selection.focusNode.nodeType == 1 && selection.focusNode.getAttribute("class").indexOf("edit-name") != -1) {
          return;
        }
      }
      this.$emit("update:show", false);
      document.removeEventListener('click', this.unbindListen, false)
    },
    /* 显示编辑备注输入框 */
    showEditIpt () {
      if (this.curruid != this.userCard.data.id) {
        this.userremark = this.userCard.data.remarkname;
        this.showRemark = true;
      }
    },
    /* 确定保存修改备注 */
    async sureSaveRemark () {
      let remarkname = this.userremark;
      let postdata = { remarkname, frienduid: this.userCard.data.id };
      let res = await friend.modifyRemarkname(postdata);
      let currpath = this.$route.path;
      if (res.ok) {
        //同步-页面内显示备注的数据
        this.userCard.data.remarkname = remarkname;
        let uid = this.userCard.data.id;
        if (currpath == "/home") {
          if (remarkname == "") {
            remarkname = this.userCard.data.nick;
          }
          if (this.chatInfo.bizid == uid) {
            this.setChatInfoKey({ key: 'name', val: remarkname });
          }
          //左侧会话列表-会话名称修改
          let leftChatCol = this.chatList.find(item => item.bizid == uid);
          if (leftChatCol) {
            leftChatCol.name = remarkname;
          }
        }
        this.showRemark = false;
        msgTips("修改成功");
      } else {
        msgTips(res.msg);
      }
    },
    /* 隐藏 */
    hideEditIpt () {
      if (this.showRemark) {
        this.showRemark = false;
      }
    },
    /* 删除好友点击事件 */
    showDelModel () {
      log(this.zindex);
      this.delshow = true;
    },
    /* 取消删除好友 */
    cancleDel () {
      this.delshow = false;
    },
    /* 确定删除好友 */
    async userDelFriend () {
      this.loading = true;
      let touid = this.userCard.data.id;
      let ptdata = { touid: touid };
      let res = await friend.delFriend(ptdata);
      this.delshow = false;
      this.loading = false;
      document.documentElement.click();
      if (!res) {
        return;
      }
      if (!res.ok) {//不成功
        msgTips(res.msg);
      } else {//成功
        this.applyThis.$refs.friendlist.getMyFriendList()//刷新通讯录
      }
    },
    /* 在home页面删除好友后 */
    afterHomeDelFriend () {
      let index = this.chatList.findIndex(item => item.bizid == this.userCard.data.id);
      if (index != -1) {
        this.chatList.splice(index, 1);
        if (this.bizId == this.userCard.data.id) {
          this.applyThis.$refs.chatlist.chatColClick(this.chatList[0]);
        }
      }
    },
    /* 在list页面删除好友后 */
    afterListDelFriend (touid) {
      let $friendData = this.applyThis.$refs.friendlist;
      let friendRow = $friendData.orgFriendList.find(item => item.uid == touid);
      if (friendRow) {
        let list = $friendData.friendList;
        let letter = list.findIndex(item => item.index == friendRow.chatindex);
        let obj = list[letter].data;
        if (obj.length == 1) {
          list.splice(letter, 1);
        } else {
          let letterIndex = obj.findIndex(item => item.uid == touid);
          if (letterIndex != -1) {
            obj.splice(letterIndex, 1);
          }
        }
      }
      document.documentElement.click();
      if (touid == this.applyThis.friendid) {
        this.applyThis.type = 1;
        this.applyThis.friendid = "";
      }
      msgTips("删除成功");
      $friendData.myFriends.totalRow--;
    },
    /* 
    发消息 
    @param {*} type 类型
    */
    async userSendChat (type) {
      this.setGroupMore(false);
      if (this.userCard.isfriend) {
        let postdata = {};
        if (type == 'group') {
          postdata = {
            groupid: this.userCard.data.id
          }
        } else {
          postdata = {
            touid: this.userCard.data.id
          };
        }
        let currpath = this.$route.path;
        let res = await chatcoms.chatActChat(postdata);
        document.documentElement.click();
        if (res.ok) {
          let data = res.data.chat;
          switch (currpath) {
            case '/home':
              this.applyThis.$refs.chatlist.chatColClick(data);
              break;
            case '/friend':
              this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: false });
              this.$router.push({ path: '/home' });
              break;
            case '/group':
              this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: true });
              this.$router.push({ path: '/home' });
              break;
          }
        } else {
          msgTips(res.msg);
        }
      } else {

        let postdata = {};
        postdata = {
          touid: this.userCard.data.id,
          uid: this.curruid
        };
        let res = await chatcoms.chatActStrangerChat(postdata);
        if (res.ok) {
          let data = res.data.chat;
          if (this.$route.path == "/home") {
            this.applyThis.$refs.chatlist.chatColClick(data);
          } else {
            let { id, bizid, chatmode } = data;
            this.setChatOn({ chatOn: id, bizid, isGroup: chatmode == 2 });
            this.$router.push({ path: '/home' });
          }
        } else {
          msgTips(res.msg);
        }
      }
    },
    /* 消息中-申请添加好友 */
    msgApply () {
      this.greet = '我是' + this.curruser.nick;
      this.addshow = true;
    },
    /* 申请添加朋友*/
    applyFriend () {
      let uid = this.userCard.data.id;
      let ptdata = {
        touid: this.userCard.data.id
      };
      friend.checkAddFriend(ptdata).then(async res => {
        if (res.ok) {
          if (res.data != 1) {
            this.addFriend(ptdata);
          } else {
            let userInfo = await this.getUserInfo(uid);
            userInfo.avatar = resUrl(userInfo.avatar);
            this.userCard.data = userInfo;
            this.greet = '我是' + this.curruser.nick;
            this.addshow = true;
          }
        } else {
          msgTips(res.msg);
        }
      })
    },
    /* 隐藏参加好友弹框 */
    closeApply () {
      this.addshow = false;
    },
    /* 添加好友 */
    addFriend (postdata) {
      friend.chatAddFriend(postdata).then(res => {
        if (res.ok) {
          msgTips("添加好友成功");
        } else {
          msgTips(res.msg);
        }
        document.documentElement.click();
      })
    },
    /* 发送 */
    sendApply () {
      this.loading = true;
      let ptdata = { "touid": this.userCard.data.id, greet: this.greet };
      friend.friendApply(ptdata).then(res => {
        this.loading = false;
        this.addshow = false;
        if (res.ok) {
          msgTips("申请成功");
        } else {
          msgTips(res.msg);
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/usercard.less";
</style>