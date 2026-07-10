<template>
  <view class="news-page">
    <view class="nav-bar">
      <u-icon name="arrow-left" size="22" color="#222" @click="goBack"></u-icon>
      <text class="nav-title">新闻资讯</text>
      <view class="nav-right"></view>
    </view>

    <view class="filter-bar">
      <view
        v-for="c in categoryList"
        :key="c.id"
        class="filter-chip"
        :class="{ active: activeCategory === c.id }"
        @click="switchCategory(c.id)"
      >{{ c.name }}</view>
    </view>

    <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
      <view
        v-for="item in list"
        :key="item.id"
        class="news-item"
        @click="goDetail(item.id)"
      >
        <image
          class="news-cover"
          :src="item.coverUrl || '/static/default-cover.png'"
          mode="aspectFill"
        />
        <view class="news-info">
          <text class="news-title">{{ item.title }}</text>
          <text class="news-summary">{{ item.summary || '暂无摘要' }}</text>
          <view class="news-meta">
            <text class="news-cate" v-if="item.categoryName">{{ item.categoryName }}</text>
            <text class="news-time">{{ item.publishTimeStr || item.publishTime || '' }}</text>
            <text class="news-views" v-if="item.views != null">阅读 {{ item.views }}</text>
          </view>
        </view>
      </view>

      <u-empty v-if="!loading && list.length === 0" text="暂无资讯" mode="list" margin-top="80"></u-empty>
      <view v-if="loading" class="loading-wrap">
        <u-loading-icon mode="circle" size="26"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="finished && list.length > 0" class="list-end">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getNewsPage, getNewsCategories } from '../../api/news'
import type { NewsVO, NewsCategoryVO } from '../../types/news'

const categoryList = ref<NewsCategoryVO[]>([{ id: 0, name: '全部' }])
const activeCategory = ref(0)
const list = ref<NewsVO[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)

function switchCategory(id: number) {
  if (activeCategory.value === id) return
  activeCategory.value = id
  resetAndLoad()
}

function resetAndLoad() {
  page.value = 1
  finished.value = false
  list.value = []
  loadList()
}

function loadList() {
  if (loading.value || finished.value) return
  loading.value = true
  const categoryId = activeCategory.value === 0 ? undefined : activeCategory.value
  getNewsPage({ page: page.value, pageSize: pageSize.value, categoryId })
    .then((res) => {
      list.value = list.value.concat(res.list)
      total.value = res.total
      if (list.value.length >= total.value) finished.value = true
      page.value += 1
    })
    .catch(() => uni.showToast({ title: '加载失败', icon: 'none' }))
    .finally(() => {
      loading.value = false
      uni.stopPullDownRefresh()
    })
}

function loadMore() {
  if (!finished.value) loadList()
}

function loadCategories() {
  getNewsCategories()
    .then((res) => {
      categoryList.value = [{ id: 0, name: '全部' }].concat(res || [])
    })
    .catch(() => {})
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/mine/news-detail?id=${id}` }).catch(() => {})
}

function goBack() {
  uni.navigateBack().catch(() => uni.switchTab({ url: '/pages/mine/mine' }))
}

onShow(() => {
  loadCategories()
  resetAndLoad()
})
onPullDownRefresh(() => resetAndLoad())
</script>

<style scoped lang="scss">
.news-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-page;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  background: #fff;
  border-bottom: 1px solid $border;
}
.nav-title { font-size: 17px; font-weight: 600; color: $text-1; }
.nav-right { width: 22px; }
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: $bg-page;
  overflow-x: auto;
}
.filter-chip {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: $text-2;
  background: #fff;
  border: 1px solid $border;
}
.filter-chip.active {
  color: #fff;
  background: $primary;
  border-color: $primary;
}
.list-scroll {
  flex: 1;
  padding: 4px 14px 20px;
  box-sizing: border-box;
}
.news-item {
  display: flex;
  gap: 12px;
  background: $bg-card;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: $shadow-card;
}
.news-cover {
  width: 92px;
  height: 70px;
  border-radius: 8px;
  background: #f0f2f5;
  flex-shrink: 0;
}
.news-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.news-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-1;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.news-summary {
  font-size: 12px;
  color: $text-3;
  margin-top: 6px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 11px;
  color: $text-3;
}
.news-cate { padding: 1px 8px; border-radius: 8px; background: $primary-bg; color: $primary; }
.news-views { margin-left: auto; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 40px; gap: 8px; }
.loading-text { font-size: 13px; color: $text-3; }
.list-end { text-align: center; font-size: 12px; color: $text-3; padding: 16px 0; }
</style>
