<template>
    <div class="friendcontent">
        <div id="friendlist" class="friendlist">
            <ul>
            <!-- 新的朋友 -->
                <li :class="['friend-row',type==1?'on':'']"
                @click="newfriendClick" >
                    <img src="~@/assets/imgs/friend/newfriend.png" class="friend-avatar"/>
                    <p class="friend-name">{{newfrititle}}</p>
                </li>
                <div class="friend-total">
                    <span class="friend-line"></span>
                    <span class="total-count">{{myFriends.totalRow}}位联系人</span>
                    <span class="friend-line"></span>
                </div>
                
                <div v-for="v in friendList" :key="v.index">
                    <div class="letter">{{v.index}}</div>
                    <div>
                        <li :class="['friend-row',(contextmenushow&&contextmenu.data.uid==item.uid)?'hover':'',type==2&&friendInfo.uid==item.uid?'on':'']"
                        v-for="item in v.data" :key="item.uid" @click="friendClick(item)"  @contextmenu.prevent="chatContextMenu($event,item)">
                        <el-image  class="friend-avatar" :src="item.avatar">
                            <div slot="error" class="image-slot">
                                <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                            </div>
                        </el-image>
                        <p class="friend-name">{{item.remarkname||item.nick}}</p>
                        <p class="friend-name" v-if="allconfig.wx_chat_user_isonline_show != null && allconfig.wx_chat_user_isonline_show == '1'">{{item.isonline == '1' ? "在线" : "离线"}}</p>
                        </li>
                    </div>
                </div>
            </ul>
        </div>
        <ul v-show="contextmenushow" 
        class="contextmenu-ul" :style="{top:contextmenu.top,left:contextmenu.left}">
            <li @click="sendMsg">发消息</li>
            <li @click="sendCard">发送名片</li>
            <li @click="delFriend">删除好友</li>
        </ul>
    </div>
</template>
<script>
import {chatcom,friend,msgTips} from '@/axios/path';
import {defineScroll,resUrl,setContextmenu } from '@/assets/js/common';
export default {
    props:['friendInfo','type'],
    data(){
        return {
            friendid:'',//
            myFriends:{
                pagenum:1,
                totalPage:0,
                totalRow:0
            },
            newfrititle:'好友请求',
            friendList:[],//好友列表
            letterArr:[],//字母分类数组
            orgFriendList:[],//原始好友列表数组-非处理后含A、B字母分类的
            contextmenushow:false,
            contextmenu:{//好友列表右键
                top:0,
                left:0,
                data:{}
            },
            allconfig:null
        }
    },
    created(){
        this.getFriendsList();
        this.allconfig = JSON.parse(sessionStorage.getItem("allconfig"))
    },
    watch: {
        friendInfo(data) {
            this.getFriendsList();
        }
    },
    methods:{
        /* 新的朋友点击事件 */
        newfriendClick(){
            this.$emit('setType',1);
            this.$emit('setFriendInfo',{});
        },
        /* 好友点击事件 */
        friendClick(item){
            this.$emit('setType',2);
            this.$emit('setFriendInfo',item);
        },
        /* 好友列表 */
        getFriendsList(){
            this.myFriends.pagenum=1;
            this.getMyFriendList();
        },
        /* 好友名片-我的好友列表 */
        async getMyFriendList(){
            let postdata={mode:1,pageNumber:this.myFriends.pagenum};
            let res=await chatcom.chatMailList(postdata);
            if(!res.ok){
                msgTips(res.msg);
                return;
            }
            let mailData=res.data;
            if(!mailData)return;
            let data=mailData.fd;
            this.myFriends.totalPage=data.totalPage;//总页数
            this.myFriends.totalRow=data.totalRow;//总条数
            let list=data.list;
            
            let contdata=[];//根据字母分类的数组
            if(this.myFriends.pagenum==1){
                this.friendList=[];
                this.letterArr=[];//字母数组
            }else{
                contdata=[...this.friendList];
            }
            
            let setObj=this.setChatIndex(list,contdata,'letterArr');
            this.friendList=setObj.contdata;
            //分页数据处理
            this.scrollNextPage(setObj);
        },
        scrollNextPage(setObj){
            let _this=this;
            if(this.myFriends.pagenum==1){
                this.orgFriendList=setObj.list;
                this.$nextTick(()=>{
                    defineScroll($("#friendlist"),'',{
                        whileScrolling:function(){
                            if(this.mcs.topPct==95&& _this.myFriends.pagenum< _this.myFriends.totalPage){
                                _this.myFriends.pagenum++;
                                _this.getMyFriendList();
                            }
                        }
                    });
                })
            }else{
                this.orgFriendList= this.orgFriendList.concat(setObj.list); 
            }
        },
        /* 
        *列表通讯录数据展示字母分类 
        * list-需处理的数组
        * contdata-处理后返回的数组
        * indexArr-字母分类数组名称
        */
        setChatIndex(list,contdata,indexArr){
            list.map(item=>{
                let chatindex=item.chatindex;
                item.avatar=resUrl(item.avatar);//头像
                if(this[indexArr].find(item=>item==chatindex)){
                    contdata[contdata.length-1]['data'].push(item);
                }else{
                    let obj={index:'',data:[]};
                    this[indexArr].push(chatindex);
                    obj.index=chatindex;
                    obj.data.push(item);
                    contdata.push(obj);
                }
            })
            return {contdata,list};
        },
        /* 好友右键 */
        chatContextMenu(e,item){
            let pos=setContextmenu(e,130);
            this.contextmenu={
                top:pos.otop,
                left: pos.oleft,
                data:item
            };
            this.contextmenushow=true;
            this.$setAddEventListener("contextmenushow");
        },
        /* 发消息 */
        sendMsg(){
            this.$emit("sendMsg",this.contextmenu.data.uid);
        },
        /* 发送名片 */
        sendCard(){
            this.$emit("sendCard",this.contextmenu.data);
        },
        /* 删除好友 */
        delFriend(){
            this.$emit("delFriend",this.contextmenu.data.uid);
        }
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/friend/friendlist.less";
</style>
