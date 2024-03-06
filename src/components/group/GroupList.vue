<template>
    <div class="groupcontent">
         <div id="grouplist" class="grouplist">
            <ul>
                <div class="group-total">
                    <span class="group-line"></span>
                    <span class="total-count">{{totalRow}}个群聊</span>
                    <span class="group-line"></span>
                </div>
                <li :class="['group-row',(contextmenushow&&contextmenu.data.groupid==item.groupid)?'hover':'',groupid==item.groupid?'on':'']"
                    v-for="item in groupList" :key="item.groupid" @click="groupClick(item)"  @contextmenu.prevent="chatContextMenu($event,item)">
                    <el-image  class="group-avatar" :src="item.avatar">
                        <div slot="error" class="image-slot">
                            <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                        </div>
                    </el-image>
                    <div class="row-right">
                        <p class="group-name">{{item.name}}</p>
                        <p class="group-num">
                            <img src="~@/assets/imgs/group/owner.png"
                            class="ownericon" v-if="item.uid==curruid"/>
                             <img src="~@/assets/imgs/group/admin.png"
                            class="ownericon icon_admin" v-if="item.grouprole==3"/>
                            <span>{{item.joinnum}}人</span>
                        </p>
                    </div>
                </li>
            </ul>
        </div>
        <ul v-show="contextmenushow" 
        class="contextmenu-ul" :style="{top:contextmenu.top,left:contextmenu.left}">
            <li @click="sendMsg">发消息</li>
            <li @click="sendCard">分享群聊</li>
            <li v-show="contextmenu.data.uid==curruid" @click="editGroupName(contextmenu.data)">修改群名称</li>
        </ul>
        <!-- 修改群名称 -->
        <GroupName :show.sync="group.show" :name.sync="group.name" :groupid="group.groupid"></GroupName>
    </div>
</template>
<script>
import { mapState} from 'vuex';
import {chatcom,msgTips} from '@/axios/path';
import {defineScroll,resUrl,setContextmenu } from '@/assets/js/common';
import GroupName from '@/components/GroupName';//群名称弹框
export default {
    props:['groupid'],
    data(){
        return {
            groupList:[],
            totalRow:0,
            contextmenushow:false,
            contextmenu:{//好友列表右键
                top:0,
                left:0,
                data:{}
            },
             group:{//修改群名称
                show:false,//弹框显示状态
                name:'',//群名称
                groupid:''
            },
        }
    },
    created(){
        this.getAllGroupList();
    },
    computed:{
        ...mapState({
            curruid:(state)=>state.User.currUid,
            applyThis:state=>state.Ws.applyThis//当前页面this
        }),
    },
    components:{
        GroupName
    },
    methods:{
        /* 获取所有的群聊 */
        async getAllGroupList(){
            let postdata={
                mode:2,
            };
            let list=[];
            let res=await chatcom.chatMailList(postdata);
            let mailData=res.data;
            if(mailData){
                list=mailData.group;
                list.map(item=>{
                    item.avatar=resUrl(item.avatar);//头像
                });
            }
            this.groupList=list;
            this.totalRow=list.length;
            if(!this.groupid){
                this.$emit("setGroupId",list[0].groupid);
            }
            this.$nextTick(()=>{
                defineScroll($("#grouplist"));
            })
        },
        /* 群聊右键 */
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
        /* 群聊点击事件 */
        groupClick(item){
            this.$emit("setGroupId",item.groupid);
            this.applyThis.$refs.groupinfo.showEditName = false
        },
         /* 发消息 */
        sendMsg(){
            this.$emit("sendMsg",this.contextmenu.data.groupid);
        },
        /* 分享群聊 */
        sendCard(){
            this.$emit("sendCard",this.contextmenu.data);
        },
        /* 群聊名称 */
        editGroupName(v){
            this.group.show=true;
            this.group.name=v.name;
            this.group.groupid=v.groupid;
        },
        /* 退出群聊|被踢出群聊|解散群聊 */
        afterOutGroup(bodyObj){
            let groupid=bodyObj.g;
            let index=this.groupList.findIndex(item=>item.groupid==groupid);
            if(index!=-1){
                this.groupList.splice(index,1);
            }
            //右侧显示当前群聊信息
            if(groupid==this.groupid){
                //退出群聊后-群聊数目大于0默认显示第一个群聊信息否则置空
                if(this.groupList.length>0){
                    this.groupClick(this.groupList[0]);
                }else{
                    this.$emit("setGroupId",'');
                }
            }
        },
        
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/group/grouplist.less";
</style>
