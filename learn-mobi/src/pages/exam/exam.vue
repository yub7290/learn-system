<template>
  <view class="exam-page">
    <view class="topbar"><text class="title">考试</text></view>
    <u-empty text="考试功能即将上线" mode="news" margin-top="120"></u-empty>
    <TabBar :current="3"></TabBar>
  </view>
</template>

<script setup lang="ts">
import TabBar from '../../components/TabBar.vue'
</script>

<style scoped lang="scss">
.exam-page { min-height: 100vh; background: $bg-page; }
.topbar { padding: 12px 14px; background: $bg-card; }
.title { font-size: 16px; font-weight: 600; color: $text-1; }
</style>
