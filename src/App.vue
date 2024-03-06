<template>
  <div id="app">
     <!-- 单聊或@消息提示声音 -->
      <audio id="nofity_audio">
        <source src="@/assets/audio/person.mp3" type="audio/mp3" />
      </audio>
      <!-- 群聊提示音 -->
      <audio id="group_audio">
        <source src="@/assets/audio/group.mp3" type="audio/mp3" />
      </audio>
    <router-view/>
  </div>
</template>

<style>
#app{
	height: 100%;
	width: 100%;
}
</style>