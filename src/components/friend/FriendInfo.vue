<template>
    <div class="maincontent">
        <div class="infohead" id="infohead">
            {{title}}
        </div>
        <!-- 申请好友列表 -->
        <div class="apply-list" id="apply-list" v-show="type==1">
            <ul>
                <li class="apply-item" v-for="v in applyList" :key="v.uid"   status="v.status" :style="v.status==1?'cursor:pointer;':''"  @click.stop="showUserCard($event,v.uid,v)">
                    <el-image  class="apply-avatar" :src="v.avatar">
                        <div slot="error" class="image-slot">
                            <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                        </div>
                    </el-image>
                    <div class="apply-detail">
                        <p class="apply-name">{{v.nick}}</p>
                        <p class="apply-greet">{{v.greet}}</p>
                    </div>
                    <button v-show="v.status==1" class="apply-passed">已添加</button>
                    <button v-show="v.status==3" class="apply-passed">已忽略</button>
                    <div v-show="v.status==2">
                        <button class="ignore" @click.stop="ignoreApply(v.id)">忽略</button>
                        <button class="apply-agree" @click.stop="agreeApply(v.id)">同意</button>
                    </div>
                    
                </li>
            </ul>
        </div>
        <!-- 好友信息 -->
        <div class="friend-info" v-show="type==2">
            <div class="user-info">
                <el-image  class="user-avatar" :src="friendInfo.avatar">
                    <div slot="error" class="image-slot">
                        <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                    </div>
                </el-image>
                <div class="nick-sign">
                    <div class="friend-nick" v-show="!showRemark">
                        <span class="nick">{{friendInfo.remarkname||friendInfo.nick}}</span>
                        <!-- v-show="curruid!=friendInfo.uid" -->
                        <i class="iconfont iconttubiao_bianji" v-show="curruid!=friendid" @click.stop="showEditIpt"></i>
                    </div>
                    <div class="edit-name"  v-show="showRemark"  @click.stop="stopProp">
                        <input type="text" v-model="userremark" maxlength="30" placeholder="请输入备注名" @mouseup.stop="stopProp"/>
                        <span class="edit-sure" @click="sureSaveRemark">
                        </span>
                    </div>
                </div>
                <div class="delfriend" v-show="curruid!=friendid"  @click="delFriend(friendid)">
                    <i class="iconfont iconIMweb_deldte"></i>删除好友
                </div>
            </div>
            <div class="friend-sign">
                {{friendInfo.sign}}
            </div>
            <div class="user-detail">
                <p class="detail-row">
                    <label>昵  称</label>
                    <span>{{friendInfo.nick}}</span>
                </p>
                <p class="detail-row">
                    <label>地  区</label>
                    <span>{{friendInfo.province}} {{friendInfo.city}}</span>
                </p>
            </div>
            <div class="user-btngroup">
                <button class="primarybtn default" @click="sendCard">发送名片</button>
                <button class="primarybtn" @click="sendMessage(friendid)">发消息</button>
            </div>
        </div>
        <!-- 个人名片 -->
        <UserCard :show.sync="cardshow" :userCard="userCard" ref="usercard"></UserCard>
        <!-- 备注 -->
        <Dialog v-show="applyshow">
            <div class="modelbody applybody">
                <p class="title">
                    <label>好友备注</label>
                </p>
                <div class="apply-content">
                   <textarea maxlength="30" v-model="remarkname"></textarea>
                    <span class="count">{{remarkname.length}}/30</span>
                </div>
                <div class="button-group">
                    <button class="primarybtn default" @click="cancleApply">取消</button>
                    <button class="primarybtn" @click="sureAgree" :disabled="loading">保存</button>
                </div>
            </div>
        </Dialog>
        <!-- 忽略好友申请 -->
        <Dialog v-show="IgnoreApplyshow">
            <div class="modelbody IgnoreApplyshow">
                <p class="title">
                    <label>确定忽略好友请求吗？</label>
                </p>
                <div class="button-group">
                    <button class="primarybtn default" @click="IgnoreApplyshow=false">取消</button>
                    <button class="primarybtn" @click="sureIgnoreApply" :disabled="loading">忽略</button>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import { mapState, mapMutations, mapActions} from 'vuex';
import {friend,msgTips} from '@/axios/path';
import UserCardMixins from '@/mixins/usercard.js';//个人信息卡片
import UserCard from "@/components/UserCard";//个人名片
import {defineScroll,resUrl } from '@/assets/js/common';
export default {
    props:['friendid','type','friendItem'],
    data(){
        return {
            applyshow:false,//同意申请弹框
            applyid:'',//申请人uid
            loading:false,
            remarkname:'',//备注
            title:'好友请求',
            friendInfo:{},//好友信息
            showRemark:false,//编辑备注名
            userremark:'',//好友备注名
            IgnoreApplyshow:false,//忽略好友申请弹窗
        }
    },
    created(){
        this.getApplyList();
    },
    mounted(){
        this.$nextTick(()=>{
            defineScroll($("#apply-list"));
        })
    },
    watch:{
        type(nv){
            if(nv==1){
                this.title="好友请求";
                this.getApplyList();
            }
        },
        async friendid(nv){
            if(nv){
                let friendInfo=await this.getUserInfo(nv);//好友信息
                this.title= friendInfo.remarkname||friendInfo.nick;//标题为备注或昵称
                friendInfo.avatar=resUrl(friendInfo.avatar);
                this.friendInfo=friendInfo;
            }
        }
    },
    computed:{
        ...mapState({
            curruid:(state)=>state.User.currUid,
            applyList:state=>state.Ws.applyList,
            noReadApply:state=>state.Ws.noReadApply,//未通过申请好友数
        }),
    },
    mixins:[UserCardMixins],
    components:{
        UserCard
    },
    methods:{
        ...mapActions(['getApplyList','getUserInfo']),
        ...mapMutations(['setNoReadApply']),
        /* 阻止冒泡 */
        stopProp(){},
        /* 同意按钮点击事件 */
        agreeApply(applyid){
            document.documentElement.click();
            this.remarkname="";
            this.applyshow=true;
            this.applyid=applyid;
        },
        /* 取消申请 */
        cancleApply(){
            this.applyshow=false;
        },
        /* 同意申请 */
        sureAgree(){
            this.loading=true;
            let postdata={
                applyid:this.applyid,
                remarkname:this.remarkname
            };
            friend.dealApply(postdata).then(res=>{
                this.loading=false;
                if(res.ok){
                    this.applyshow=false;
                    msgTips("添加成功");
                }else{
                    msgTips(res.msg);
                }
            })
        },
        setAddEventListener() {
            let _this=this;
            document.addEventListener('click', function(e){_this.unbindListen(e)}, false);
        },
        /* 解绑监听 */
        unbindListen(e) {
            if(this.showRemark){
                let selection=getSelection();
                if(selection.focusNode.nodeType==1&&selection.focusNode.getAttribute("class").indexOf("edit-name")!=-1){
                  return;  
                }
            }
            this.showRemark=false;
            document.removeEventListener('click', this.$unbindListen, false)
        },
         /* 显示编辑备注输入框 */
        showEditIpt(){
            this.setAddEventListener();
            this.userremark=this.friendInfo.remarkname;
            this.showRemark=true;
        },
        /* 保存修改备注 */
        async sureSaveRemark(){
            let remarkname= this.userremark;
            let postdata={remarkname,frienduid: this.friendid};
            let res=await friend.modifyRemarkname(postdata);
            let currpath=this.$route.path;
            if(res.ok){
                //同步-页面内显示备注的数据
                this.friendInfo.remarkname=remarkname;
                this.showRemark=false;
                msgTips("修改成功");
            }else{
                msgTips(res.msg);
            }
        },
        /* 删除好友 */
        delFriend(uid){
            this.userCard.data.id=uid;
            this.$refs.usercard.showDelModel();
        },
        /* 私聊发送消息 */
        sendMessage(uid){
            this.userCard.data.id=uid;
            this.$refs.usercard.userSendChat();
        },
        /* 分享好友 */
        sendCard(){
            this.friendInfo.uid=this.friendInfo.id;
            this.$emit("sendCard",this.friendInfo);
        },
        /* 忽略好友申请 */
        ignoreApply(applyid){
            this.applyid=applyid;
            this.IgnoreApplyshow = true
        },
        /* 同意忽略好友申请 */
        sureIgnoreApply(){
            this.loading=true;
            let postdata={
                applyid:this.applyid
            };
            let applyList=this.applyList.find(item=>item.id==this.applyid);
            let noReadApply = this.noReadApply-1
            friend.friendIgnoreApply(postdata).then(res=>{
                this.loading=false;
                if(res.ok){
                    this.IgnoreApplyshow=false;
                    applyList.status=3
                    this.setNoReadApply(noReadApply);
                    msgTips("已成功忽略该好友");
                }else{
                    msgTips(res.msg);
                }
            })
        }
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/friend/friendinfo.less";
</style>