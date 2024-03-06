import {group,msgTips} from '@/axios/path';
import {defineScroll,resUrl,debounce } from '@/assets/js/common';
import { mapState ,mapActions} from 'vuex';
const Getforbidden={
    data(){
        return {
            myFriendFilter:[],//好友名片-好友列表
            fpagenum:1,//好友列表页码
            ftotalpage:0,//好友列表总页数
            pcardsearch:'',//好友列表搜索值
            letterArr:[],//字母分类数组
            orgSetList:[],//原始数据结构-未根据字母分类
        }
    },
    computed:{
        ...mapState({
            curruser:(state)=>state.User.currUser,
        }),
    },
    methods:{
        ...mapActions(['getUserInfo']),
                /* 重置好友列表数据 */
              initFriend(){
                  let resetData={
                      myFriendFilter:[],//好友名片-好友列表
                      fpagenum:1,//好友列表页码
                      ftotalpage:0,//好友列表总页数
                      pcardsearch:'',//好友列表搜索值
                      letterArr:[],//字母分类数组
                      orgSetList:[],//原始数据结构-未根据字母分类
                  };
                  Object.assign(this.$data,resetData);//重置数据
              },
              /* 高亮 */
              brightenKeyword(val,keyword) {
                  val = val + '';
                  if (val.indexOf(keyword) !== -1 && keyword !== '') {
                      return val.replace(keyword, '<font class="keywordcolor">' + keyword + '</font>')
                  } else {
                      return val;
                  }
              },
              /* 好友名片-我的好友列表 */
              async getMyFriendList(id){
                  let _this=this,groupid = _this.groupid
                  let postdata={
                    searchkey:this.pcardsearch,
                    groupid:id||groupid,
                    pageNumber:this.fpagenum};
                    this.myFriendFilter=[];
                  let res=await group.forbiddenUserList(postdata);
                  if(!res.ok){
                      msgTips(res.msg);
                      return;
                  }
                  let mailData=res.data;
                  if(!mailData)return;
                  let data=mailData

                  
                  log('人数:'+this.ftotalpage)                  
                  let list=data.list;
                  if(this.friendscrollid=='search-friend-list'){//创建群聊-好友列表去除自己
                      let selfIndex=list.findIndex(item=>item.uid==this.curruid);
                      if(selfIndex!=-1){
                          list.splice(selfIndex,1);
                      }
                  }
                  let contdata=[];//根据字母分类的数组
                  if(this.fpagenum==1){
                      this.myFriendFilter=[];
                      this.letterArr=[];//字母数组
                  }else{
                      contdata=[...this.myFriendFilter];
                  }
                  let setObj=this.setChatIndex(list,contdata,'letterArr');
                    this.myFriendFilter = setObj.contdata;
                    this.ftotalpage = data.totalRow;
                    this.$forceUpdate();
                   //分页数据处理
                  //  for(let i= 0;i<this.myFriendFilter.length;i++){
                    
                  // }
                  // this.myFriendFilter.map((v, i) => {
                  //           this.$nextTick(() => {
                  //             this.myFriendFilter[i].data = setObj.contdata[i]
                  //           })
                  //         })
                  log(this.myFriendFilter)
                  // this.myFriendFilter.map((item,index)=>{
                  //   this.$set(item,i,setObj.contdata[i])
                  // })
                   // this.scrollNextPage(setObj);
              },
              scrollNextPage(setObj){
                  let _this=this;
                  if(this.fpagenum==1){
                      this.orgSetList=setObj.list;
                      this.$nextTick(()=>{
                          defineScroll($("#"+this.friendscrollid),'',{
                              whileScrolling:function(){
                                  if(this.mcs.topPct==95&& _this.fpagenum< _this.ftotalpage){
                                      _this.fpagenum++;
                                      _this.getMyFriendList();
                                  }
                              }
                          });
                      })
                  }else{
                      this.orgSetList= this.orgSetList.concat(setObj.list); 
                  }
              },
              /* 好友名片-好友搜索 */
              friendQuerylist:debounce(function(){
                  this.fpagenum=1;
                  this.getMyFriendList();
              },300),
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
              SecondToDate: function(msd) {
                  var time =msd
                  if(time==0){
                      time = '长期禁言'
                      log('长期禁言')
                     }
                  else if (time > 60 && time < 60 * 60) {
                      time = parseInt(time / 60.0) + "分钟"
                  }
                  else if (time >= 60 * 60 && time <= 60 * 60 * 24) {
                      time = parseInt(time / 3600.0) + "小时"
                  }
                  return time;
              },
    }
};
export default Getforbidden;