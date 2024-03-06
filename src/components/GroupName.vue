<template>
    <!-- 修改群名称 -->
    <Dialog v-show="show">
        <div class="modelbody">
            <p class="title">群聊名称</p>
            <div class="groupipt"> 
                <input maxlength="30" :value="name" @input="handleInput" placeholder="自定义群名称"/>
                <p class="num-count">{{name?name.length:0}}/30</p>
            </div>
            <div class="button-group">
                <button class="primarybtn default" @click="cancleUpdateGn">取消</button>
                <button class="primarybtn" @click="modifyGroupName" :disabled="loading">确定</button>
            </div>
        </div>
    </Dialog>
</template>
<script>
import {group,msgTips} from '@/axios/path';
export default {
    props:['show','name','groupid'],
    data(){
        return {
            loading:false
        }
    },
    methods:{
        /* 取消 */
        cancleUpdateGn(){
            this.$emit("update:show",false);
        },
        handleInput(e) {
            this.$emit("update:name", e.target.value);
        },
        /* 确定修改群聊名称 */
        modifyGroupName(){
            this.loading=true;
            let ptdata={groupid: this.groupid,name: this.name};
            group.modifyName(ptdata).then(res=>{
                if(res.ok){
                    this.cancleUpdateGn();
                    this.$emit("saveSuccessName",this.name);
                    msgTips("保存成功");
                }else{
                    msgTips(res.msg);
                }
                this.loading=false;
            })
        },
    }
}
</script>
<style lang="less" scoped>
.modelbody{
    width:285px;
    min-width:285px;
    padding-left:30px;
    padding-right:30px;
    .title{
        padding:0;
    }
    .groupipt{
        border:1px solid #f1f1f1;
        width:100%;
        padding: 5px 7px;
        line-height:20px;
        display:flex;
        border-radius: 2px;
        margin-bottom:30px;
        input{
            flex:1;
        }
        .num-count{
            color:#C9C9C9;
            font-size:10px;
            text-align: right;
            flex-shrink: 0;
        }
    }
}
</style>