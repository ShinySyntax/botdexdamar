<template>
  <div class="mainbody">
    <div class="listcontent">
      <!-- 搜索 -->
      <Search :show.sync="searchShow"></Search>
      <!-- 群聊列表 -->
      <GroupList
        ref="grouplist"
        v-show="!searchShow"
        :groupid="groupid"
        @setGroupId="setGroupId"
        @sendCard="sendCard"
        @sendMsg="sendMsg"
      ></GroupList>
    </div>
    <!-- 好友信息 -->
    <GroupInfo
      ref="groupinfo"
      :groupid="groupid"
      @sendCard="sendCard"
      @sendMsg="sendMsg"
    ></GroupInfo>
    <!-- 发送名片 -->
    <TransMsg
      :transShow.sync="sendShow"
      :transType="sendType"
      :transData="data"
      :setid="setid"
    ></TransMsg>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import Search from '@/components/Search';//搜索
import GroupList from '@/components/group/GroupList';//好友列表
import GroupInfo from '@/components/group/GroupInfo';//好友信息
import TransMsg from "@/components/home/TransMsg";//转发消息
import { chatcom, group, msgTips } from '@/axios/path';
import { chatcoms } from "@/axios/paths"
import { resUrl } from '@/assets/js/common';
export default {
  data () {
    return {
      setid: 'share',//分享名片弹框id避免同页面重复id问题
      searchShow: false,//搜索显示状态
      sendShow: false,//发送名片弹框显示状态
      sendType: 3,
      data: {},
      groupid: '',//当前群聊id
    }
  },
  components: {
    Search,
    TransMsg,
    GroupList,
    GroupInfo
  },
  mounted () {
    this.setApplyThis(this);//设置本页面的this对象
  },
  methods: {
    ...mapMutations(['setApplyThis', 'setChatOn']),
    /* 设置群聊id */
    setGroupId (groupid) {
      this.groupid = groupid;
    },
    /* 发消息 */
    async sendMsg (groupid) {
      let postdata = {
        groupid: groupid
      }
      let res = await chatcoms.chatActChat(postdata);
      document.documentElement.click();
      if (res.ok) {
        let data = res.data.chat;
        this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: true });
        this.$router.push({ path: '/home' });
      } else {
        msgTips(res.msg);
      }
    },
    /* 分享群聊 */
    async sendCard (item) {
      let ptdata = { groupid: item.groupid };
      let res = await group.checkSendCard(ptdata);//校验是否可以分享群聊
      if (!res.ok) {
        msgTips(res.msg);
        return;
      }
      item.avatar = resUrl(item.avatar)
      this.data = { ...item };
      this.sendShow = true;
    },
    /* 退出群聊|解散群聊 后操作 */
    inGroupOutGroup (bodyObj) {
      this.$refs.grouplist.afterOutGroup(bodyObj);
    },
    /* 自动更新群信息 */
    intGroupInfo (bodyObj) {
      let groupList = this.$refs.grouplist.groupList;
      let groupInfo = this.$refs.groupinfo.groupInfo;
      let index = groupList.findIndex(item => item.groupid == bodyObj.g);
      let bizdata = JSON.parse(bodyObj.bizdata);
      if (index != -1) {
        let keys = Object.keys(bizdata);
        $.each(keys, function (i, v) {
          if (v == 'avatar') {
            bizdata[v] = resUrl(bizdata[v]);
          }
          groupList[index][v] = bizdata[v];
          if (groupInfo.id == bodyObj.g) {
            groupInfo[v] = bizdata[v];
          }
        })
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/search.less";
@import "~@/assets/style/less/home/home.less";
</style>
