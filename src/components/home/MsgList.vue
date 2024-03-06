<template>
  <div class="maincontent">
    <!-- 头部 -->
    <div class="chatinfo">
      <span class="chat-name" v-if="isGroup">{{
        chatinfo.name + "(" + chatinfo.joinnum + ")"
      }}</span>
      <span class="chat-name" v-else-if="allconfig.wx_chat_user_isonline_show != null && allconfig.wx_chat_user_isonline_show == '1'">{{
        isonline == '1' ? chatinfo.name + "(在线)" :  chatinfo.name + "(离线)"
      }}</span>
      <span class="chat-name" v-else>{{
        chatinfo.name
      }}</span>
      <div class="info-opera">
        <!-- 举报icon -->
        <span
          class="cursor"
          v-show="(isGroup && chatinfo.linkflag == 1)||!isGroup"
          @click="reportShow=true,isGroup?reportmsg='群聊':reportmsg='用户'"
        ></span>
        <!-- 群聊头部右侧操作图标 -->
        <i
          class="iconfont iconttubiao_point"
          v-show="isGroup && chatinfo.linkflag == 1"
          @click.stop="chatGroupSet"
        ></i>
        <!-- 私聊头部右侧操作图标 -->
        <i
          class="iconfont iconttubiao_point"
          v-show="!isGroup"
          @click.stop="chatPersonSet"
        ></i>
      </div>
    </div>
    <!-- 消息列表 -->
    <div
      :class="msgcontainers"
      id="msgcontainer"
    >
      <ul>
        <!-- 不是删除消息且满足单通道显示 否则隐藏-->
        <li
          :class="[
            !item.delwhere && item.singleshow
              ? (item.type == 1 ) && item.ct !== 12
                ? 'msg-col msg-right-col'
                : item.type == 2&& item.ct !== 12
                ? 'msg-col msg-left-col'
                : item.type == 3 || item.type == 4 || item.ct == 12
                ? 'msg-col msg-center-col'
                : 'msg-hide'
              : 'msg-hide',
          ]"
          v-for="item in MessageList"
          :key="item.mid"
          :mid="item.mid"
        >
          <!-- 如果为系统消息，且满足单通道显示-->
          <!-- <div v-if="item.type == 3 && item.singleshow && curruid != bizId"> -->
          <!-- <div v-if="item.type == 2 && item.singleshow && item.ct==13">
              {{item.mid}}
              {{item.name}}想邀请5好友加入群聊，<span class="cursor">去确认</span>
          </div> -->
          <!-- {{item.apply}} -->
          <div v-if="item.type == 3 && item.singleshow&&item.ct!==13">
            <p>{{ getShowTime(item.t) }}</p>
            <p v-html="item.html"></p>
          </div>
          <div v-if="item.type == 3 &&item.ct==13">
            <p>{{ getShowTime(item.t) }}</p>
            <p>{{ item.name}}想邀请好友加入群聊，<span
                class="cursor examine"
                @click="goExamine(item)"
              >{{item.apply.status==1?'已确认':'去确认'}}</span></p>
          </div>

          <!-- 系统消息的红包提示 -->

          <div v-if="
              (item.type == 1 &&
                item.ct == 12 &&
                item.singleshow &&
                item.touid == curruid) ||
                (item.type == 2 && item.ct == 12 && item.singleshow)
            ">
            <p>{{ getShowTime(item.t) }}</p>
            <p>收到红包，请在手机端查看</p>
          </div>
          <div v-if="
              item.type == 1 &&
                item.ct == 12 &&
                item.singleshow &&
                item.touid != curruid
            ">
            <p>{{ getShowTime(item.t) }}</p>
            <p>发出红包，请在手机端查看</p>
          </div>
          <!-- 系统消息的非好友验证消息 -->
          <div v-if="item.type == 4">
            <p class="systime">{{ getShowTime(item.t) }}</p>
            <span class="sysmsg">{{ item.html
              }}<span
                class="sendapply"
                @click="sendApply"
              >发送好友验证</span></span>
          </div>
          <!-- 判断当前是自己发送的消息并且消息类型不为12（红包类型）&&当前是好友发送的消息并且消息类型不为12（红包类型） -->
          <template v-if="
              ((item.type == 1 && item.ct !== 12 && item.ct !== 13) ||
                (item.type == 2 && item.ct !== 12 && item.ct !== 13)) &&
                item.singleshow &&
                !item.delwhere
            ">
            <el-image
              class="msg-avatar"
              :src="item.avatar"
              @contextmenu.prevent="chatContextMenu($event, item, 'avatar')"
              @click.stop="showCard($event, item.uid,item)"
            >
              <div
                slot="error"
                class="image-slot"
              >
                <img
                  src="~@/assets/imgs/common/avatar.jpg"
                  class="error-img"
                  @contextmenu.prevent="chatContextMenu($event, item, 'avatar')"
                  @click.stop="showCard($event, item.uid,item)"
                />
              </div>
            </el-image>
            <div
              class="msg-right"
              @contextmenu.prevent="chatContextMenu($event, item, 'msg')"
            >
              <p class="msg-top">
                <!--  <i v-if="item.touid!=curruid" :class="item.readflag==1?'wxc_read':'wxc_notread'">{{item.readflag==1?'已读':(item.readflag==2?'未读':'')}}</i> -->
                <div
                  class="msg-ip"
                  v-if="curruid != item.uid && !isGroup && item.showIp===1"
                >IP: {{ item.ip }}-{{ item.country }} {{ item.city }}</div>
                <span class="msg-nick">{{ item.remarkname || item.nick }}</span>
                <span class="msg-time">{{ getShowTime(item.t) }}</span>
              </p>
              <div :class="['msg-bot',item.ct == 5 || item.ct == 6 || item.ct == 9? 'msg-bot-nbg': item.ct == 88? 'msg-bot-nbg not-max-width':'',]">
                <!-- hhhhhhh333={{ item }} -->
                <div v-if="item.g == null || item.g == ''">
                  <i
                  v-if="item.touid != curruid"
                  :class="['msgreadsta',item.readflag == 1 ? 'wxc_read' : 'wxc_notread',]"
                  >
                    {{item.readflag == 1? "已读": item.readflag == 2? "未读": ""}}
                  </i>
                </div>
                <div v-else-if="allconfig.wx_group_readflag_show != null && allconfig.wx_group_readflag_show == '1'">
                  <i
                  v-if="item.f == curruid"
                  :class="['msgreadsta',item.groupreadflag == 1 ? 'wxc_read' : 'wxc_notread',]"
                  >
                    {{item.groupreadflag == 1? "已读": item.groupreadflag == 0? "未读": ""}}
                  </i>
                </div>
                
                <!--  1、普通文本消息，2、超链接卡片消息，3、文件，4、音频，5、视频 ,6.图片 ,9.名片 ,10.视频通话, 11.音频通话, 12.红包-->
                <div
                  v-if="item.ct == 1"
                >
                <!--引用消息-->
                <div v-if="item.refGroupMsg != null" style="background-color: aquamarine; padding: 5px;">
                  <!-- {{ JSON.stringify(item.refGroupMsg.c) }} -->
                  {{ item.refGroupMsg.nick }} :
                  <div
                  v-if="item.refGroupMsg.ct == 1"
                  :id="'copy' + item.refGroupMsg.mid"
                  v-html="item.refGroupMsg.c"></div>

                  <!-- 视频 -->
                <div
                  v-else-if="item.refGroupMsg.ct == 5"
                  class="videocol"
                  @click="videoClick(JSON.parse(item.refGroupMsg.c))"
                >
                  <el-image
                    :src="getResUrl(JSON.parse(item.refGroupMsg.c).coverurl)"
                    fit="cover"
                    class="el-image"
                    :style="{
                      width: 80,
                      height: 60,
                    }"
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
                <!-- 图片 -->
                <div
                  v-else-if="item.refGroupMsg.ct == 6"
                  class="imgcol cursor"
                  :id="'copy' + item.refGroupMsg.mid"
                >
                  <img
                    :src="getResUrl(JSON.parse(item.refGroupMsg.c).coverurl)"
                    fit="cover"
                    :id="'copyImg' + item.refGroupMsg.mid"
                    class="el-image"
                    @click="imgClick(item.refGroupMsg.mid)"
                    :style="{
                      width: 80,
                      height: 60,
                    }"
                  >
                </div>

                  
                </div>
                <div
                  :id="'copy' + item.mid"
                  v-html="item.html"
                ></div>
                
              </div>
                <div
                  v-else-if="item.ct == 3"
                  class="file-flex"
                >
                  <div>
                    <div
                      class="filebg"
                      v-html="strRep(item.html)"
                    ></div>
                    <div class="fileSize">
                      {{ formatFileSize(item.fc.size) }}
                    </div>
                  </div>
                  <img
                    v-if="item.fc.ext == 'docx'"
                    src="~@/assets/imgs/msglist/world.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'jpg' || item.fc.ext == 'png' || item.fc.ext == 'gif'"
                    src="~@/assets/imgs/msglist/jpg.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'xls' || item.fc.ext == 'xlsx'"
                    src="~@/assets/imgs/msglist/xls.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'mp4'"
                    src="~@/assets/imgs/msglist/mp4.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'mp3'"
                    src="~@/assets/imgs/msglist/mp3.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'pdf'"
                    src="~@/assets/imgs/msglist/pdf.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'ppt' || item.fc.ext == 'pptx'"
                    src="~@/assets/imgs/msglist/ppt.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'zip'"
                    src="~@/assets/imgs/msglist/zip.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'apk'"
                    src="~@/assets/imgs/msglist/apk.png"
                    alt=""
                  />
                  <img
                    v-else-if="item.fc.ext == 'txt'"
                    src="~@/assets/imgs/msglist/txt.png"
                    alt=""
                  />
                  <img
                    v-else
                    src="~@/assets/imgs/msglist/notRecogn.png"
                    alt=""
                  />
                </div>

                <div
                  v-else-if="item.ct == 4"
                  class="audiomsg"
                  @click="playAudio(item)"
                  :style="{ width: item.bodyData.width + 'px' }"
                >
                  <span>{{ item.bodyData.seconds }}″</span>
                  <span v-html="item.html"></span>
                  <img
                    src="~@/assets/imgs/home/ownvoice_stop.png"
                    v-show="item.type == 1 && !item.bodyData.play"
                  />
                  <img
                    src="~@/assets/imgs/home/voice_stop.png"
                    v-show="item.type == 2 && !item.bodyData.play"
                  />
                  <img
                    src="~@/assets/imgs/home/ownvoice.gif"
                    v-show="item.type == 1 && item.bodyData.play"
                  />
                  <img
                    src="~@/assets/imgs/home/voice.gif"
                    v-show="item.type == 2 && item.bodyData.play"
                  />
                </div>
                <!-- 视频 -->
                <div
                  v-else-if="item.ct == 5"
                  class="videocol"
                  @click="videoClick(item.bodyData)"
                >
                  <el-image
                    :src="item.bodyData.vcoverurl"
                    fit="cover"
                    class="el-image"
                    :style="{
                      width: item.bodyData.sWidth,
                      height: item.bodyData.sHeight,
                    }"
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
                <!-- 图片 -->
                <div
                  v-else-if="item.ct == 6"
                  class="imgcol cursor"
                  :id="'copy' + item.mid"
                >
                  <img
                    :src="item.bodyData.coverurl"
                    fit="cover"
                    :id="'copyImg' + item.mid"
                    class="el-image"
                    @click="imgClick(item.mid)"
                    :style="{
                      width: item.bodyData.showWidth,
                      height: item.bodyData.showHeight,
                    }"
                  >
                  <!-- <el-image :src="item.bodyData.coverurl" fit="cover" class="el-image" @click="imgClick(item.mid)" :style="{
                      width: item.bodyData.showWidth,
                      height: item.bodyData.showHeight,
                    }">
                  </el-image> -->
                </div>
                <!-- 名片 -->
                <div
                  v-else-if="item.ct == 9"
                  class="cardbg"
                  @click.stop="cardClick($event, item)"
                >
                  <div class="cardtop">
                    <el-image
                      :src="item.bodyData.bizavatar"
                      fit="cover"
                      class="el-image"
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
                    <span class="cardname">{{ item.bodyData.bizname }}</span>
                  </div>
                  <div class="cardbot">
                    <img
                      src="~@/assets/imgs/home/scard.png"
                      v-show="item.bodyData.cardtype == 1"
                    />
                    <img
                      src="~@/assets/imgs/home/gcard.png"
                      v-show="item.bodyData.cardtype == 2"
                    />
                    {{ item.bodyData.cardtype == 2 ? "群名片" : "个人名片" }}
                  </div>
                </div>
                <!-- 音视频通话 10:视频通话；11:音频通话-->
                <div
                  v-else-if="item.ct == 10 || item.ct == 11"
                  class="callcol"
                >
                  <img
                    src="~@/assets/imgs/home/video.png"
                    v-if="item.ct == 10"
                    :class="[
                      'call-icon',
                      item.type == 1 ? 'right-icon rotate' : '',
                    ]"
                  />
                  <img
                    src="~@/assets/imgs/home/autio.png"
                    v-if="item.ct == 11 && item.type == 2"
                    class="call-icon"
                  />
                  <img
                    src="~@/assets/imgs/home/autiort.png"
                    v-if="item.ct == 11 && item.type == 1"
                    class="call-icon right-icon"
                  />
                  {{ item.bodyData.reason }}
                </div>
                <div v-else-if="item.ct == 15">
                  <div class="mediarow">
                    <div
                      class="mediacol"
                      v-for="(items,index) in JSON.parse(item.bodyData.files)"
                      :key="index"
                    >
                      <img
                        v-if="items.type==='img'"
                        :src="items.url"
                        fit="cover"
                        :id="'copyImg' + item.mid"
                        class="el-image"
                        @click="imgClicks(items)"
                        :style="{
                      width: item.coverwidth,
                      height: item.coverheight,
                    }"
                      >

                      <div
                        v-else-if="items.type == 'video'"
                        class="mediacol"
                        @click="videoClicks(items)"
                      >
                        <!-- <img   :src="items.coverurl" fit="cover" :id="'copyImg' + item.mid" class="el-image"  :style="{
                      width: item.coverwidth,
                      height: item.coverheight,
                    }"> -->
                        <el-image
                          :src="getResUrl(items.coverurl)"
                          fit="cover"
                          class="el-image"
                          :style="{
                      width: items.coverwidth,
                      height: items.coverheight,
                    }"
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

                    </div>
                  </div>
                  <span v-html="item.html"></span>
                </div>

                <div v-else-if="item.ct == 17">
                  <div
                    @click="openNotice(item)"
                    style="flex-direction: column;display: flex;"
                  >
                    <div style="flex-direction: row;display: flex;align-items: center;">
                      <div style="flex-direction: column;display: flex;">
                        <span
                          v-html="JSON.parse(JSON.parse(item.c).content).text"
                          style="max-lines: 3;"
                        ></span>

                        <span
                          v-html="JSON.parse(JSON.parse(item.c).content).text"
                          style="max-lines: 3;"
                        ></span>
                      </div>
                      <div style="display: flex; align-items: center; margin-left: 10px;">
                        <img
                          v-if="JSON.parse(JSON.parse(item.c).content).firstpic != null"
                          :src="getResUrl(JSON.parse(JSON.parse(item.c).content).firstpic)"
                          fit="cover"
                          class="el-image"
                          style="width: 60px;height: 60px; align-items: center; justify-items: center;"
                        >
                      </div>
                    </div>

                    <div style="background-color: beige; height: 0.5px; margin-top: 10px;"></div>

                    <span style="margin-top: 8px;">笔记</span>
                  </div>
                </div>
                <!-- 链接消息 -->

                <div v-else-if="item.ct == 88">
                  <div
                    class="hyperlinks cursor"
                    @click="openNews(item.temp.url)"
                  >
                    <div class="hyperlinks-title">{{ item.temp.title }}</div>
                    <div class="hyperlinks-content">
                      <span class="cardname">{{ item.temp.subtitle }}</span>
                      <el-image
                        :src="item.temp.img"
                        fit="cover"
                        class="el-image"
                      >
                        <div
                          slot="error"
                          class="image-slot"
                        >
                          <img
                            src="~@/assets/imgs/msglist/link_default_img.png"
                            class="error-img"
                          />
                        </div>
                      </el-image>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </li>
      </ul>
    </div>

    <div v-if="referenceMessageModel != null" style="display: flex; flex-direction: row; justify-content: space-between; padding: 5px;">
      <div >
        {{ referenceMessageModel.nick }} :
        <!-- 图片 -->
        <div
          v-if="referenceMessageModel.ct == 6"
          class="imgcol cursor"
          :id="'copy' + referenceMessageModel.mid"
        >
          <img
            :src="referenceMessageModel.bodyData.coverurl"
            fit="cover"
            :id="'copyImg' + referenceMessageModel.mid"
            class="el-image"
            @click="imgClick(referenceMessageModel.mid)"
            style="width: 80px;height: 60px;"
          >
        </div>
        <!--文本-->
        <div
          v-else-if="referenceMessageModel.ct == 1"
          :id="'copy' + referenceMessageModel.mid"
          v-html="referenceMessageModel.html"
        ></div>
        <!-- 视频 -->
        <div
          v-else-if="referenceMessageModel.ct == 5"
          class="videocol"
          @click="videoClick(referenceMessageModel.bodyData)"
        >
          <el-image
            :src="referenceMessageModel.bodyData.vcoverurl"
            fit="cover"
            class="el-image"
            style="width: 80px;height: 60px;"
          >
          </el-image>
        </div>
      </div>
      <div style="display: flex; align-content: flex-end; margin-right: 40px; align-items: center;">
        <img @click="referenceMsgClose" src="../../assets/imgs/home/close.png"/>
      </div>
    </div>
    <!-- 发送信息操作区域 -->
    <div
      class="chat-bottom"
      id="chat-bottom"
      v-show="isAdministrator"
    >
      <div class="chat-send-opera">
        <div class="chat-send-icon">
          <i
            title="选择表情"
            class="iconfont iconIMweb_expression"
            @click="IconColor('iconIMweb_expression')"
            @click.stop="chooseEmoji"
          ></i>
          <i
            title="发送图片"
            class="iconfont iconIMweb_picture"
          >
            <input
              type="file"
              accept="image/*"
              id="chat-send-img"
              @change="uploadImg"
            />
          </i>
          <i
            title="发送文件"
            class="iconfont iconIMweb_file"
          >
            <input
              type="file"
              accept="*"
              @change="uploadDix"
            />
          </i>
          <i
            title="发送视频"
            class="iconfont iconIMweb_video"
          >
            <input
              type="file"
              accept="video/*"
              @change="uploadVideo"
            />
          </i>

          <i
            title="@"
            class="iconfont iconIMweb_"
            v-show="isGroup"
            @click="IconColor('iconIMweb_')"
            @click.stop="getRemindContent"
          ></i>
          <i
            title="推荐好友"
            class="iconfont iconIMweb_grcard"
            @click="IconColor('iconIMweb_grcard')"
            @click.stop="shareFriend"
          >
          </i>

          <i
            title="分享群聊"
            class="iconfont iconIMweb_qcard"
            @click="IconColor('iconIMweb_qcard')"
            @click.stop="shareGroup"
          >
          </i>
          <i
            title="语音通话"
            class="iconfont iconvoicecall"
            v-if="!isGroup"
            @click="IconColor('iconvoicecall')"
            @click.stop="wxCallInvite(1)"
          >
          </i>
          <i
            title="视频通话"
            class="iconfont iconVideocall"
            v-if="!isGroup"
            @click="IconColor('iconVideocall')"
            @click.stop="wxCallInvite(2)"
          >
          </i>
          <i
            title="发送多媒体"
            class="iconfont iconIMweb_shrink"
            @click="IconColor('iconIMweb_shrink')"
            @click.stop="showMedia"
          >
          </i>
        </div>
      </div>
      <!-- 输入聊天内容文本框 -->
      <!-- <div
        id="chat-editor"
        name="content"
        class="chat-editor"
        @keydown.enter.prevent="wxTextKey"
        @paste="pasteSend"
        contenteditable="true"
        @input="listenRemind"
        @blur="getSelecRange"
      ></div> -->
      <div
        id="chat-editor"
        name="content"
        class="chat-editor"
        @keydown.enter.prevent="wxTextKey"
        contenteditable="true"
        @paste="pasteSend"
        @input="listenRemind"
        @blur="getSelecRange"
      ></div>
      <div class="chat-send-bot">
        <div class="chat-send-tips">
          Ctrl+Enter：换行
          <span>|</span>
          Enter：发送
        </div>
        <button
          class="primarybtn"
          @click.stop="chatSendMessage"
        >发送</button>
      </div>
      <!-- 表情弹框 -->
      <div
        class="tm-emoji-container"
        v-show="showEmoji"
      >
        <div id="tm-emoji-body">
          <ul class="tm-emoji-body flexbox">
            <li
              v-for="(emoji, index) in emojiList"
              :key="index"
              @click="appendMessage"
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
      <!-- 分享好友名片|群聊名 -->
      <ShareCard
        :pcarshow.sync="pcarshow"
        :gcarshow.sync="gcarshow"
      ></ShareCard>
      <media-form :showmediaform.sync="showmediaform"> </media-form>
    </div>
    <div
      id="view-containers"
      style="display: none"
      class="view-container"
    >
      <img :src="picItem.url" />
    </div>
    <!-- 放大图片容器弹框 -->
    <div
      id="view-container"
      style="display: none"
      class="view-container"
    >
      <img
        :src="item.imgsrc"
        v-for="item in imgList"
        :key="item.mid"
      />
    </div>
    <!-- 视频播放容器 -->
    <Dialog v-show="video.show">
      <div class="modelbody videomodel">
        <p class="title">
          <span
            class="videoname"
            id="videoname"
          >{{ video.title }}</span>
          <i
            class="iconfont iconIMweb_cancel_cancel closeicon"
            @click="closeVideo"
          ></i>
        </p>
        <video
          :src="video.url"
          id="tm-video"
          controls
          loop="loop"
          autoplay="autoplay"
        ></video>
      </div>
    </Dialog>
    <!-- 确定加入群聊-弹框 -->
    <Dialog v-show="joinshow">
      <div class="modelbody">
        <div class="maintitle">
          是否接受邀请加入群聊？
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleJoin"
          >取消</button>
          <button
            class="primarybtn"
            @click="sureJoinGroup"
            :disabled="loading"
          >
            确定
          </button>
        </div>
      </div>
    </Dialog>

    <!-- 图片粘贴发送确认-弹框 -->
    <Dialog v-show="imageSendConfirmshow">
      <div class="modelbody">
        <div class="maintitle">
          是否确定发送？
        </div>
        <div>
          <img :src="imageUrl" style="width: 80%;height: 200px; margin-left: 10%;"/>
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="cancleSendImg"
          >取消</button>
          <button
            class="primarybtn"
            @click="sureSendImg"
            :disabled="loading"
          >
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- @列表 -->
    <div
      id="remindContent"
      class="remindList"
      @click.stop="stopProp"
    >
      <div
        class="remindContent"
        v-show="remindshow"
      >
        <p class="remind-title">
          <span>选择需要提醒的人</span>
          <i
            class="iconfont iconIMweb_cancel_cancel closeicon"
            @click="hideRemind"
          ></i>
        </p>
        <p class="tm-search-friend">
          <i class="iconfont iconIMweb_search"></i>
          <input
            type="text"
            autocomplete="off"
            placeholder="请输入好友名称"
            class="tm-search-input"
            id="remindsearch"
            v-model="remindsearch"
            @input="remindSearch"
          />
        </p>
        <div
          id="remindfriends"
          class="remindbody"
        >
          <ul class="remindfriends">
            <li
              class="remind-col"
              @click.stop="addReMind(atAll)"
            >
              <img
                class="icon_all"
                src="~@/assets/imgs/msglist/@all.png"
                alt=""
              >
              <span>提醒所有人</span>
            </li>
            <li
              class="remind-col"
              @click.stop="addReMind(item)"
              v-for="item in atMemList"
              :key="item.uid"
              v-show="curruid != item.uid"
            >
              <el-image
                :src="item.avatar"
                class="remind-col_img"
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
                class="flexauto"
                v-text="item.nick"
              ></span>
            </li>
          </ul>
          <div
            class="noremind"
            v-show="atMemList.length == 0"
          >暂无数据</div>
        </div>
      </div>
    </div>

    <!-- 消息右键操作框 -->
    <ContextMenu
      :show="contextmenushow"
      :contextmenu="contextmenu"
      :groupInfo="groupInfo"
      :cmenutype="cmenutype"
      :isFriend="isFriend"
      :isforbidden="isforbidden"
      @rightRemind="rightRemind"
      @userApply="userApply"
      @referenceMessage="referenceMessage"
    ></ContextMenu>
    <!-- 个人名片 -->
    <UserCard
      :show.sync="cardshow"
      :userCard="userCard"
      ref="usercard"
    ></UserCard>
    <!-- 群聊信息 -->
    <GroupMore
      ref="groupmore"
      :show.sync="groupmore"
    ></GroupMore>
    <!-- 群聊相关弹框 -->
    <GroupModel
      ref="groupmodel"
      :groupInfo="commGroupInfo"
      :groupApplyInfo="groupApplyInfo"
    ></GroupModel>
    <!-- 举报弹窗 -->
    <Dialog v-show="reportShow">
      <div class="modelbody reportShow-model">
        <p class="title">
          举报投诉
          <!-- 确定要举报该{{reportmsg}}吗？ -->
        </p>
        <div class="areacontainer">
          <textarea
            maxlength="500"
            v-model="reportInput"
            placeholder="请填写举报投诉原因"
          ></textarea>
          <p class="num-count">{{ reportInput.length }}/500</p>
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="reportShow=false"
          >取消</button>
          <button
            class="primarybtn"
            @click="sureSysReport"
            :disabled="loading"
          >
            提交
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 笔记详情弹框 -->
    <Dialog v-show="noticeShow">

      <div
        class="modelbody"
        v-if="clickNotice != null"
        style="overflow-y: auto; max-height: 800px;"
      >
        <div class="maintitle">
          <span v-html="JSON.parse(JSON.parse(clickNotice.c).content).text"></span>
        </div>
        <div
          class="mediacol"
          v-for="(items,index) in JSON.parse(JSON.parse(clickNotice.c).content).files"
          :key="index"
        >
          <img
            v-if="items.type==='1'"
            :src="items.url"
            fit="cover"
            class="el-image"
            @click="imgClicks(items)"
            style="width: 100%;height: 400px;"
          >

          <div
            v-else-if="items.type == '2'"
            class="mediacol"
            @click="videoClicks(items)"
          >
            <el-image
              :src="getResUrl(items.coverurl)"
              fit="cover"
              class="el-image"
              style="width: 100%;height: 400px;"
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
        </div>
        <div class="button-group">
          <button
            class="primarybtn default"
            @click="noticeDialogClose"
          >取消</button>

        </div>
      </div>
    </Dialog>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex"
import ShareCard from "@/components/home/ShareCard" //分享名片
import ContextMenu from "@/components/home/ContextMenu" //右键操作框
import UserCard from "@/components/UserCard" //个人名片
import GroupMore from "@/components/home/GroupMore" //群聊信息
import Viewer from "viewerjs" //放大图片插件
import "viewerjs/dist/viewer.min.css" //放大图片插件css
import wsSend from "@/assets/js/ws/send"
import { wscommand } from "@/assets/js/ws/command.js"
import { getShowTime, defineScroll, resUrl } from "@/assets/js/common"
import { emojData } from "@public/static/emoji/emojUtil" //处理表情包方法
import msgMixin from "@/mixins/msgmixin.js" //发送消息相关逻辑
import UserCardMixins from "@/mixins/usercard.js" //个人信息卡片
import GroupModel from "@/components/group/GroupModel" //群聊信息
import { group, friend, msgTips, chatcom, user } from '@/axios/path';
import MediaForm from './MediaForm.vue'

export default {
  data () {
    return {
      noticeShow: false,
      clickNotice: null,
      isAdministrator: true,
      msgcontainers: 'msgcontainer msgcontainer1',
      chatLength: 0, //最新页消息列表条数
      nextPage: true, //是否加载消息列表下一页
      $msgcontainer: null, //消息列表dom
      $chatEditor: null, //发送消息输入框dom
      video: {
        url: "",
        show: false,
        title: "",
      },
      emojiList: emojData.emojiList,
      staticUrl: "", //表情包拼接的绝对路径
      showEmoji: false, //表情包布局是否显示
      contextmenushow: false,
      contextmenu: {
        //会话列表右键
        top: 0,
        left: 0,
        data: {},
      },
      cmenutype: "msg", //右键类型
      groupmore: false, //群聊信息框显示状态
      reportShow: false,//举报弹窗
      reportmsg: "",//举报弹窗提示信息
      groupInfo: {},
      // groupUserState:{},
      groupApplyInfo: {},//审核需要的信息
      reportInput: "",//举报原因
      atAll: {
        nick: "所有人",
        uid: "all"
      },
      picItem: { url: "" },
      referenceMessageModel: null, // 引用的消息对象
      // 当前用户是否在线
      isonline:'',
      allconfig:null,
    }
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
      isonlineuid: (state) => state.User.isonlineuid,
    }),

  },
  components: {
    ShareCard,
    ContextMenu,
    UserCard,
    GroupMore,
    GroupModel,
    MediaForm
  },
  watch: {
    MessageList: {
      handler (value, oldvalue) {
        console.log("数据发生了变化")
        this.scrollBotm();
      },
      deep: true
    },
    showEmoji (val) {
      if (!val) {
        $(".iconIMweb_expression").removeClass("icon_select")//移除点击后的样式 
      }
    },
    remindshow (val) {
      if (!val) {
        $(".iconIMweb_").removeClass("icon_select") // 移除点击后的样式 
      }
    },
    isonlineuid: {
      handler (value, oldvalue) {
        var isonlineuid = value;
        var uid = isonlineuid.split('-')[0];
        var isonline = isonlineuid.split('-')[1];
        
        if (uid == this.bizId) {
          this.isonline = isonline;
        }
      },
      deep: true
    }
  },
  mounted () {
    this.staticUrl = process.env.BASE_URL //绝对路径
    this.$nextTick(() => {
      this.$msgcontainer = $("#msgcontainer")
      this.$chatEditor = $("#chat-editor")
      this.setChatEditor(this.$chatEditor)
      this.setChatSofftop($("#chat-bottom").offset().top - 88)
    })

    // 监听 emitFn 事件
    this.$bus.$on("referenceMsgClose", (res) => {
      console.log(res) // 我来啦！！！
      this.referenceMsgClose();
    });
    // 用户在线离线状态变化
    this.$bus.$on("userisonlinestatuschange", (res) => {
      this.getuserInfo();
    });
    this.getuserInfo();
  },

  created(){
        
        this.allconfig = JSON.parse(sessionStorage.getItem("allconfig"))
    },

  mixins: [msgMixin, UserCardMixins],
  methods: {
    ...mapActions(["getChatGroupInfo"]),
    ...mapMutations([
      "setChatOldMsg",
      "setChatSofftop",
      "setGroupMore",
      "setCallType",
      "setChatEditor",
    ]),
    /**
     * 获取用户信息
     */
    getuserInfo() {
      // alert('aaaa')
      if(this.isGroup) {
        return;
      }
      user.getUserInfo({uid:this.bizId}).then(res => {
        if (res.ok) {
          this.isonline = res.data.isonline;
        }
      })
    },
    /**
     * 打开笔记
     */
    openNotice (item) {
      this.noticeShow = true;
      this.clickNotice = item;
    },
    /**
     * 关闭笔记
     */
    noticeDialogClose () {
      this.noticeShow = false;
    },
    /**获取配置 */
    initAppConfig () {
      //alert(aaa)
    },
    getResUrl (url) {
      let urls = resUrl(url)
      return urls;
    },
    /* 历史消息 */
    getMsgList (mid, unshift) {
      this.getuserInfo();
      if (this.bizId == '100003') {
        this.isAdministrator = false;
        this.msgcontainers = 'msgcontainer msgcontainer2';
      } else {
        this.isAdministrator = true;
        this.msgcontainers = 'msgcontainer msgcontainer1';
      }
      if (!this.chatOn) {
        return
      }
      if (!mid) {
        this.nextPage = true
      }
      // alert(this.curruid+'---')
      this.setChatOldMsg({
        startmid: mid,
        unshift: unshift,
        chattype: this.isGroup,
        chatlinkid: this.chatOn,
      })
      //请求历史消息
      if (this.isGroup) {
        this.groupChatList(mid, unshift)
      } else {
        this.privaList(mid, unshift)
      }
    },
    /* 群聊历史 */
    groupChatList (mid, unshift) {
      this.referenceMessageModel = null;
      let postdata = {
        chatlinkid: this.chatOn,
        startmid: mid ? mid : "",
      }
      wsSend(wscommand.WxGroupMsgReq, postdata)
    },
    /* 私聊消息 */
    privaList (mid, unshift) {
      this.referenceMessageModel = null;
      let postdata = {
        chatlinkid: this.chatOn,
        startmid: mid ? mid : "",
      }
      wsSend(wscommand.WxFriendMsgReq, postdata)
    },
    /* 初始化聊天定位到底部*/
    initScrollBotm () {


      let scrollTopPx = 0
      let _this = this
      if (this.bizId == '100003') {
        this.isAdministrator = false;
      } else {
        this.isAdministrator = true;
      }
      if (this.$msgcontainer.find(".msg-col").length > 0) {
        let topOffsetPx = this.$msgcontainer.find(".msg-col:first").offset()
          .top,
          domOffsetPx = this.$msgcontainer.find(".msg-col:last").offset().top
        // 目标元素相对于文档偏移量 - 第一个元素相对于文档偏移量 就是滚动条要滚动的距离
        scrollTopPx = domOffsetPx - topOffsetPx
      }
      defineScroll(
        this.$msgcontainer,
        scrollTopPx + "px",
        {
          whileScrolling: function () {
            if (this.mcs.draggerTop <= 10 && _this.nextPage) {
              _this.nextPage = false
              _this.getMsgList(
                _this.$msgcontainer.find("li:first").attr("mid"),
                "unshift"
              )
            }
          },
        },
        { mouseWheel: { scrollAmount: 200, preventDefault: true } }
      )
    },
    scrollBotm () {
      this.$nextTick(() => {
        this.$msgcontainer.mCustomScrollbar("scrollTo", "bottom", {
          scrollInertia: 1,
        })
        //  this.$msgcontainer.mCustomScrollbar("scrollTo",'last', {scrollInertia:1});
      })
    },
    /* 私聊或群聊处理数据及滚动位置 */
    privorgroup (mid) {
      let self = this
      if (!mid) {
        self.$nextTick(() => {
          self.initScrollBotm()
          setTimeout(function () {
            self.scrollBotm()
          }, 300) //防止图片类高度加载不完全不能完全滚动到底部
        })
      } else {
        setTimeout(function () {
          let topOffsetPx = $("#msgcontainer li:first").offset().top,
            domOffsetPx = $("#msgcontainer li")
              .eq(self.chatLength)
              .offset().top,
            // 目标元素相对于文档偏移量 - 第一个元素相对于文档偏移量 就是滚动条要滚动的距离
            scrollTopPx = domOffsetPx - topOffsetPx
          $("#msgcontainer").mCustomScrollbar("scrollTo", scrollTopPx + "px", {
            scrollInertia: 1,
          })
          self.nextPage = true
        }, 150)
      }
    },

    imgClicks (item) {
      console.log("picitems==", item)
      this.picItem.url = item.url
      var viewer = new Viewer(document.getElementById("view-containers"), {
        hidden: function () {
          viewer.destroy()
        },
        button: true,
        // toolbar: {
        //   zoomIn: 4,
        //   zoomOut: 4,
        //   prev: function() {
        //     viewer.prev(false) //当前是第一个时是不转向查看最后一个
        //   },
        //   next: function() {
        //     viewer.next(false) //当前是最后一个时是不转向查看第一个
        //   },
        //   loop: false,
        // },
        loop: false,
        title: false,
        navbar: false,
      })
      viewer.view(this.picItem)
      viewer.show()
    },

    /* 消息中的图片点击事件 */
    imgClick (mid) {
      let index = this.imgList.findIndex((item) => item.mid == mid) //当前第几张图片显示
      var viewer = new Viewer(document.getElementById("view-container"), {
        hidden: function () {
          viewer.destroy()
        },
        button: true,
        toolbar: {
          zoomIn: 4,
          zoomOut: 4,
          prev: function () {
            viewer.prev(false) //当前是第一个时是不转向查看最后一个
          },
          next: function () {
            viewer.next(false) //当前是最后一个时是不转向查看第一个
          },
          loop: false,
        },
        loop: false,
        title: false,
        navbar: false,
      })
      viewer.view(index)
      viewer.show()
    },
    /* 消息中的视频点击事件 */
    videoClick (item) {
      let title = item.title
      if (item.videourl == null) {
        this.video.url = this.getResUrl(item.url)
      } else {
        this.video.url = item.videourl
      }
      
      this.video.title = title
      let $videoDom = $("#tm-video")
      let realw = item.width,
        realh = item.height,
        lw = $(window).width(),
        lh = $(window).height(),
        area = ""
      if (realw / realh > lw / lh) {
        $videoDom.css({
          width: 0.8 * lw + "px",
          height: (0.8 * lw * realh) / realw + "px",
        })
        $("#videoname").css({ width: 0.8 * lw - 100 + "px" })
      } else {
        $videoDom.css({
          width: (0.8 * lh * realw) / realh + "px",
          height: 0.8 * lh + "px",
        })
        $("#videoname").css({ width: (0.8 * lh * realw) / realh - 100 + "px" })
      }
      this.video.show = true
    },

    videoClicks (item) {
      let title = item.title
      this.video.url = item.url
      this.video.title = title
      let $videoDom = $("#tm-video")
      let realw = item.width,
        realh = item.height,
        lw = $(window).width(),
        lh = $(window).height(),
        area = ""
      if (realw / realh > lw / lh) {
        $videoDom.css({
          width: 0.8 * lw + "px",
          height: (0.8 * lw * realh) / realw + "px",
        })
        $("#videoname").css({ width: 0.8 * lw - 100 + "px" })
      } else {
        $videoDom.css({
          width: (0.8 * lh * realw) / realh + "px",
          height: 0.8 * lh + "px",
        })
        $("#videoname").css({ width: (0.8 * lh * realw) / realh - 100 + "px" })
      }
      this.video.show = true
    },

    /* 消息播放音频 */
    playAudio (item) {
      let _this = this
      let audio = document.getElementById("audio" + item.bodyData.id)
      audio.currentTime = 0
      // audio.volume = 1;
      let allaudio = document.getElementsByClassName("audio")
      $.each(allaudio, (i, v) => {
        if (audio != v) {
          let mid = v.getAttribute("mid")
          _this.MessageList.map((val) => {
            if (val.mid == mid && val.ct == 4) {
              val.bodyData.play = false
            }
          })
          v.pause()
        }
      })
      if (audio.paused) {
        item.bodyData.play = true
        audio.play()
        $("#audio" + item.bodyData.id).unbind("ended")
        $("#audio" + item.bodyData.id).on("ended", function () {
          item.bodyData.play = false
          audio.pause()
        })
      } else {
        item.bodyData.play = false
        audio.pause()
      }
    },
    /* 关闭视频弹框 */
    closeVideo () {
      this.video.show = false
      this.video.url = ""
    },
    getShowTime (time) {
      return getShowTime(time)
    },
    /* 群聊设置 */
    chatGroupSet () {
      this.setGroupMore(true)
    },
    /* 添加好友 */
    userApply (uid) {
      this.userCard.data.id = uid
      this.$refs.usercard.applyFriend()
    },
    /**引用消息 */
    referenceMessage(message) {
      this.referenceMessageModel = message;
      this.$chatEditor.referenceMessageModel = message;
    },
    referenceMsgClose() {
      this.referenceMessageModel = null;
      this.$chatEditor.referenceMessageModel = null;
    },
    /**
     * 解析文件的大小B、KB、MB、GB
     */
    formatFileSize (fileSize) {
      if (fileSize < 1024) {
        return fileSize + "B"
      } else if (fileSize < 1024 * 1024) {
        var temp = fileSize / 1024
        temp = temp.toFixed(2)
        return temp + "KB"
      } else if (fileSize < 1024 * 1024 * 1024) {
        var temp = fileSize / (1024 * 1024)
        temp = temp.toFixed(2)
        return temp + "MB"
      } else {
        var temp = fileSize / (1024 * 1024 * 1024)
        temp = temp.toFixed(2)
        return temp + "GB"
      }
    },
    IconColor (e) {
      $(`.${e}`).addClass("icon_select")
    },
    openNews (url) {
      window.open(url, "_blank")
    },
    /**审核 */
    goExamine (item) {
      let aid = item.apply.id
      this.groupInfo = item
      group.groupApplyInfo({ aid }).then(res => {
        if (res.ok) {
          res.data.apply.groupavator = resUrl(res.data.apply.groupavator)
          this.groupApplyInfo = res.data
          this.groupApplyInfo.groupApply = item
          res.data.items.map(ite => {
            this.$refs.groupmodel.auditProcessing = true
            ite.avatar = resUrl(ite.avatar)
          })
        }
      })
    },
    /**展示用户的用户信息 */
    async showCard (e, uid, item) {
      // 关闭互加好友功能时，不能查看不是好友用户信信息，除非时管理员和群主
      if (this.isGroup) {
        let isfriend = await friend.isMyFriend(uid);
        if (isfriend == 2) {
          this.getChatGroupInfo(this.bizId)
          let groupInfo = this.commGroupInfo
          if (groupInfo.group.friendflag == 1
            ||
            (groupInfo.group.friendflag == 2
              && (groupInfo.groupuser.grouprole == 1 || groupInfo.groupuser.grouprole == 3))) {
            this.showUserCard(e, uid)
          }
        } else {
          this.showUserCard(e, uid)
        }
      } else {
        this.showUserCard(e, uid)
      }
    },
    /* 群用户状态-当前用户下 */
    //  chatForbiddenFlag(uid){
    //    let postdata={
    //       groupid:this.bizId,
    //       uid
    //    }
    //     group.chatForbiddenFlag(postdata).then(res=>{
    //         if(res.ok){
    //          this.groupUserState = res.data
    //         }
    //     })
    // },
    strRep (str) {
      var reg = /<[^<>]+>/g;
      var str1 = str.replace(reg, '');
      var str2 = str1.replace(/\s+/g, "")
      var last = 0;
      var all = str2.length;
      var fisrt = str2.substring(0, 6);
      if (all > 13) {
        return fisrt + "..." + str2.substring(all - 8)
      } else {
        return str2
      }
    },
    /**举报投诉 */
    sureSysReport () {
      if (this.reportInput == '') {
        msgTips('请填写举报投诉原因')
        return
      }
      let data = {
        reason: this.reportInput
      }
      if (this.isGroup) {
        data.groupid = this.bizId
      } else {
        data.touid = this.bizId
      }
      chatcom.sysReport(data).then(res => {
        if (res.ok) {
          this.reportShow = false
          this.reportInput = ''
          msgTips('举报成功')
        } else {
          msgTips(res.data)
        }

      })
    },
  },
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/home/msglist.less";
</style>
