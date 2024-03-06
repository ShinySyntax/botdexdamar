<template>
  <div
    class="container"
    @click.stop="stopProp"
  >
    <div
      class="remindContent send-card"
      v-show="showmediaform"
    >
      <p class="remind-title">
        <span>选择要发送的图片或者视频</span>
        <i
          class="iconfont iconIMweb_cancel_cancel closeicon"
          @click="closeDialog"
        ></i>
      </p>
      <div class="send-card-input">
        <div class="send-card-input-title">聊天内容： <i
            title="选择表情"
            class="iconfont iconIMweb_expression"
            @click="IconColor('iconIMweb_expression')"
            @click.stop="chooseEmoji"
          ></i></div>
        <el-input
          id="chat-input"
          placeholder="请输入聊天内容"
          v-model="msgdata"
          clearable
        >
        </el-input>

      </div>
      <div class="send-card-upload">
        <!-- <button title="选择图片" class="primarybtn">
                            <input type="file" accept="image/jpg, image/jpeg, image/png, image/gif" name="file" id="chooseImg" class="hidefile" @change="changeAvatar">
                            选择图片
                        </button> -->
        <el-upload
          action
          list-type="picture-card"
          :http-request="handleUpload"
          :auto-upload="true"
          :on-change="handleChange"
          :before-upload="beforeUploadFn"
          :on-preview="handlePictureCardPreview"
          :file-list="fileList"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img
            width="100%"
            :src="dialogImageUrl"
            alt=""
          >
        </el-dialog>
      </div>
      <div class="send-card-btn">
        <el-button
          type="primary"
          @click="submitMediaForm"
        >提交<i class="el-icon-upload el-icon--right"></i></el-button>
      </div>
      <div
        class="tm-emoji-container"
        v-show="showEmoji"
      >
        <i
          class="iconfont iconIMweb_cancel_cancel closeicon"
          @click="closeEmojiDialog"
        ></i>
        <div id="tm-emoji-body">

          <ul class="tm-emoji-body flexbox">
            <li
              v-for="(emoji, index) in emojiList"
              :key="index"
              @click="appendMessages"
              :alt="emoji.alt"
            >
              <img
                :src="staticUrl + 'static/emoji/emoji/' + emoji.url"
                class="small-emoji"
                style="width:24px;"
              />
            </li>
          </ul>
        </div>
        <ul class="tm-emoji-btngroup flexbox">
          <li class="on">
            <img :src="staticUrl + 'static/emoji/emoji/' + emojiList[0].url" />
          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script>
import wsSend from "@/assets/js/ws/send"
import { wscommand } from "@/assets/js/ws/command.js"
import { resUrl } from '@/assets/js/common';
import msgMixin from "@/mixins/msgmixin.js" //发送消息相关逻辑
import { uploadFile, group, msgTips } from "@/axios/path"
import { mapState } from "vuex"
import { emojData } from "@public/static/emoji/emojUtil" //处理表情包方法
export default {
  props: ['showmediaform'],
  data () {
    return {
      showEmoji: false,
      dialogImageUrl: '',
      dialogVisible: false,
      msgdata: '',
      uploadurl: process.env.VUE_APP_apiCtx + "/upload/uploadMedia",
      fileList: [],
      emojiList: emojData.emojiList,
      staticUrl: "", //表情包拼接的绝对路径
    }
  },
  mixins: [msgMixin],
  watch: {
    showEmoji (val) {
      if (!val) {
        $(".iconIMweb_expression").removeClass("icon_select")//移除点击后的样式 
      }
    },
    remindshow (val) {
      if (!val) {
        $(".iconIMweb_").removeClass("icon_select") // 移除点击后的样式 
      }
    }
  },
  mounted () {
    this.staticUrl = process.env.BASE_URL //绝对路径
    this.$nextTick(() => {
      this.$msgcontainer = $("#msgcontainer")
      this.$chatInput = $("#chat-input")
      this.setChatInput(this.$chatInput)
      this.setChatSofftop($("#chat-bottom").offset().top - 88)
    })

  },
  methods: {
    closeEmojiDialog () {
      this.showEmoji = false
    },
    appendMessages (e) {
      //document.documentElement.click()
      let facealt = $(e.currentTarget).attr("alt")
      this.$chatInput.focus()
      if (!this.lastSelection.range) {
        this.getSelecRange()
      }
      // let { range, selection } = this.lastSelection


      // let el = document.createElement("span") //创建一个空的div外壳
      // el.innerHTML = facealt //设置div内容为我们想要插入的内容。
      // let frag = document.createDocumentFragment() //创建一个空白的文档片段，便于之后插入dom树

      // let node = el.firstChild
      // let lastNode = frag.appendChild(node)
      // range.insertNode(frag) //设置选择范围的内容为插入的内容
      // let contentRange = range.cloneRange() //克隆选区
      // contentRange.setStartAfter(lastNode) //设置光标位置为插入内容的末尾
      // contentRange.collapse(true) //移动光标位置到末尾
      // selection.removeAllRanges() //移出所有选区
      // selection.addRange(contentRange) //添加修改后的选区
      this.msgdata += facealt

      $(".iconIMweb_expression").removeClass("icon_select"); // 移除点击后的样式 
    },
    handleChange (file) {

      console.log("file===", file)
      console.log("change up")
    },
    beforeUploadFn (file) {
      console.log("before up")
    },
    handleUpload (file) {
      console.log("出发了")
      console.log(file)
      let fd = new FormData();
      fd.append("uploadFile", file.file, file.name)
      //formData.append("data", file.file);
      //formData.append("name", file.name);
      uploadFile("/upload/uploadMedia", fd).then(res => {
        console.log("upres===", res)
        console.log("files==", this.fileList)
        if (res.ok == true) {
          this.fileList.push(res.data)
        }
      })
    },
    handleRemove (file, fileList) {
      for (let i in fileList) {
        if (file.id === fileList[i].id) {
          fileList.delete(i)
        }
      }
      this.fileList = fileList
      console.log("file==", file);
      console.log("filelist==", fileList)
    },
    handlePictureCardPreview (file) {
      //console.log("file===",file)
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    stopProp () {
    },
    submitMediaForm () {
      let _this = this
      if (this.msgdata == null || this.msgdata == undefined || this.msgdata == "") {
        msgTips("聊天内容不能为空！")
        return false;
      }
      if (this.fileList == null || this.fileList.length <= 0) {
        msgTips("请至少上传一张图片或者一个视频")
        return false;
      }
      if (this.fileList != null && this.fileList.length > 9) {
        msgTips("请不要长传超过9张图片或者视频")
        return false;
      }
      const msg = { msg: this.msgdata, files: JSON.stringify(this.fileList), chatlinkid: this.chatOn }
      console.log("提交数据", msg)
      group.addMediaGroupChat(msg).then(res => {
        if (res.ok) {
          console.log("res==", res)
          msgTips(res.data)
          if (this.chatOn < 0) {
            wsSend(wscommand.WxGroupMsgReq, msg)
          } else {
            wsSend(wscommand.WxFriendMsgReq, msg)
          }
          _this.closeDialog()
        } else {
          msgTips("提交失败")
        }
      });

    },
    /* 关闭弹框 */
    closeDialog () {
      this.$emit("update:showmediaform", false);
      this.fileList = [];
      this.msgdata = "";

    },
  },
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid,
      chatinfo: (state) => state.Ws.chatInfo, //会话详情
      chatOn: (state) => state.Ws.chatOn, //当前会话id
      bizId: (state) => state.Ws.bizId, //当前会话-群聊groupid或私聊好友uid
      MessageList: (state) => state.Ws.MessageList, //消息列表
      imgList: (state) => state.Ws.imgList, //消息中的图片列表
      isGroup: (state) => state.Ws.isGroup, //当前会话-是否为群聊

      applyThis: (state) => state.Ws.applyThis, //当前页面this
      commGroupInfo: (state) => state.CommonInfo.groupUserInfo, //群消息
    }),

  },
}
</script>

<style lang="less" scoped>
@import "~@/assets/style/less/components/home/msglist.less";
@import "~@/assets/style/less/components/home/mediaform.less";
</style>