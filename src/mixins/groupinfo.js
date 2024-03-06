import {group,chatcom,msgTips} from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import {defineScroll,resUrl,tioCache } from '@/assets/js/common';
import { mapState ,mapActions, Store} from 'vuex';
import store from '@/store/index.js';
const GroupInfo={
    data(){
        return {
            groupUser:{},
            groupInfo:{},
            member:{//群成员列表
                pagenum:1,//页码
                totalPage:1,//总页数
                totalRow:1,//群成员总人数
                totalPage:0
            },
            groupMember:[],//成员列表
            grouptype:''
        }
    },
    computed:{
        ...mapState({
            curruser:(state)=>state.User.currUser,
            commGroupInfo:(state)=>state.CommonInfo.groupUserInfo, //群消息
        }),
    },
    methods:{
        ...mapActions(['getUserInfo','getChatGroupInfo']),
        /* 群信息 */
        async getGroupInfo(){
            let infoData=await group.getWxGroupInfo(this.groupid,1);
            // this.getChatGroupInfo(this.groupid);
            // let infoData=this.commGroupInfo
            this.groupUser=infoData.groupuser;
            infoData.group.intro=infoData.group.intro||'';
            infoData.group.noticetime=infoData.group.noticetime?infoData.group.noticetime.substring(0,16):'';
            this.groupInfo=infoData.group;
            if(this.groupInfo.grouprole==1){
                this.groupInfo.nick=this.curruser.nick;
            }else{
                var user = await this.getUserInfo(this.groupInfo.uid);
                this.groupInfo.nick=user.nick;
            }
        },
        /* 群成员列表 */
        getGroupMembers(){
            this.member.pagenum=1;
            this.groupMember=[];
            this.groupMembers();
        },
        /* 群成员列表 */
        async groupMembers(){
            let ptdata={
                groupid: this.groupid,
                pageNumber:this.member.pagenum
            };
            let res=await group.groupMember(ptdata);
            if(res.ok){
                let data=res.data;
                this.member.totalPage=data.totalPage;
                this.member.totalRow=data.totalRow;
                let list=data.list;
                list.map(item=>{
                    item.avatar=resUrl(item.avatar);
                })
               
                this.groupMember=this.groupMember.concat(list);
                log(this.groupMember)
                if(this.member.pagenum==1){
                    let _this=this;
                    this.$nextTick(()=>{
                        defineScroll($("#membercontent"),'',{
                            whileScrolling:function(){
                                if(this.mcs.topPct==95&&_this.member.pagenum< _this.member.totalRow){
                                    _this.member.pagenum++;
                                    _this.groupMembers();
                                }
                            }
                        });
                    })
                }
            }else{
                msgTips(res.msg);
            }
        },
        /* 
        查看
        @param {*} type 类型
         */
        showModel(type){
            this.grouptype=type;
        },
        /* 右键 */
        chatContextMenu(e, v) {
            this.$refs.groupmodel.chatContextMenu(e,v);
        },
        /* 用户头像左键 */
        showUserCard(e,uid){
            this.$refs.groupmodel.showUserCard(e,uid);
        },
        /* 开启群成员邀请 */
        openInvit(){
            this.$refs.groupmodel.modifyApply(1);
        },
        /**修改群审核开关 */
        modifyReview(mode){
            let ptdata = {
                mode,
                groupid: this.groupInfo.id
            }
            var tips=""
            group.modifyReview(ptdata).then((res) => {
                if (res.ok) {
                    if(mode==1){
                        this.groupInfo.joinmode = 1
                        tips = '开启群审核成功'
                    }else{
                        this.groupInfo.joinmode = 2
                        tips = '已关闭群审核'
                    }
                    msgTips(tips)
                } else {
                    msgTips(res.msg)
                }
                this.loading = false
            })
      },
      /**消息免打扰 */
      modifyGroupPush(freeflag){
          let groupid = this.groupid
          let data={
              freeflag,
              groupid
          }
          var tips = freeflag==1?'开启免打扰成功':'已关闭免打扰'
          chatcoms.msgfreeflag(data).then(res=>{
              if(res.ok){
              this.groupUser.msgfreeflag = freeflag
              this.msgfreeflag = freeflag
              let  cacheName = '/chat/group'
              let tioCacheData= tioCache.get(cacheName,this.groupid+'1')
              tioCacheData.groupuser.msgfreeflag = freeflag
              tioCache.set(cacheName,this.groupid+'1', tioCacheData, { exp: 10 })
              msgTips(tips)
              }else{
                  msgTips(res.msg)
              }
          })
      },
      /**设置群内加好友 */
      modifyFriendFlag(friendflag){
          let groupid = this.groupid
          let data={
              friendflag,
              groupid
          }
          var tips = friendflag==1?'开启群内互加好友成功':'已关闭群内互加好友'
          group.modifyFriendFlag(data).then(res=>{
              if(res.ok){
                  this.groupInfo.friendflag = friendflag
                  msgTips(tips)
              }else{
                  msgTips(res.msg)
              }
          })
      }
    }
};
export default GroupInfo;