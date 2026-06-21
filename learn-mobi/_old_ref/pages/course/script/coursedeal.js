interface FuncItem {
  iconText: string
  name: string
  badge: number
}
interface ChapterItem {
  id: number
  name: string
}
interface CourseInfo {
  title: string
  bannerImg: string
  viewNum: number
  freeFlag: boolean
  desc: string
  target: string
}
interface TeacherInfo {
  avatar: string
  name: string
  intro: string
}

export default {
  data() {
    return {
      courseId: 0,
      currentTab: 1,
      isIdValid: false,
      pageTitle: "课程详情",
      tabList: [
        { name: "课程介绍" },
        { name: "章节" },
        { name: "学习目标" },
        { name: "讲师" }
      ],
      funcList: [
        { iconText: "▶", name: "视频/直播", badge: 0 },
        { iconText: "▦", name: "试题练习", badge: 2 },
        { iconText: "📖", name: "在线测试", badge: 0 },
        { iconText: "100", name: "结课考试", badge: 0 },
        { iconText: "📚", name: "知识库", badge: 12 },
        { iconText: "🔔", name: "课程公告", badge: 0 },
        { iconText: "🧠", name: "AI助教", badge: 0 },
        { iconText: "★", name: "综合成绩", badge: 0 }
      ] as Array<FuncItem>,
      courseInfo: {
        title: "",
        bannerImg: "",
        viewNum: 0,
        freeFlag: false,
        desc: "",
        target: ""
      } as CourseInfo,
      chapterList: [] as Array<ChapterItem>,
      teacherInfo: {
        avatar: "",
        name: "",
        intro: ""
      } as TeacherInfo,
      loading: false
    }
  },
  onLoad(option: any) {
    // 移除弹窗，避免web端页面自动销毁
    const rawCid = option?.cid
    if (rawCid) {
      const cid = Number(rawCid)
      if (!isNaN(cid) && cid > 0) {
        this.courseId = cid
        this.isIdValid = true
        this.getDetailData()
        return
      }
    }
    this.isIdValid = false
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(idx: number) {
      this.currentTab = idx
    },
    clickFunc(idx: number) {
      uni.showToast({ title: "功能开发中", icon: "none" })
    },
    openStudy(chId: number) {
      uni.navigateTo({
        url: `/pages/study/study?chId=${chId}&cid=${this.courseId}`
      })
    },
    getDetailData() {
      if (this.loading) return
      this.loading = true
      uni.request({
        url: `https://xxx.com/api/course/detail?cid=${this.courseId}`,
        success: (res) => {
          const r = res as any
          if (r.data.code === 200) {
            this.courseInfo = r.data.data.course
            this.chapterList = r.data.data.chapter || []
            this.teacherInfo = r.data.data.teacher
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}