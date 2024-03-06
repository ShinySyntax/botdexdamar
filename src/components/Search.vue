<template>
  <div
    class="search-container"
    :style="{height:show?'100%':'auto'}"
  >
    <div
      class="search-in"
      v-show="!show"
    >
      <div class="search-ipt">
        <i class="iconfont iconIMweb_search"></i>
        <input
          type="text"
          readonly
          placeholder="搜索"
          @click="showSearchList"
        />
      </div>
      <i
        class="iconfont iconIMweb_add addicon"
        @click.stop="showMoreOper"
      ></i>
      <ul
        class="more-oper"
        v-show="moreshow"
      >
        <span class="popper__arrow"></span>
        <li
          class="more-item"
          @click="showCreateGroup"
        >
          <i class="iconfont iconIMweb_group"></i>
          <span>创建群聊</span>
        </li>
        <li
          class="more-item"
          @click="showAddFriend"
        >
          <i class="iconfont iconIMweb_addfriends"></i>
          <span>添加好友</span>
        </li>
      </ul>
    </div>
    <div
      class="searchcontent"
      v-show="show"
    >
      <div class="search-in">
        <div class="search-ipt">
          <i class="iconfont iconIMweb_search"></i>
          <input
            type="text"
            autocomplete="off"
            placeholder="搜索"
            @input="searchFriends"
            v-model="searchVal"
            id="list-search"
          >
          <i
            class="iconfont iconIMweb_cancel_cancel hide-search-icon"
            @click="hideSearchContent"
          ></i>
        </div>
        <i
          class="iconfont iconIMweb_add addicon"
          @click.stop="showMoreOper"
        ></i>
        <ul
          class="more-oper"
          v-show="moreshow"
        >
          <span class="popper__arrow"></span>
          <li
            class="more-item"
            @click="showCreateGroup"
          >
            <i class="iconfont iconIMweb_group"></i>
            <span>创建群聊</span>
          </li>
          <li
            class="more-item"
            @click="showAddFriend"
          >
            <i class="iconfont iconIMweb_addfriends"></i>
            <span>添加好友</span>
          </li>
        </ul>
      </div>
      <div
        class="trans-list"
        id="search-mail-list"
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
              @click="searchLiClick(1,item.uid)"
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
              @click="searchLiClick(2,item.groupid)"
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
            </li>
          </ul>
        </div>

        <div v-show="msList.length>0">
          <div class="search-title">
            <span>陌生人</span>
            <p
              class="trans-updown"
              @click="seeAllMosheng"
              v-show="moshengList.length>5&&msList.length<=5"
            >
              查看全部({{moshengList.length}})
              <i class="iconfont iconttubiao_xiala"></i>
            </p>
            <p
              class="trans-updown"
              v-show="msList.length>5"
              @click="upSearchMosheng"
            >
              收起
              <i class="iconfont iconttubiao_shangla"></i>
            </p>
          </div>
          <ul>
            <li
              class="trans-row"
              v-for="item in msList"
              :key="item.uid"
              @click="searchLiStrangerClick(item.uid)"
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
            </li>
          </ul>
        </div>

      </div>
    </div>
    <!-- 添加好友 -->
    <Dialog v-show="addfriend">
      <div class="modelbody addfriend">
        <div class="title">
          <label>添加好友</label>
          <i
            class="iconfont iconIMweb_cancel_cancel"
            @click="cancleAdd"
          ></i>
        </div>
        <div class="user-search">
          <div class="search-content">
            <i class="iconfont iconIMweb_search"></i>
            <input
              type="text"
              class="search-input"
              placeholder="输入昵称"
              v-model="searchValue"
              @keyup.enter="searchFriend"
            >
          </div>
          <button
            class="primarybtn"
            @click="searchFriend"
          >查找</button>
        </div>
        <div
          class="searchUserList"
          id="searchUserList"
        >
          <ul
            v-show="searchResult"
            id="sxe4"
          >
            <li
              class="search-nouser nodata-content"
              v-if="searchData.length==0"
            >
              <img
                src="~@/assets/imgs/common/nodata.png"
                class="search-nodata"
              />
              <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
            </li>
            <li
              class="search-row"
              v-else
              v-for="v in searchData"
              :key="v.id"
            >
              <el-image
                class="search-avatar"
                :src="v.avatar"
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
              <div class="search-center">
                <p
                  class="search-nick"
                  v-text="v.nick"
                ></p>
                <p class="search-city">{{v.province}} {{v.city}}</p>
              </div>
              <span
                class="apply-add"
                @click="userApply(v.id)"
              >加好友</span>
            </li>
          </ul>
        </div>
      </div>
    </Dialog>
    <!-- 创建群聊 -->
    <Dialog v-show="creategroup">
      <div class="modelbody transcontainer">
        <p class="title">
          <label class="trans-title">创建群聊</label>
          <i
            class="iconfont iconIMweb_cancel_cancel"
            @click="cancleCreate"
          ></i>
        </p>
        <div class="trans-body">
          <div class="trans-left">
            <div class="fillheight">
              <div class="search-content">
                <i class="iconfont iconIMweb_search"></i>
                <input
                  type="text"
                  placeholder="搜索"
                  class="search-input"
                  @input="friendQuerylist"
                  v-model="pcardsearch"
                >
              </div>
              <div
                class="trans-list"
                id="search-friend-list"
              >
                <ul>
                  <div
                    v-if="myFriendFilter.length==0"
                    class="nodata-content"
                  >
                    <img
                      src="~@/assets/imgs/common/nodata.png"
                      class="search-nodata"
                    />
                    <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                  </div>
                  <div
                    v-for="v in myFriendFilter"
                    :key="v.index"
                  >
                    <p class="letter-index">{{v.index}}</p>
                    <li
                      class="trans-row"
                      v-for="item in v.data"
                      :key="item.uid"
                      @click="friendClick(item.uid)"
                    >
                      <el-image
                        class="row-avatar"
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
                      <span
                        class="row-name"
                        v-html="brightenKeyword(item.remarkname||item.nick,pcardsearch)"
                      >
                      </span>
                      <span class="tm-checkbox">
                        <input
                          type="checkbox"
                          :value="item.uid"
                          v-model="choosedArr"
                        >
                      </span>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </div>
          <div class="trans-right-list">
            <p class="choose-title">
              <span>请勾选要添加的联系人{{choosedArr.length>0?('('+choosedArr.length+')'):''}}</span>
              <button
                class="primarybtn"
                :disabled="choosedArr.length>0?false:true"
                @click="showSureCreate"
              >创建群聊</button>
            </p>
            <div
              id="create-choosed-list"
              class="trans-choosed-list"
            >
              <ul>
                <li
                  class="trans-row"
                  v-for="choosed in choosedList"
                  :key="choosed.uid"
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
                  <p class="row-name">{{choosed.remarkname?choosed.remarkname:choosed.nick}}</p>
                  <i
                    class="iconfont iconttubiao_cha"
                    @click="cancleDelCoosed(choosed.uid)"
                  ></i>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <!-- 个人名片 -->
    <UserCard
      :show.sync="cardshow"
      :userCard="userCard"
      ref="usercard"
    ></UserCard>
    <!-- 确定创建群聊 -->
    <Dialog v-show="surecreate">
      <div class="modelbody surecreate">
        <div class="title">
          <label>创建群聊</label>
        </div>
        <div class="create-content">
          <div class="create-row">
            <label class="create-label">群聊名称：</label>
            <input
              type="text"
              class="create-name"
              maxlength="30"
              :placeholder="createname"
              v-model="groupname"
            />
          </div>
          <div class="create-row">
            <label class="create-label">群聊简介：</label>
            <div class="areacontainer">
              <textarea
                maxlength="500"
                v-model="groupintro"
                placeholder="请填写群简介"
              ></textarea>
              <p class="num-count">{{groupintro.length}}/500</p>
            </div>
          </div>
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="closeCreate"
          >取消</button>
          <button
            class="primarybtn"
            :disabled="loading"
            @click="wxSureCreate"
          >创建</button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import SearchMixin from '@/mixins/search.js';//发送消息相关逻辑
import { defineScroll, resUrl } from '@/assets/js/common';
import { chatcom, friend, group, msgTips } from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import UserCard from "@/components/UserCard";//个人名片
import UserCardMixins from '@/mixins/usercard.js';//个人信息卡片
import FriendIndex from '@/mixins/friendindex.js';//好友列表
export default {
  data () {
    return {
      moreshow: false,//加好友|创建群聊弹框显示状态
      addfriend: false,//添加好友弹框显示状态
      searchValue: "",//搜索值
      searchResult: false,//“用户不存在”布局是否显示
      search: {
        pagenum: 1,
        totalPage: 0
      },
      searchData: [],
      creategroup: false,//创建群聊弹框显示状态
      choosedList: [],//创建群聊-选中列表
      choosedArr: [],//创建群聊-选中uid数组
      friendscrollid: "search-friend-list",//创建群聊-好友列表滚动id
      surecreate: false,//确定创建群聊
      createname: '',//默认群聊名称
      groupname: '',//自定义群聊名称
      groupintro: '',//群简介
      loading: false
    }
  },
  mixins: [SearchMixin, UserCardMixins, FriendIndex],
  props: ['show'],
  watch: {
    show (nv) {
      if (nv) {
        this.resetSearchData();
        this.$nextTick(() => {
          $("#list-search").focus();
          this.searchDom = $("#search-mail-list");
          defineScroll(this.searchDom);
        });
      }
    }
  },
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid,//当前用户uid
      applyThis: state => state.Ws.applyThis,//当前页面this
      currUser: (state) => state.User.currUser,
      applyThis: state => state.Ws.applyThis//当前页面this
    }),
  },
  components: {
    UserCard
  },
  methods: {
    ...mapMutations(['setChatOn']),
    /* 隐藏搜索列表 */
    hideSearchContent () {
      this.searchVal = "";
      this.$emit("update:show", false);
    },
    /* 显示搜索列表 */
    showSearchList () {
      // this.searchShow=true;
      this.$emit("update:show", true);
    },
    /* 
   列表点击事件 
   @param {*} type 1:私聊；2：群聊
   @param {*}
   */
    async searchLiClick (type, id) {
      this.hideSearchContent();
      let postdata = {};
      if (type == 1) {
        postdata = {
          touid: id,
          uid: this.curruid
        };
      } else {
        postdata = {
          groupid: id,
        };
      }
      let res = await chatcoms.chatActChat(postdata);
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
    },
    async searchLiStrangerClick (id) {
      this.hideSearchContent();
      let postdata = {};
      postdata = {
        touid: id,
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

    },
    /* 显示 添加好友|创建群聊*/
    showMoreOper () {
      document.documentElement.click();
      this.moreshow = true;
      this.$setAddEventListener('moreshow');
    },
    /* 初始化添加好友弹框 */
    initSearchUser () {
      let resetdata = {
        searchValue: '',
        searchResult: false,
        search: {
          pagenum: 1,
          totalPage: 0
        },
        searchData: []
      };
      Object.assign(this.$data, resetdata);//重置数据
    },
    /* 隐藏添加好友弹框 */
    cancleAdd () {
      this.initSearchUser();
      this.addfriend = false;
    },
    /* 显示添加好友弹框 */
    showAddFriend () {
      this.addfriend = true;
    },
    /* 显示创建群聊弹框 */
    showCreateGroup () {
      this.getMyFriendList();
      this.creategroup = true;
    },
    /* 隐藏创建群聊 */
    cancleCreate () {
      this.choosedList = [];
      this.choosedArr = [];
      this.initFriend();
      this.creategroup = false;
    },
    /* 搜索好友 */
    searchFriend () {
      this.search.pagenum = 1;
      this.searchList();
    },
    searchList () {
      let ptdata = {
        pageNumber: this.search.pagenum,
        nick: this.searchValue
      };
      friend.searchUser(ptdata).then(res => {
        if (res.ok) {
          let data = res.data;
          if (this.search.pagenum == 1) {
            this.searchData = [];
          }
          if (!data) {
            this.searchResult = false;
            return;
          }
          this.search.totalPage = data.totalPage;
          // data.totalPage==0? this.searchResult=true:this.searchResult=false;
          this.searchResult = true;
          let list = data.list;
          list.map(item => {
            item.avatar = resUrl(item.avatar);
          })
          this.searchData = this.searchData.concat(list);
          if (this.search.pagenum == 1) {
            let _this = this;
            this.$nextTick(() => {
              defineScroll($("#searchUserList"), '', {
                whileScrolling: function () {
                  if (this.mcs.topPct == 95 && _this.search.pagenum < _this.search.totalPage) {
                    _this.search.pagenum++;
                    _this.searchList();
                  }
                }
              });
            })
          }
        } else {
          msgTips(res.msg);
        }
      })
    },
    /* 添加好友 */
    userApply (uid) {
      this.userCard.data.id = uid;
      this.$refs.usercard.applyFriend();
    },
    /* 创建群聊-好友点击事件 */
    friendClick (uid) {
      let findIn = this.choosedArr.findIndex(item => item == uid);
      if (findIn != -1) {
        this.choosedList.splice(findIn, 1);
        this.choosedArr.splice(findIn, 1);
      } else {
        let choosedobj = {};
        this.orgSetList.map(item => {
          if (item.uid == uid) {
            choosedobj = item;
          };
        })

        this.choosedList.push(choosedobj);
        this.$nextTick(() => {
          defineScroll($("#create-choosed-list"));
        });
        this.choosedArr.push(uid);
      }
    },
    /* 删除选中的好友 */
    cancleDelCoosed (id) {
      let findIn = this.choosedArr.findIndex(item => item == id);
      this.choosedArr.splice(findIn, 1);
      this.choosedList.splice(findIn, 1);
    },
    /* 显示确认创建弹框 */
    showSureCreate () {
      this.createname = this.currUser.nick + '、';
      this.choosedList.map((item, index) => {
        if (index == this.choosedList.length - 1) {
          this.createname += item.nick;
          return;
        }
        this.createname += item.nick + '、';
      });
      this.createname = this.createname.substring(0, 30);
      this.surecreate = true;
    },
    /* 取消创建 */
    closeCreate () {
      this.createname = '';
      this.groupname = '';
      this.groupintro = '';
      this.surecreate = false;
    },
    /* 确定创建群聊 */
    wxSureCreate () {
      this.loading = true;
      let postdata = {
        uidList: this.choosedArr.join(","),
        name: this.groupname,
        intro: this.groupintro
      };
      group.createGroup(postdata).then(async res => {
        if (res.ok) {
          this.closeCreate();
          this.cancleCreate();
          this.loading = false;
          let actres = await chatcoms.chatActChat({ groupid: res.data.id });
          let data = actres.data.chat;
          let currpath = this.$route.path;
          if (currpath != '/home') {
            this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: true });
            this.$router.push({ path: '/home' });
          } else {
            this.applyThis.$refs.chatlist.chatColClick(data);
          }
        } else {
          msgTips(res.msg);
          this.loading = false
        }

      })
    },
  }
}
</script>
<style lang="less" scoped >
@import "~@/assets/style/less/components/home/transmsg.less";
@import "~@/assets/style/less/components/search.less";
</style>
