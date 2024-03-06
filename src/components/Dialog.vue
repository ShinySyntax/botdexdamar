<template>
    <div class="dialog" :style="{'z-index':zindex?zindex:990}" @click.stop="stopProp">
        <div class="mask"></div>
        <slot></slot>
    </div>
</template>
<script>
export default {
    props:['zindex'],
    methods:{
        stopProp(){}
    },
}
</script>
<style lang="less" scoped>
.all{
    width:100%;
    height:100%;
    left:0;
    top:0;
}
.dialog{
    position:fixed;
    .all;
    z-index:990;
    .mask{
        position:absolute;
        background:rgba(0,0,0,0.3);
        z-index:1000;
        .all;
    }
}
</style>