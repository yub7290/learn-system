<template>
  <view class="teacher-page">
    <u-loading-icon v-if="loading" text="加载中"></u-loading-icon>
    <view v-else-if="loadError" class="load-error" @click="loadData">{{ loadError }}，点击重试</view>
    <template v-else>
    <!-- 教师详情模式（有 tid 参数） -->
    <template v-if="teacherInfo">
      <view class="teacher-info">
        <image class="info-avatar" :src="teacherInfo.avatarUrl" v-if="teacherInfo.avatarUrl"></image>
        <view class="info-avatar ph" v-else>
          <text class="iconfont icon-lianmengzhuanjia" style="font-size:48rpx;color:$primary"></text>
        </view>
        <view class="info-right">
          <text class="info-name">{{ teacherInfo.name }}</text>
          <text class="info-title" v-if="teacherInfo.titleName">{{ teacherInfo.titleName }}</text>
          <view class="info-rating">
            <u-rate :model-value="teacherInfo.rating || 0" :count="5" size="12" active-color="#ffb400" readonly></u-rate>
          </view>
        </view>
      </view>

      <view class="desc-block">
        <text class="block-title">老师简介</text>
        <text class="desc-text">{{ htmlToText(teacherInfo.desc) || '暂无简介' }}</text>
      </view>

      <!-- TA 的课程 -->
      <view class="course-block" v-if="teacherCourseList.length">
        <text class="block-title">TA 创建的课程</text>
        <view class="course-grid">
          <CourseCard v-for="item in teacherCourseList" :key="item.id" :item="item" @click="goCourseDetail" />
        </view>
      </view>
    </template>

    <!-- 名师列表模式（无 tid 参数） -->
    <template v-else>
      <view class="teacher-grid" v-if="teacherList.length">
        <view class="teacher-card" v-for="t in teacherList" :key="t.id" @click="goTeacher(t.id)">
          <image class="card-avatar" :src="t.avatarUrl" v-if="t.avatarUrl"></image>
          <view class="card-avatar ph" v-else>
            <text class="iconfont icon-lianmengzhuanjia" style="font-size:32rpx;color:$primary"></text>
          </view>
          <text class="card-name">{{ t.name }}</text>
          <text class="card-title" v-if="t.titleName">{{ t.titleName }}</text>
          <text class="card-signature" v-if="t.signature">{{ t.signature }}</text>
        </view>
      </view>
      <u-empty v-else text="暂无教师数据" mode="data" margin-top="80"></u-empty>
    </template>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CourseCard from '../../components/CourseCard.vue'
import { getTeacherList, getTeacherDetail } from '../../api/teacher'
import { htmlToText } from '../../utils/text'
import type { TeacherListItem, TeacherInfoVO, TeacherCourseVO } from '../../types/teacher'
import type { HomeCourseItem } from '../../types/home'

const teacherList = ref<TeacherListItem[]>([])
const teacherInfo = ref<TeacherInfoVO | null>(null)
const teacherCourseList = ref<TeacherCourseVO[]>([])
const teacherId = ref(0)
const loading = ref(true)
const loadError = ref('')

onLoad((query: any) => {
  teacherId.value = Number(query?.tid) || 0
})

onShow(loadData)

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    if (teacherId.value) {
      const res = await getTeacherDetail(teacherId.value)
      teacherInfo.value = res.info || null
      teacherCourseList.value = res.course || []
      if (!teacherInfo.value) loadError.value = '教师不存在'
    } else {
      const res = await getTeacherList()
      teacherList.value = res.list || []
    }
  } catch {
    loadError.value = '教师资料加载失败'
  } finally {
    loading.value = false
  }
}

function goTeacher(id: number) {
  uni.navigateTo({ url: `/pages/teacher/teacher?tid=${id}` }).catch(() => {})
}

function goCourseDetail(item: HomeCourseItem | TeacherCourseVO) {
  uni.navigateTo({ url: `/pages/course/detail?cid=${item.id}` }).catch(() => {})
}
</script>

<style scoped lang="scss">
.teacher-page { min-height: 100vh; padding: 14px; background: $bg-page; }
.load-error { padding: 48px 16px; text-align: center; color: $text-2; }

/* ===== 名师列表 ===== */
.teacher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.teacher-card {
  background: $bg-card; border-radius: 14px; padding: 20px 12px; text-align: center;
  box-shadow: $shadow-card; display: flex; flex-direction: column; align-items: center;
}
.card-avatar { width: 64px; height: 64px; border-radius: 50%; }
.card-avatar.ph {
  width: 64px; height: 64px; border-radius: 50%;
  background: $primary-bg; display: flex; align-items: center; justify-content: center;
}
.card-name { font-size: 14px; font-weight: 600; color: $text-1; margin-top: 10px; }
.card-title { font-size: 12px; color: $primary; margin-top: 4px; }
.card-signature {
  font-size: 11px; color: $text-3; margin-top: 6px; line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

/* ===== 教师详情 ===== */
.teacher-info {
  display: flex; align-items: center; gap: 14px;
  background: $bg-card; border-radius: 14px; padding: 20px; box-shadow: $shadow-card;
}
.info-avatar { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; }
.info-avatar.ph {
  width: 80px; height: 80px; border-radius: 50%;
  background: $primary-bg; display: flex; align-items: center; justify-content: center;
}
.info-right { flex: 1; }
.info-name { font-size: 18px; font-weight: 700; color: $text-1; display: block; }
.info-title { font-size: 13px; color: $primary; display: block; margin-top: 4px; }
.info-rating { margin-top: 6px; }

.desc-block { margin-top: 14px; background: $bg-card; border-radius: 14px; padding: 16px; box-shadow: $shadow-card; }
.block-title { font-size: 15px; font-weight: 700; color: $text-1; display: block; margin-bottom: 8px; }
.desc-text { font-size: 13px; color: $text-2; line-height: 1.7; }

.course-block { margin-top: 14px; }
.course-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
</style>
