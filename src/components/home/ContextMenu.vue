<template>
  <div>
    <!-- 消息右键操作框 -->

    <ul
      v-show="show"
      class="contextmenu-ul"
      :style="{top:contextmenu.top,left:contextmenu.left}"
    >
      <!-- 消息右键 -->
      <div v-show="cmenutype=='msg'">
        <!-- 右键自己发送的消息显示撤回/群主和群管理员可撤回普通成员信息除红包外-->
        <li
          @click="dealMessage(9)"
          v-show="contextmenu.data.grouprole==3||contextmenu.data.grouprole==1||curruid==contextmenu.data.uid"
        >撤回</li>
        <!-- 普通文本/图片消息右键显示复制||contextmenu.data.ct==6图片复制未完善 -->
        <li
          v-show="contextmenu.data.ct==1"
          data-clipboard-action="copy"
          class="copymessage"
          @click="contextmenu.data.ct==1?copyLink():contextmenu.data.ct==6?copyImg():''"
        >复制</li>
        <!-- 非名片|音视频|语音消息信息右键显示转发 -->
        <li
          @click="showTransMessage(1)"
          v-show="contextmenu.data.ct!=9&&contextmenu.data.ct!=10&&contextmenu.data.ct!=11"
        >转发</li>
        <!-- 另存为 图片/视频/文件 -->
        <li
          @click="saveAs"
          v-show="contextmenu.data.ct==6||contextmenu.data.ct==5||contextmenu.data.ct==3"
        >另存为</li>
        <!-- 信息右键删除 -->
        <li @click="showDelMsgModel">删除</li>
        <!-- 图片视频和文字引用 -->
        <li
          @click="referenceMessage()"
          v-show="contextmenu.data.ct==1||contextmenu.data.ct==6||contextmenu.data.ct==5"
        >引用</li>
      </div>
      <!-- 消息头像右键 -->
      <div v-show="cmenutype=='avatar'&&contextmenu.data.isInGroup==1">
        <!--selfGrouprole 自己的角色权限，grouprole 群用户的权限 -->
        <!-- 群用户的权限 -->
        <li
          v-show="isFriend==1"
          @click="sendChatMsg"
        >发消息</li>
        <li
          v-show="isFriend==2&&(contextmenu.data.friendflag&&contextmenu.data.friendflag==1)||isFriend==2&&(contextmenu.data.selfGrouprole==1||contextmenu.data.selfGrouprole==3)"
          @click="applyFriend"
        >加好友</li>
        <!-- 群聊头像右键-@功能 -->
        <li
          @click="rightRemind"
          class="overell"
          v-show="contextmenu.data.isInGroup==1"
        >@{{contextmenu.data.remindnick}}</li>
        <!-- 管理员只有群主能操作 -->
        <li
          @click="setManager(3)"
          v-show="contextmenu.data.selfGrouprole==1&&isforbidden.grouprole==2"
        >设置管理员</li>
        <li
          @click="setManager(2)"
          v-show="contextmenu.data.selfGrouprole==1&&isforbidden.grant==1&&isforbidden.grouprole==3"
        >取消管理员</li>
        <!-- 头像右键-禁言 grouprole 1群主,2成员,3管理员,grant 权限字段：1：有权限禁言；2：无权限 flag （禁言标识：1：时长禁言；2：否；3：长久禁用 管理员不能对群主进行禁言/取消禁言、移除群聊-->
        <li
          @click="prohibitSpeak"
          v-show="curruid!=contextmenu.data.uid&&(isforbidden.grant==1||isforbidden.rolegrant==1)&&isforbidden.flag==2&&(isforbidden.grouprole==2||isforbidden.grouprole=='undefind')"
        >禁言</li>
        <li
          @click="relieveSpeak"
          v-show="curruid!=contextmenu.data.uid&&(isforbidden.grant==1||isforbidden.rolegrant==1)&&isforbidden.flag!=2&&(isforbidden.grouprole==2||isforbidden.grouprole=='undefind')"
        >取消禁言</li>
        <!-- 移出群聊 判断是群主或者是管理员，但是管理员不能对群主操作，不能当前用户，操作对象在群内-->
        <li
          @click="kickGroup"
          v-show="contextmenu.data.isInGroup==1&&isforbidden.kickgrant==1&&(isforbidden.grouprole==2||isforbidden.grouprole=='undefind')"
        >移出群聊</li>
      </div>
      <!-- 群聊头像右键 -->
      <div v-show="cmenutype=='gavatar'">
        <!--selfGrouprole 自己的角色权限，grouprole 群用户的权限 -->
        <li
          v-show="isFriend==1"
          @click="sendChatMsg"
        >发消息</li>
        <li
          v-show="isFriend==2&&(groupInfo.friendflag&&groupInfo.friendflag==1)||isFriend==2&&(contextmenu.data.selfGrouprole==1||contextmenu.data.selfGrouprole==3)"
          @click="applyFriend"
        >加好友</li>
        <li
          v-show="isFriend==1"
          @click="showTransMessage(2)"
        >发名片</li>
        <!-- 管理员 -->
        <li
          @click="setManager(3)"
          v-show="contextmenu.data.selfGrouprole==1&&contextmenu.data.grouprole==2"
        >设置管理员</li>
        <li
          @click="setManager(2)"
          v-show="contextmenu.data.selfGrouprole==1&&contextmenu.data.grouprole==3"
        >取消管理员</li>
        <!-- 群聊头像右键-禁言 grouprole 1群主,2成员, forbiddenflag（禁言标识：1：时长禁言；2：否；3：长久禁用） 管理员不能对群主进行禁言/取消禁言、移除群聊-->
        <li
          @click="prohibitSpeak"
          v-show="(contextmenu.data.selfGrouprole==1||contextmenu.data.selfGrouprole==3)&&contextmenu.data.grouprole==2&&curruid!=contextmenu.data.uid&&contextmenu.data.forbiddenflag==2"
        >禁言</li>
        <li
          @click="relieveSpeak"
          v-show="(contextmenu.data.selfGrouprole==1||contextmenu.data.selfGrouprole==3)&&contextmenu.data.grouprole==2&&curruid!=contextmenu.data.uid&&contextmenu.data.forbiddenflag!==2"
        >取消禁言</li>
        <!-- 移出群聊 -->
        <li
          @click="kickGroup"
          v-show="isforbidden.kickgrant==1&&contextmenu.data.grouprole==2"
        >移出群聊</li>
      </div>
    </ul>
    <!-- 删除消息 -->
    <Dialog v-show="delshow">
      <div class="modelbody">
        <p class="singletitle">确定删除该消息吗？</p>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleDel"
          >取消</button>
          <button
            class="primarybtn"
            @click="dealMessage(1)"
            :disabled="loading"
          >确定</button>
        </div>
      </div>
    </Dialog>
    <!-- 消息转发 -->
    <TransMsg
      :transShow.sync="transShow"
      :transType="transType"
      :transData="contextmenu.data"
    ></TransMsg>
    <!--群聊 确认移除选中的成员 -->
    <Dialog v-show="kickshow">
      <div class="modelbody">
        <p class="singletitle">确定将该用户移出群聊？</p>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleKick"
          >取消</button>
          <button
            class="primarybtn"
            :disabled="loading"
            @click="sureDelGroupMemb"
          >删除</button>
        </div>
      </div>
    </Dialog>
    <!-- 群聊 禁言弹窗 -->
    <Dialog v-show="prohibitShow">
      <div class="modelbody prohibit-modelbody">
        <p class="singletitle">禁言时长</p>
        <div>
          <div
            class="m-prohibit-list"
            v-for="(item,index) in prohibitList"
            :key="index"
            @click="rohibitIsSelect(item,index)"
          >
            <span>{{item.title}}</span>
            <p class="m-checkbox">
              <input
                type="checkbox"
                name=""
                id=""
                v-model="item.isCheck"
              >
            </p>
          </div>
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="prohibitShow = false"
          >取消</button>
          <button
            class="primarybtn"
            :disabled="loading"
            @click="sureForbidden"
          >确定</button>
        </div>
      </div>
    </Dialog>
    <!-- 取消禁言 -->
    <Dialog v-show="relieveProhibit">
      <div class="modelbody">
        <div class="singletitle">
          确定要取消禁言吗？
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="relieveProhibit = false"
          >
            取消
          </button>
          <button
            class="primarybtn"
            @click="surerRelieveForbidden"
            :disabled="loading"
          >
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 群消息撤回提示 -->
    <Dialog v-show="withdrawShow">
      <div class="modelbody">
        <div class="singletitle">
          确定撤回该群聊消息？
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="withdrawShow = false"
          >
            取消
          </button>
          <button
            class="primarybtn"
            @click="surerWithdraw"
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
import { handleDownload, downloads } from '@/axios/http';
import axios from 'axios';
import Clipboard from 'clipboard';//复制插件
import { mapState, mapMutations, mapActions } from 'vuex';
import { chatcom, group, friend, msgTips, downloadFile } from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import TransMsg from "@/components/home/TransMsg";//转发消息
import { resUrl } from '@/assets/js/common';
import { getFile } from '@/axios/http';
export default {
  props: ['show', 'contextmenu', 'cmenutype', 'isFriend', 'isforbidden', 'groupInfo'],
  data () {
    return {
      delshow: false,//删除消息弹框
      transType: 1,
      transShow: false,//消息转发弹框
      kickshow: false,//移除群成员弹框
      loading: false,
      prohibitShow: false,//禁言弹框
      relieveProhibit: false,//取消禁言
      prohibitList: [
        {
          title: '10分钟',
          isCheck: true,
          mode: 1,
          oper: 1,
          duration: 600
        },
        {
          title: '1小时',
          isCheck: false,
          mode: 1,
          oper: 1,
          duration: 3600
        },
        {
          title: "24小时",
          isCheck: false,
          mode: 1,
          oper: 1,
          duration: 86400
        },
        {
          title: "长期禁言",
          isCheck: false,
          mode: 3,
          oper: 1,
          duration: ''
        },
      ],
      prohibitData: {
        mode: 1,
        oper: 1,
        duration: 600
      },
      withdrawShow: false,//群撤回弹窗
    }
  },
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid,
      chatOn: state => state.Ws.chatOn,//当前会话id
      bizId: state => state.Ws.bizId,//当前会话-群聊groupid或私聊好友uid
      applyThis: state => state.Ws.applyThis//当前页面this
    }),
  },
  components: {
    TransMsg,
  },
  mixins: [],
  methods: {
    ...mapMutations(['setChatOn']),
    /* 复制-功能 */
    copyLink (data) {
      let _this = this;
      let clipboard = new Clipboard('.copymessage', {
        text: function () {
          let copyVal = $("#copy" + _this.contextmenu.data.mid).html();
          var regx = /<[^>]*>|<\/[^>]*>|&nbsp;/gm;
          copyVal = copyVal.replace(/<img[^>]*>|<\/[^>]*>/gm, (item, index) => {
            let emojalt = $(item).attr('alt');
            return emojalt || item;
          });
          copyVal = copyVal.replace(regx, '');
          return copyVal;
        }
      });
      clipboard.on('success', e => {
        clipboard.destroy();
        msgTips("复制成功");
      })
      clipboard.on('error', e => {
        clipboard.destroy();
      })
    },
    /* 复制-图片功能-直接发送 */
    copyImg (data) {
      let _this = this;
      var clipboard = new Clipboard('.copymessage', {
        target: function (e) {
          return document.querySelector("#copy" + _this.contextmenu.data.mid)
        }
      });
      clipboard.on('success', e => {
        clipboard.destroy();
        msgTips("复制成功");
      })
      clipboard.on('error', e => {
        clipboard.destroy();
      })
    },
    /* 撤回|删除消息 1：删除；9：撤回 */
    dealMessage (oper) {
      this.loading = true;
      let ptdata = {
        chatlinkid: this.chatOn,
        mids: this.contextmenu.data.mid,
        oper: oper
      };
      if (oper == 9 && this.curruid !== this.contextmenu.data.uid) {
        this.withdrawShow = true
        this.loading = false
        return
      }
      chatcoms.msgOper(ptdata).then(res => {
        if (res.ok) {
          this.delshow = false;
        } else {
          msgTips(res.msg);
        }
        this.loading = false;
      })
    },
    surerWithdraw () {
      let ptdata = {
        chatlinkid: this.chatOn,
        mids: this.contextmenu.data.mid,
        oper: 9
      };
      chatcoms.msgOper(ptdata).then(res => {
        if (!res.ok) {
          msgTips(res.msg);
        }
        this.withdrawShow = false;
        this.loading = false;
      })
    },
    /* 消息删除-弹出确认弹框 */
    showDelMsgModel () {
      this.delshow = true;
    },
    /* 取消-删除 */
    cancleDel () {
      this.delshow = false;
    },
    /* 另存为 */
    saveAs (data) {
      let res = this.contextmenu.data
      if (res.ct === 6) {// 图片
        // this.downloadIamge(res.bodyData.url,res.bodyData.filename)
        this.downFileVideo(res.bodyData.url, res.bodyData.filename)
      } else if (res.ct === 5) {// 视频
        log(res.bodyData.url)
        this.downFileVideo(res.bodyData.url, res.vc.filename)
      } else if (res.ct === 3) {// 文件
        this.downFileVideo(res.fc.url, res.fc.filename)
      }
    },
    /**下载视频和文件 */
    // downFileVideo (url, name){
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('GET', url, true);
    //     xhr.responseType = 'blob';    // 返回类型blob
    //     xhr.onload = function () {
    //       if (xhr.readyState === 4 && xhr.status === 200) {
    //           let blob = this.response;
    //           // 转换一个blob链接
    //           let u = window.URL.createObjectURL(new Blob([blob]))
    //           let a = document.createElement('a');
    //           a.download = name;
    //           a.href = u;
    //           a.style.display = 'none'
    //           document.body.appendChild(a)
    //           a.click();
    //           a.remove();
    //       }
    //     };
    //     xhr.send()
    // },
    downloadCrossDomainFile (url, filename) {
      var xhr = new XMLHttpRequest;
      xhr.open('get', url);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          var loaded = parseInt(event.loaded / event.total * 100);

        }
      }
      xhr.onload = function () {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([xhr.response]));
        link.download = filename
        link.click();
        link.remove();
      };
      xhr.send();
    },
    downFileVideo (url1, name) {
      // let url = resUrl(url1)
      let url = "http://121.43.236.18:7070"+url1;
      //this.downloadCrossDomainFile(url, name)
      alert(url+"-"+name)
      axios({
        method: 'get',
        responseType: 'blob',
        url: url
      }).then(response => {
        const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
        // response.header("Access-Control-Allow-Origin", "*"); //设置响应头，*表示任何地址都亦可以访问
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', 'filename.docx'); // 设置保存的文件名
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          URL.revokeObjectURL(fileUrl);
          document.body.removeChild(link);
        }, 100);
      });
      // downloadFile({ fileUrl: url })
    },
    /* 单个下载 */
    downSingle (item, nams) {
      let url = item;
      getFile(url).then(res => {
        let a = document.createElement('a');
        let url = window.URL.createObjectURL(res);
        a.href = url;
        let name = "";

        name = nams;//文件扩展名
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
    /**下载图片 */
    downloadIamge (imgsrc, name) {//下载图片地址和图片名
      var image = new Image();
      // 解决跨域 Canvas 污染问题
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        var url = canvas.toDataURL("image/png"); //得到图片的base64编码数据

        var a = document.createElement("a"); // 生成一个a元素
        var event = new MouseEvent("click"); // 创建一个单击事件
        a.download = name || "photo"; // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
      };
      image.src = 'img' + imgsrc;
    },
    /* 
   *右键-转发功能点击事件 | 发送名片
   *@param {*} transType 1:消息转发；2:发送个人名片；3:分享群聊
   */
    showTransMessage (transType) {
      this.transType = transType;
      this.transShow = true;
    },
    /* 发消息 */
    async sendChatMsg (type, id) {
      let postdata = {
        touid: this.contextmenu.data.uid,
        uid: this.curruid
      };
      let res = await chatcoms.chatActChat(postdata);
      let currpath = this.$route.path;
      if (res.ok) {
        let data = res.data.chat;
        if (currpath == '/home') {
          this.applyThis.$refs.chatlist.chatColClick(data);
        } else {
          this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: false });
          this.$router.push({ path: '/home' });
        }

      } else {
        msgTips(res.msg);
      }
    },
    /* @功能 */
    rightRemind () {
      this.$emit("rightRemind");
    },
    /**引用 */
    referenceMessage () {
      this.$emit("referenceMessage", this.contextmenu.data);
    },
    /* 踢出群聊天 */
    kickGroup () {
      this.kickshow = true;
      this.loading = false
    },
    /* 取消踢出 */
    cancleKick () {
      this.kickshow = false;
    },
    /* 确定删除已选的群成员 */
    sureDelGroupMemb () {
      this.loading = true;
      let _this = this
      let uid = this.contextmenu.data.uid;
      let postdata = {
        uids: uid,
        groupid: this.contextmenu.data.groupid || this.bizId
      };
      let currpath = this.$route.path;
      group.kickGroup(postdata).then((res) => {
        if (res.ok) {
          msgTips("删除成功");
          _this.cancleKick()
          if (currpath == '/group') {
            this.applyThis.$refs.groupinfo.afterDelGroup(uid);
          }
          if (currpath == '/home' && this.cmenutype == 'gavatar') {
            this.$parent.$listeners.getGroupMembers()
          }
        } else {
          msgTips(res.msg);
        }
        this.loading = false;
      })
    },
    /* 申请添加朋友*/
    applyFriend () {
      let uid = this.contextmenu.data.uid;
      this.$emit("userApply", uid); relieveSpeak
    },
    /* 禁言 */
    prohibitSpeak () {
      this.prohibitShow = true
    },
    /* 取消禁言*/
    relieveSpeak () {
      this.relieveProhibit = true
    },
    /* 禁言- 选择 */
    rohibitIsSelect (res, e) {
      this.prohibitList.forEach(item => {
        item.isCheck = false
      });
      this.prohibitList[e].isCheck = true
      let { mode, oper, duration } = res
      this.prohibitData = { mode, oper, duration }
      if (mode == 3) {
        this.prohibitData.duration = ''
      }
    },
    /**禁言 - 按钮 */
    sureForbidden () {
      let data = this.prohibitData
      data.uid = this.contextmenu.data.uid
      data.groupid = this.contextmenu.data.groupid || this.contextmenu.data.g
      group.chatForbidden(data).then(res => {
        if (res.ok) {
          msgTips('禁言成功')
          this.prohibitShow = false
          if (data.duration != '') {
            this.contextmenu.data.forbiddenflag = 1
          } else {
            this.contextmenu.data.forbiddenflag = 3
          }
          if (this.cmenutype == 'avatar') {
            if (data.duration == '') {
              this.isforbidden.flag = 3
            } else {
              this.isforbidden.flag = 1
            }
          }
          this.resetList()
        } else {
          msgTips(res.msg);
        }
      })
    },
    /**解除-禁言 */
    surerRelieveForbidden () {
      let data = this.prohibitData
      data.uid = this.contextmenu.data.uid
      data.groupid = this.contextmenu.data.groupid || this.contextmenu.data.g
      data.oper = 2
      group.chatForbidden(data).then(res => {
        if (res.ok) {
          msgTips('取消禁言成功')
          this.relieveProhibit = false
          this.contextmenu.data.forbiddenflag = 2
          if (this.cmenutype == 'avatar') {
            this.isforbidden.flag = 2
          }
          this.resetList()
        } else {
          msgTips(res.msg);
        }
      })
    },
    /** 重置群聊列表数据 */
    resetList () {
      this.prohibitList = this.$options.data().prohibitList
      this.prohibitData = this.$options.data().prohibitData
    },
    /**设置群管理员 */
    setManager (grouprole) {
      let data = {
        uid: this.contextmenu.data.uid,
        groupid: this.contextmenu.data.groupid || this.bizId,
        grouprole
      }
      let nick = this.contextmenu.data.nick//管理员的名字
      var tips = grouprole == 3 ? `设置${nick}为管理员成功` : `已取消${nick}的管理员`
      group.group_manager(data).then(res => {
        if (res.ok) {
          this.contextmenu.data.grouprole = grouprole
          this.contextmenu.data.selfGrouprole = grouprole
          msgTips(tips);
        } else {
          msgTips(res.msg);
        }
      })
    },
    async removeUser () {
      let groupInfo = await this.getGroupInfo()
      log(groupInfo)

    },
    /**获取群消息 */
    async getGroupInfo () {
      let infoData = await group.getWxGroupInfo(this.groupid, 1);
      this.groupUser = infoData.groupuser;
      infoData.group.intro = infoData.group.intro || '';
      infoData.group.noticetime = infoData.group.noticetime ? infoData.group.noticetime.substring(0, 16) : '';
      this.groupInfo = infoData;
      return this.groupInfo
    },
  },
  // getchatForbiddenFlag(){
  //     let postdata={
  //         groupid:this.contextmenu.data.groupid||this.bizId,
  //         uid:this.contextmenu.data.id
  //     }
  //     log(postdata)
  //     // group.chatForbiddenFlag(postdata).then(res=>{
  //     //     if(res.ok){
  //     //         commit('setForbiddenInfo',res.data)
  //     //     }
  //     // })
  // }
}
</script>
<style lang="less" scoped>
.contextmenu-ul {
  li {
    min-width: none;
    padding: 0;
  }
}
.maintitle {
  padding: 30px 0;
  text-align: center;
  line-height: 20px;
}
.prohibit-modelbody {
  .singletitle {
    padding: 19px 0 15px 30px;
    text-align: left;
  }
  .m-prohibit-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 25px;
    height: 50px;
    span {
      font-size: 16px;
      color: #333333;
    }
    img {
      width: 25px;
      height: 25px;
    }
  }
  .button-group {
    margin-top: 10px;
  }
}
.m-checkbox {
  color: #666;
  display: inline-block;
  line-height: 20px;
  cursor: pointer;
  input[type="checkbox"] {
    appearance: none;
    cursor: pointer;
    width: 18px;
    height: 18px;
    background: url(~@/assets/imgs/group/check.png) no-repeat;
    background-size: 100% 100%;
  }
  input[type="checkbox"]:checked {
    background: url(~@/assets/imgs/group/checked.png) no-repeat;
    background-size: 100% 100%;
  }
}
</style>
