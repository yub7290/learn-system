<template>
  <view class="course-page">
    <view class="topbar">
      <u-icon name="list" color="#222" size="22" @click="drawerShow = true"></u-icon>
      <u-search v-model="keyword" placeholder="搜索课程" :showAction="false" @search="doSearch" shape="round" bg-color="#f5f7fa"></u-search>
    </view>

    <u-tabs :list="tabList" :current="tabIndex" @click="onTabClick" line-color="#0195ff" :active-style="{ color: '#0195ff', fontWeight: 600 }"></u-tabs>

    <view class="course-grid" v-if="courseList.length">
      <CourseCard v-for="item in courseList" :key="item.id" :item="item" @click="goDetail" />
    </view>
    <u-empty v-else text="暂无课程" mode="data" margin-top="60"></u-empty>

    <u-loadmore v-if="courseList.length" :status="loadStatus" />

    <view class="mask" v-if="drawerShow" @click="drawerShow = false"></view>
    <view class="drawer" :class="{ open: drawerShow }">
      <view class="drawer-title">课程分类</view>
      <scroll-view scroll-y class="drawer-scroll">
        <view class="cate-item" v-for="c in categoryList" :key="c.id" :class="{ active: c.id === currentCateId }" @click="selectCate(c.id)">
          <text>{{ c.name }}</text>
        </view>
        <u-empty v-if="!categoryList.length" text="暂无分类" mode="list" margin-top="30"></u-empty>
      </scroll-view>
    </view>

    <TabBar :current="1"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import CourseCard from '../../components/CourseCard.vue'
import TabBar from '../../components/TabBar.vue'
import { getCourseCategory, getCourseList, searchCourse } from '../../api/course'
import type { CategoryNode, CourseListItem } from '../../types/course'

const tabList = [{ name: '推荐' }, { name: '热门' }, { name: '直播' }, { name: '免费' }, { name: '会员' }]
const tabIndex = ref(0)
const keyword = ref('')
const drawerShow = ref(false)
const categoryList = ref<CategoryNode[]>([])
const currentCateId = ref(0)
const courseList = ref<CourseListItem[]>([])
const page = ref(1)
const pageSize = 10
const loadStatus = ref<'loadmore' | 'loading' | 'nomore'>('loadmore')

async function loadCategory() {
  try { const res = await getCourseCategory(); categoryList.value = res.list || [] } catch (e) { /* stub -> empty */ }
}

async function loadList(reset = false) {
  if (reset) { page.value = 1; courseList.value = [] }
  loadStatus.value = 'loading'
  try {
    let items: CourseListItem[] = []
    if (keyword.value) {
      const res = await searchCourse({ keyword: keyword.value, cateId: currentCateId.value, tabType: tabIndex.value })
      items = res.list || []; courseList.value = items; loadStatus.value = 'nomore'
    } else {
      const res = await getCourseList({ cateId: currentCateId.value, tabType: tabIndex.value, page: page.value, pageSize })
      items = res.list || []; courseList.value = reset ? items : [...courseList.value, ...items]
      loadStatus.value = items.length < pageSize ? 'nomore' : 'loadmore'
    }
  } catch (e) { loadStatus.value = 'loadmore' }
}

onShow(() => { loadCategory(); loadList(true) })
onReachBottom(() => { if (loadStatus.value === 'loadmore' && !keyword.value) { page.value++; loadList(false) } })

function onTabClick(i: number) { tabIndex.value = i; loadList(true) }
function selectCate(id: number) { currentCateId.value = id; drawerShow.value = false; loadList(true) }
function doSearch() { loadList(true) }
function goDetail(item: CourseListItem) { uni.navigateTo({ url: `/pages/course/detail?cid=${item.id}` }).catch(() => {}) }
</script>

<style scoped lang="scss">
.course-page { min-height: 100vh; padding-bottom: 20px; }
.topbar { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: $bg-card; }
.course-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px 14px; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }
.drawer { position: fixed; left: 0; top: 0; bottom: 0; width: 72%; background: $bg-card; transform: translateX(-100%); transition: transform .25s; z-index: 100; padding-top: 44px; }
.drawer.open { transform: translateX(0); }
.drawer-title { font-size: 15px; font-weight: 700; padding: 12px 16px; color: $text-1; }
.drawer-scroll { height: calc(100vh - 80px); }
.cate-item { padding: 14px 16px; font-size: 14px; color: $text-2; border-bottom: 1px solid $border; }
.cate-item.active { color: $primary; background: $primary-bg; }
</style>
