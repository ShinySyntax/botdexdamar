<template>
  <div>
    <Dialog v-show="transShow">
      <!-- 消息转发|发送名片 -->
      <div class="modelbody transcontainer">
        <p class="title">
          <label class="trans-title">{{transType==1?'消息转发':(transType==2?'发送名片':'分享群聊')}}</label>
          <i
            class="iconfont iconIMweb_cancel_cancel"
            @click="hideTrans"
          ></i>
        </p>

        <div class="trans-body">
          <div class="trans-left">
            <div
              v-show="!searchShow"
              class="fillheight"
            >
              <div class="search-content">
                <i class="iconfont iconIMweb_search"></i>
                <input
                  type="text"
                  readonly
                  placeholder="搜索"
                  class="search-input"
                  @click="showTransSearchList"
                >
              </div>
              <div class="trans_btns">
                <div class="trans_btns_left">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="showAllChat"
                  >全部</el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    @click="showFirendChat"
                  >单聊</el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    @click="showGroupChat"
                  >群聊</el-button>
                </div>
                <div class="trans_btns_right">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="checkAll"
                  >全选</el-button>
                </div>
              </div>
              <div
                class="trans-list"
                :id="setid?setid+'trans-message-list':'trans-message-list'"
              >
                <div>
                  <ul v-if="showAll">
                    <li
                      class="trans-row"
                      v-for="item in chatList"
                      :key="item.id"
                      @click="transChatList(item.bizid)"
                    >
                      <el-image
                        :src="item.avatar"
                        class="row-avatar"
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
                      <p
                        class="row-name"
                        v-html="item.name"
                      ></p>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.bizid"
                          v-model="transArr"
                          @change="changeCheck($event,item.bizid,'bizid','chatList')"
                          @click.stop="stopProp"
                        />
                      </span>
                    </li>
                  </ul>
                  <ul v-if="showFriend">
                    <li
                      class="trans-row"
                      v-for="item in friendChatList"
                      :key="item.id"
                      @click="transChatList(item.bizid)"
                    >
                      <el-image
                        :src="item.avatar"
                        class="row-avatar"
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
                      <p
                        class="row-name"
                        v-html="item.name"
                      ></p>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.bizid"
                          v-model="transArr"
                          @change="changeCheck($event,item.bizid,'bizid','chatList')"
                          @click.stop="stopProp"
                        />
                      </span>
                    </li>
                  </ul>
                  <ul v-if="showGroup">
                    <li
                      class="trans-row"
                      v-for="item in groupChatList"
                      :key="item.id"
                      @click="transChatList(item.bizid)"
                    >
                      <el-image
                        :src="item.avatar"
                        class="row-avatar"
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
                      <p
                        class="row-name"
                        v-html="item.name"
                      ></p>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.bizid"
                          v-model="transArr"
                          @change="changeCheck($event,item.bizid,'bizid','chatList')"
                          @click.stop="stopProp"
                        />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              v-if="searchShow"
              class="fillheight"
            >
              <div class="search-content">
                <i class="iconfont iconIMweb_search"></i>
                <input
                  type="text"
                  autocomplete="off"
                  placeholder="搜索"
                  class="search-input"
                  @input="searchFriends"
                  v-model="searchVal"
                  :id="setid?setid+'trans-message-search':'trans-message-search'"
                >
                <i
                  class="iconfont iconIMweb_cancel_cancel hide-search-icon"
                  @click="hideSearchContent"
                ></i>
              </div>
              <!-- <div class="trans_btns">
                            <div class="trans_btns_left">
                                <el-button type="primary">全部</el-button>
                                <el-button type="primary" >单聊</el-button>
                                <el-button type="primary" >群聊</el-button>
                            </div>
                            <div class="trans_btns_right">
                                <el-button type="primary" >全选</el-button>
                            </div>
                        </div> -->
              <div
                class="trans-list"
                :id="setid?setid+'trans-mail-list':'trans-mail-list'"
              >
                <div v-show="fList.length>0">
                  <div class="search-title">
                    <span>好友</span>
                    <p
                      class="trans-updown"
                      @click="seeAllFriend"
                      v-show="friendList.length>5&&fList.length<=5"
                    >
                      查看全部({{friendList.length}})
                      <i class="iconfont iconttubiao_xiala"></i>
                    </p>
                    <p
                      class="trans-updown"
                      @click="upSearchFriend"
                      v-show="fList.length>5"
                    >收起<i class="iconfont iconttubiao_shangla"></i></p>
                  </div>
                  <ul>
                    <li
                      class="trans-row"
                      v-for="item in fList"
                      :key="item.uid"
                      @click="transfriendList(item.uid)"
                    >
                      <el-image
                        :src="item.avatar"
                        class="row-avatar"
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
                      <p
                        class="row-name"
                        v-html="brightenKeyword((item.remarkname||item.nick),searchVal)"
                      ></p>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.uid"
                          v-model="transArr"
                          @change="changeCheck($event,item.uid,'uid','fList')"
                          @click.stop="stopProp"
                        >
                      </span>
                    </li>
                  </ul>
                </div>
                <div v-show="gList.length>0">
                  <div class="search-title">
                    <span>群聊</span>
                    <p
                      class="trans-updown"
                      @click="seeAllGroup"
                      v-show="groupList.length>5&&gList.length<=5"
                    >
                      查看全部({{groupList.length}})
                      <i class="iconfont iconttubiao_xiala"></i>
                    </p>
                    <p
                      class="trans-updown"
                      v-show="gList.length>5"
                      @click="upSearchGroup"
                    >
                      收起
                      <i class="iconfont iconttubiao_shangla"></i>
                    </p>
                  </div>
                  <ul>
                    <li
                      class="trans-row"
                      v-for="item in gList"
                      :key="item.groupid"
                      @click="transGroupList(item.groupid)"
                    >
                      <el-image
                        :src="item.avatar"
                        class="row-avatar"
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
                      <p
                        class="row-name"
                        v-html="brightenKeyword(item.name,searchVal)"
                      ></p>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.groupid"
                          v-model="transArr"
                          @change="changeCheck($event,item.groupid,'groupid','gList')"
                          @click.stop="stopProp"
                        />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="trans-right-list">
            <div
              v-if="transType==2"
              class="share-info"
            >
              <p class="share-name">分享该好友</p>
              <div class="share-detail">
                <el-image
                  class="share-avatar"
                  :src="transData.avatar"
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
                <div class="detail-right">
                  {{transData.nick}}
                </div>
              </div>
            </div>
            <div
              v-if="transType==3"
              class="share-info"
            >
              <p class="share-name">分享该群聊</p>
              <div class="share-detail">
                <el-image
                  class="share-avatar"
                  :src="transData.avatar"
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
                <div class="detail-right">
                  {{transData.name}}
                </div>
              </div>
            </div>
            <p class="choose-title clearfloat">分别发送给已选聊天{{transArr.length>0?('('+transArr.length+')'):''}}
              <!-- <button type="button" class="layui-btn wx-sure-create" :disabled="transArr.length>0?false:true" @click="sureTransMessage">{{transType==1?'转发':'发送'}}</button> -->
            </p>
            <div
              :id="setid?setid+'trans-choosed-list':'trans-choosed-list'"
              :class="['trans-choosed-list',transType!=1?'small-choosed-list':'']"
            >
              <ul>
                <li
                  class="trans-row"
                  v-for="(choosed,index) in transChoosedList"
                  :key="index"
                  @click="transDelCoosed(choosed.bizid||choosed.groupid||choosed.uid)"
                >
                  <el-image
                    :src="choosed.avatar"
                    class="row-avatar"
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
                  <p class="row-name">{{choosed.name||choosed.remarkname||choosed.nick}}</p>
                  <i class="iconfont iconttubiao_cha"></i>
                </li>
              </ul>
            </div>
            <div class="trans-bot">
              <button
                class="primarybtn"
                :disabled="transArr.length>0?false:true"
                @click="sureTransMessage"
              >转发</button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>

</template>
<script>
import { mapState } from 'vuex';
import { defineScroll } from '@/assets/js/common';
import { chatcom, msgTips } from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import SearchMixin from '@/mixins/search.js';//发送消息相关逻辑
export default {
  data () {
    return {
      transChoosedList: [],//转发信息|分享名片-被选中列表
      transArr: [],//转发信息|分享名片-选中id
      friendChatList: [],
      groupChatList: [],
      showAll: true,
      showFriend: false,
      showGroup: false
    }
  },
  props: ['transType', 'transShow', 'transData', 'setid'],
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid,
      chatList: state => state.Ws.chatList,//会话列表
      chatOn: state => state.Ws.chatOn,//当前会话id
      bizId: state => state.Ws.bizId,//当前会话-群聊groupid或私聊好友uid
      allNotRead: store => store.Ws.allNotRead,//总未读条数
      applyThis: store => store.Ws.applyThis
    }),
  },
  mixins: [SearchMixin],
  watch: {
    transShow (nv) {
      if (nv) {
        this.searchShow = false;
        this.transChoosedList = [];//转发信息-被选中列表
        this.transArr = [];//转发信息-选中id
        this.resetSearchData();
        this.$nextTick(() => {
          let scrollid = this.setid ? this.setid + 'trans-message-list' : 'trans-message-list'
          defineScroll($("#" + scrollid));
        });
      }
    }
  },
  mounted () {


  },
  methods: {
    getLists () {
      for (let item of this.chatList) {
        console.log("chatmode===", item.chatmode)
        if (item.chatmode === 1) {
          let state = this.friendChatList.some(items => items.id === item.id)
          if (!state) {
            this.friendChatList.push(item)
          }

        } else {
          let state = this.groupChatList.some(items => items.id === item.id)
          if (!state) {
            this.groupChatList.push(item)
          }

        }
      }
    },
    showAllChat () {
      this.showAll = true;
      this.showFriend = false;
      this.showGroup = false;
    },
    showFirendChat () {
      this.getLists();
      this.showAll = false;
      this.showFriend = true;
      this.showGroup = false;
    },
    showGroupChat () {
      this.getLists();
      this.showAll = false;
      this.showFriend = false;
      this.showGroup = true;
    },
    /* 隐藏 */
    hideTrans () {
      this.$emit("update:transShow", false);
    },
    /*隐藏搜索模块 */
    hideSearchContent () {
      this.searchVal = "";
      this.searchShow = false;
    },
    /* 转发-搜索输入框点击事件 */
    showTransSearchList () {
      console.log("this.chatList==", this.chatList)
      this.searchShow = true;
      this.resetSearchData();
      this.$nextTick(() => {
        $("#" + (this.setid ? this.setid : '') + "trans-message-search").focus();
        let scrollid = this.setid ? this.setid + 'trans-mail-list' : 'trans-mail-list'
        this.searchDom = $("#" + scrollid);
        defineScroll(this.searchDom);
      });
    },
    checkAll () {
      if (this.showAll) {
        for (let item of this.chatList) {
          this.transComClick(item.bizid, 'bizid', 'chatList');
        }
      } else if (this.showFriend) {

        for (let item of this.friendChatList) {
          this.transComClick(item.bizid, 'bizid', 'friendChatList');
        }
      } else {
        for (let item of this.groupChatList) {
          this.transComClick(item.bizid, 'bizid', 'groupChatList');
        }

      }
    },
    /* 复选框更改事件 */
    changeCheck (e, id, mapkey, list) {
      let findIn = this.transArr.findIndex(item => item == id);
      if (findIn != -1) {
        if (this.transArr.length >= 10) {
          this.transArr.pop();
          $(e.currentTarget).attr("checked", false);
          msgTips("最多选择9个会话");
          return;
        }
      }
      if (findIn == -1) {
        let choosedindex = this.transChoosedList.findIndex(item => item[mapkey] == id);
        this.transChoosedList.splice(choosedindex, 1);
      } else {
        let choosedobj = {};
        this[list].map(item => {
          if (item[mapkey] == id) {
            choosedobj = item;
          };
        })
        this.transChoosedList.push(choosedobj);
        this.$nextTick(() => {
          defineScroll($("#" + (this.setid ? this.setid : '') + "trans-choosed-list"));
        });
      }
    },
    /* 转发点击事件 */
    transComClick (id, mapkey, list) {
      let findIn = this.transArr.findIndex(item => item == id);
      // if(findIn==-1){
      //     if(this.transArr.length>=9){
      //         log(this.transArr);
      //         // this.transArr=this.transArr.slice(0,9);
      //         msgTips("最多选择9个会话");
      //         return;
      //     }
      // }
      if (findIn != -1) {
        this.transChoosedList.splice(findIn, 1);
        this.transArr.splice(findIn, 1);
      } else {
        let choosedobj = {};
        this[list].map(item => {
          if (item[mapkey] == id) {
            choosedobj = item;
          };
        })
        this.transChoosedList.push(choosedobj);
        this.$nextTick(() => {
          defineScroll($("#" + (this.setid ? this.setid : '') + "trans-choosed-list"));
        });
        this.transArr.push(id);
      }
    },
    /* 转发-好友列表点击事件 */
    transfriendList (id) {
      this.transComClick(id, 'uid', 'fList');
    },
    /* 转发-群聊列表点击事件 */
    transGroupList (id) {
      this.transComClick(id, 'groupid', 'gList');
    },
    /* 转发-会话列表点击事件 */
    transChatList (id) {
      this.transComClick(id, 'bizid', 'chatList');
    },
    /* 转发-删除选中的聊天 */
    transDelCoosed (id) {
      let findIn = this.transArr.findIndex(item => item == id);
      this.transArr.splice(findIn, 1);
      this.transChoosedList.splice(findIn, 1);
    },
    /* 转发-确定转发消息 */
    sureTransMessage () {
      let uids = [],
        groupids = [];
      this.transChoosedList.map(item => {
        let chatmode = item.chatmode;
        if (chatmode == 1) {
          uids.push(item.bizid);
        } else if (chatmode == 2) {
          groupids.push(item.bizid);
        } else if (item.groupid) {
          groupids.push(item.groupid);
        } else {
          uids.push(item.uid);
        }
      })
      uids = uids.join(',');
      groupids = groupids.join(',');
      let postdata = {};
      switch (this.transType) {
        case 1:
          postdata = {
            chatlinkid: this.chatOn,
            uids: uids,
            groupids: groupids,
            mids: this.transData.mid
          };
          this.shareMessage(postdata);
          break;
        case 2:
          postdata = {
            chatmode: 1,
            uids: uids,
            groupids: groupids,
            cardid: this.transData.uid
          };
          this.shareCard(postdata);
          break;
        case 3:
          postdata = {
            chatmode: 2,
            uids: uids,
            groupids: groupids,
            cardid: this.transData.groupid
          };
          this.shareCard(postdata);
          break;
      }

    },
    /* 消息转发接口 */
    shareMessage (ptdata) {
      chatcoms.msgForward(ptdata).then(res => {
        if (res.ok) {
          this.hideTrans();
          msgTips('转发成功');
        } else {
          msgTips(res.msg);
        }
      })
    },
    /* 分享名片接口 */
    shareCard (postdata) {
      chatcoms.shareCard(postdata).then(res => {
        if (res.ok) {
          this.hideTrans();
          if (this.transType == 2) {
            msgTips('发送成功');
          } else {
            msgTips('分享成功');
          }
        } else {
          msgTips(res.msg);
        }
      })
    },
    stopProp () { }
  }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/home/transmsg.less";
</style>