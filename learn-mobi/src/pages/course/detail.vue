<template>
  <view class="detail-page">
    <view class="banner">
      <view class="back" @click="goBack"><u-icon name="arrow-left" color="#fff" size="20"></u-icon></view>
      <text class="banner-title">{{ info.course.title || '课程详情' }}</text>
      <view class="banner-tag" v-if="info.course.freeFlag">免费</view>
      <text class="banner-view">浏览 {{ info.course.viewNum || 0 }}</text>
    </view>

    <view class="func-grid">
      <view class="func-item" v-for="(f, i) in funcList" :key="i" @click="clickFunc(i)">
        <view class="func-icon" :class="{ accent: f.color === 'accent' }">
          <view v-if="f.iconfont" :class="['iconfont', f.iconfont]" :style="{ fontSize: '22px', color: f.color === 'accent' ? '#ff7847' : '#0195ff' }"></view>
          <u-icon v-else :name="f.icon" :color="f.color === 'accent' ? '#ff7847' : '#0195ff'" size="22"></u-icon>
        </view>
        <text class="func-name">{{ f.name }}</text>
      </view>
    </view>

    <u-tabs :list="tabList" :current="tabIndex" @click="tabIndex = $event.index" line-color="#0195ff" :scrollable="false" :active-style="{ color: '#0195ff', fontWeight: 600 }"></u-tabs>

    <view class="content">
      <view v-if="tabIndex === 0" class="text-content">{{ info.course.desc || '暂无课程介绍' }}</view>
      <view v-if="tabIndex === 1" class="chapter-list">
        <view class="chapter-item" v-for="(ch, i) in info.chapter" :key="ch.id" @click="openStudy(ch.id)">
          <view class="ch-idx">{{ i + 1 }}</view>
          <text class="ch-name">{{ ch.name }}</text>
          <view class="ch-btn">学习</view>
        </view>
        <u-empty v-if="!info.chapter.length" text="暂无章节" mode="list" margin-top="30"></u-empty>
      </view>
      <view v-if="tabIndex === 2" class="text-content">{{ info.course.target || '暂无学习目标' }}</view>
      <view v-if="tabIndex === 3" class="teacher-content">
        <image class="t-avatar" :src="info.teacher.avatar" v-if="info.teacher.avatar"></image>
        <view class="t-avatar ph" v-else></view>
        <text class="t-name">{{ info.teacher.name || '未知讲师' }}</text>
        <text class="t-intro">{{ info.teacher.intro || '暂无讲师简介' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseDetail } from '../../api/course'
import type { CourseDetailVO } from '../../types/course'

const cid = ref(0)
const tabIndex = ref(1)
const tabList = [{ name: '课程介绍' }, { name: '章节' }, { name: '学习目标' }, { name: '讲师' }]
const info = ref<CourseDetailVO>({
  course: { title: '', bannerImg: '', viewNum: 0, freeFlag: false, desc: '', target: '' },
  chapter: [], teacher: { avatar: '', name: '', intro: '' },
})
const funcList = [
  { name: '章节', icon: 'list', color: 'primary' },
  { name: '收藏', icon: 'bookmark', color: 'primary' },
  { name: '分享', icon: 'share', color: 'primary' },
  { name: 'AI助教', icon: 'chat', iconfont: 'icon-ai64', color: 'primary' },
  { name: '考试', icon: 'grid', iconfont: 'icon-shijuan', color: 'accent' },
  { name: '笔记', icon: 'edit-pen', color: 'primary' },
  { name: '评价', icon: 'chat', color: 'primary' },
  { name: '资料', icon: 'attach', color: 'primary' },
]

onLoad((q: any) => { cid.value = Number(q.cid) || 0; if (cid.value) loadDetail() })

async function loadDetail() {
  try { info.value = await getCourseDetail(cid.value) } catch (e) { uni.showToast({ title: '课程加载失败', icon: 'none' }) }
}
function goBack() { uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/course/course' })) }
function openStudy(chId: number) { uni.navigateTo({ url: `/pages/course/study?cid=${cid.value}&chId=${chId}` }).catch(() => {}) }
function clickFunc(i: number) {
  const f = funcList[i]
  if (f.name === 'AI助教') { uni.navigateTo({ url: `/pages/ai/chat?courseId=${cid.value}` }).catch(() => {}); return }
  if (f.name === '章节') { tabIndex.value = 1; return }
  uni.showToast({ title: `${f.name}功能即将上线`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.detail-page { min-height: 100vh; }
.banner { position: relative; height: 180px; background: linear-gradient(135deg,#7ec8ff,#0195ff); display: flex; flex-direction: column; justify-content: space-between; padding: 14px; color: #fff; }
.back { width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; }
.banner-title { position: absolute; top: 14px; left: 54px; right: 14px; font-size: 15px; font-weight: 600; line-height: 30px; }
.banner-tag { background: rgba(255,255,255,.9); color: $primary; display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 12px; align-self: flex-start; }
.banner-view { font-size: 11px; text-align: right; }
.func-grid { background: $bg-card; margin: -14px 12px 0; border-radius: $radius-card; padding: 14px 4px; display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; box-shadow: $shadow-card; position: relative; z-index: 1; }
.func-item { text-align: center; }
.func-icon { width: 36px; height: 36px; border-radius: 10px; background: $primary-bg; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
.func-icon.accent { background: $accent-bg; }
.func-name { font-size: 10px; color: $text-2; margin-top: 4px; }
.content { background: $bg-card; margin: 10px 12px 0; border-radius: $radius-card; padding: 14px; min-height: 200px; }
.text-content { font-size: 14px; color: $text-2; line-height: 1.7; }
.chapter-item { display: flex; align-items: center; padding: 11px 0; border-bottom: 1px solid $border; }
.ch-idx { width: 22px; height: 22px; border-radius: 50%; background: $primary-bg; color: $primary; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.ch-name { flex: 1; margin-left: 10px; font-size: 13px; color: $text-1; }
.ch-btn { font-size: 11px; color: $bg-card; background: linear-gradient(135deg,$primary,$primary-light); padding: 4px 12px; border-radius: 12px; }
.teacher-content { text-align: center; padding: 10px 0; }
.t-avatar { width: 64px; height: 64px; border-radius: 50%; }
.t-avatar.ph { background: #d6dde6; }
.t-name { display: block; font-size: 15px; font-weight: 600; margin-top: 8px; color: $text-1; }
.t-intro { display: block; font-size: 13px; color: $text-3; margin-top: 6px; line-height: 1.6; }
</style>
