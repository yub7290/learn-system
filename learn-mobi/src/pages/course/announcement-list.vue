<template>
  <view class="announcement-list-page">
    <view class="page-header">
      <text class="page-title">课程公告</text>
      <text class="page-count" v-if="list.length">共 {{ list.length }} 条</text>
    </view>

    <view class="list-wrap">
      <view class="announcement-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
        <view class="item-top">
          <text class="item-title">{{ item.longTitle || item.title }}</text>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="item-meta">
          <text class="item-cate" v-if="item.category">{{ item.category }}</text>
          <text class="item-time">{{ item.createTimeStr || item.createTime || '' }}</text>
        </view>
        <text class="item-summary" v-if="item.summary">{{ item.summary }}</text>
      </view>

      <u-empty v-if="!loading && list.length === 0" text="暂无公告" mode="list" margin-top="60"></u-empty>

      <view v-if="loading" class="loading-wrap">
        <u-loading-icon mode="circle" size="28"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAnnouncementList } from '../../api/announcement'
import type { AnnouncementVO } from '../../types/course'

const cid = ref(0)
const list = ref<AnnouncementVO[]>([])
const loading = ref(true)

onLoad((q: any) => {
  cid.value = Number(q.cid) || 0
  if (cid.value) loadList()
})

async function loadList() {
  loading.value = true
  try {
    list.value = await getAnnouncementList(cid.value)
  } catch {
    uni.showToast({ title: '加载公告失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/course/announcement-detail?id=${id}` }).catch(() => {})
}
</script>

<style scoped lang="scss">
.announcement-list-page { min-height: 100vh; background: $bg-page; }
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 16px 8px;
}
.page-title { font-size: 16px; font-weight: 600; color: $text-1; }
.page-count { font-size: 12px; color: $text-3; }
.list-wrap { padding: 8px 12px; }
.announcement-item {
  background: $bg-card; border-radius: 10px; padding: 14px;
  margin-bottom: 10px; box-shadow: $shadow-card;
}
.item-top { display: flex; justify-content: space-between; align-items: flex-start; }
.item-title { font-size: 14px; font-weight: 600; color: $text-1; flex: 1; line-height: 1.4; }
.item-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.item-cate { font-size: 10px; padding: 1px 8px; border-radius: 8px; background: $primary-bg; color: $primary; }
.item-time { font-size: 11px; color: $text-3; }
.item-summary { display: block; font-size: 12px; color: $text-3; margin-top: 8px; line-height: 1.5; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 60px; gap: 10px; }
.loading-text { font-size: 13px; color: $text-3; }
</style>
