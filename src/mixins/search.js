import {chatcom,msgTips} from '@/axios/path';
import {defineScroll ,resUrl} from '@/assets/js/common';
const SearchMixin={
    data(){
        return {
            timer:'',//计时器
            searchVal:'',//搜索词
            searchDom:'',
            searchShow:false,//搜索显示状态
            friendList:[],//好友列表
            groupList:[],//群组列表
            moshengList:[],
            upfriendList:[],//前五个好友搜索结果
            upgroupList:[],//前五个群聊搜索结果
            upmsList:[],
            fList:[],//显示的好友列表
            gList:[],//显示的群聊列表
            msList:[], //默认人列表
            orgGroupList:[],//总的群聊列表
        }
    },
    methods:{
        /* 防抖 */
        debounce(fn,delay){
            if(this.timer != null){
                clearTimeout(this.timer); 
            }  
            this.timer = setTimeout(fn,delay);
        },
        /* 重设初始数据 */
        resetSearchData(){
            this.searchVal='';
            this.fList=[];
            this.gList=[];
            this.orgGroupList=[];
            this.serchOne=true;
        },
        /* 搜索 */
        searchFriends(){
            let _this=this;
            this.debounce(function(){
                if(!_this.searchVal){
                    _this.fList=[];
                    _this.gList=[];
                    _this.msList = [];
                    return;
                }
                _this.getSearchFriend();
                if(!_this.serchOne){
                    _this.getSearchGroup();
                }else{
                    _this.getAllGroupList();
                    _this.serchOne=false;
                }
            },300);
        },
        /* 好友搜索 */
        async getSearchFriend(){
            let postdata={
                mode:1,
                searchkey:$.trim(this.searchVal)
            };
            let res=await chatcom.chatMailList(postdata);
            let mailData=res.data;
            if(!mailData)return;
            
            let list=mailData.fd;
            list.map(item=>{
                item.avatar=resUrl(item.avatar);//头像
            });
            let lists=mailData.unfd;
            lists.map(item=>{
                item.avatar=resUrl(item.avatar);//头像
            });

            this.friendList=list;
            this.moshengList = lists;
            this.upfriendList=[...this.friendList].splice(0,5);
            this.fList=this.upfriendList;
            this.upmsList = [...this.moshengList].splice(0,5);
            this.msList = this.upmsList;
            this.$nextTick(()=>{
                if(this.searchDom){
                    this.searchDom.mCustomScrollbar('update');
                }
            })
            
        },
        /* 获取所有的群聊 */
        async getAllGroupList(){
            // let list= this.getMyGroupList();
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
            this.orgGroupList=list;
            this.getSearchGroup();
        },
        /* 群聊搜索 */
        getSearchGroup(){
            if(this.orgGroupList.length>0){
                let reg=new RegExp(`${this.searchVal}`, 'gi');
                let data=[];
                let filterData=[...this.orgGroupList];
                filterData.forEach(function(item){
                    reg.lastIndex=0;
                    if(reg.test(item.name)){
                        data.push(item);
                    }
                });
                this.groupList=[...data];
                this.upgroupList=data.splice(0,5);
                this.gList= this.upgroupList;
                this.$nextTick(()=>{
                    if(this.searchDom){
                        this.searchDom.mCustomScrollbar('update');
                    }
                })
            }
        },
        /* 查看全部搜索好友 */
        seeAllFriend(){
            this.fList=this.friendList;
        },
        seeAllMosheng(){
            this.msList = this.moshengList;
        },
        /* 查看全部搜索群聊 */
        seeAllGroup(){
            this.gList=this.groupList;
        },
        /* 收起搜索好友 */
        upSearchFriend(){
            this.fList=this.upfriendList;
        },
        upSearchMosheng(){
            this.msList = this.upmsList;
        },
        /* 收起搜索群聊 */
        upSearchGroup(){
            this.gList=this.upgroupList;
        },
        /* 高亮 */
        brightenKeyword(val,keyword) {
            val = val + '';
            if (val.indexOf(keyword) !== -1 && keyword !== '') {
                return val.replace(keyword, '<font class="keywordcolor">' + keyword + '</font>')
            } else {
                return val;
            }
        } 
    }
};
export default SearchMixin;