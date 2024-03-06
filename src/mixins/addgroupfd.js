import {group,msgTips} from '@/axios/path';
import {defineScroll,resUrl} from '@/assets/js/common';
const AddGroupFd={
    data(){
        return {
            handPage:{//添加群成员-手动分页
                num:1,//页码
                total:1,//总页数
                row:50
            },
            orgList:[],//原始的可邀请好友列表-搜索筛选使用
            handPageList:[],//筛选后可邀请好友列表-手动分页使用
            addFriendList:[],//可邀请列表
            applyval:'',
        }
    },
    methods:{
        /* 初始化数据 */
        initApplyFd(){
            this.shownodata=false;
            this.handPage={
                num:1,
                total:1,
                row:50
            };
            this.addFriendList=[];
            this.delChoosedList=[];
            this.delArr=[];
            this.applyval='';
            this.applyGroupFdList();
        },
        /* 搜索可添加好友 */
        searchApply(val){
            let deloradd=this.deloradd;
            let reg=new RegExp(`${val}`, 'gi');
            let data=[];
            let filterData=this.orgList;
            this.orgList.forEach(function(item){
                reg.lastIndex=0;
                if(reg.test(item.nick)){
                    data.push(item);
                }
            });
            this.handPage.num=1;
            this.handPage.total=Math.ceil(data.length/this.handPage.row);
            this.handPageList=data;
            this.handPaging();
        },
        /* 可邀请好友列表 */
        applyGroupFdList(){
            let ptdata={
                groupid:this.groupInfo.id
            }
            group.applyGroupFdList(ptdata).then(res=>{
                if(res.ok){
                    let data=res.data;
                    this.handPage.total=Math.ceil(data.length/this.handPage.row);
                    this.handPage.num=1;
                    this.orgList=data;//原始所有可邀请好友数据
                    this.handPageList=data;
                    this.handPaging();
                    this.setHandPageScroll();
                    this.shownodata=true;
                }
            })
        },
         /* 手动分页-滚动 */
        setHandPageScroll(){
            let _this=this;
            this.$nextTick(()=>{
                defineScroll($("#addMemberlist"),'',{
                    whileScrolling:function(){
                        if(this.mcs.topPct==95&&  _this.handPage.num< _this.handPage.total){
                            _this.handPage.num++;
                            _this.handPaging();
                        }
                    }
                });
            })
        },
        /* 手动处理分页数据 */
        handPaging(){
            let {num,row}=this.handPage;
            let list=[...this.handPageList].splice((num-1)*row,row);//取第几页数据
            let contdata=[];//根据字母分类的数组
            if(num==1){
                this.addFriendList=[];
                this.letterArr=[];//字母数组
            }else{
                contdata=[...this.addFriendList];
            }
            let setObj=this.setChatIndex(list,contdata,'letterArr');
            this.addFriendList=setObj.contdata;
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
    }
};
export default AddGroupFd;