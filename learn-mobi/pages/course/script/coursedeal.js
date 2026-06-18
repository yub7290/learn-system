const BASE_URL = 'http://localhost:8001/api'

export default {
  data() {
    return {
      courseId: 0,
      currentTab: 1,
      isIdValid: false,
      pageTitle: "课程详情",
      tabList: [{ name: "课程介绍" }, { name: "章节" }, { name: "学习目标" }, { name: "讲师" }],
      funcList: [
        { iconCode: "\ue62a", name: "视频/直播", badge: 0 },
        { iconCode: "\ue623", name: "试题练习", badge: 2 },
        { iconCode: "\ue61d", name: "在线测试", badge: 0 },
        { iconCode: "\ue62b", name: "结课考试", badge: 0 },
        { iconCode: "\ue62c", name: "知识库", badge: 12 },
        { iconCode: "\ue611", name: "课程公告", badge: 0 },
        { iconCode: "\ue610", name: "AI助教", badge: 0 },
        { iconCode: "\ue61b", name: "综合成绩", badge: 0 }
      ],
      courseInfo: { title: "", bannerImg: "", viewNum: 0, freeFlag: false, desc: "", target: "" },
      chapterList: [] as Array<any>,
      teacherInfo: { avatar: "", name: "", intro: "" },
      loading: false
    }
  },
  onLoad(option) {
    const rawCid = option.cid
    if (rawCid != null) {
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
    goBack() { uni.navigateBack() },
    switchTab(idx) { this.currentTab = idx },
    clickFunc(idx) {
      if (idx === 6) {
        // AI助教跳转到聊天页面
        uni.navigateTo({ url: '/pages/course/ai-tutor?cid=' + this.courseId })
        return
      }
      uni.showToast({ title: "功能开发中", icon: "none" })
    },
    openStudy(chId) {
      uni.navigateTo({ url: '/pages/course/study?chId=' + chId + '&cid=' + this.courseId })
    },
    getDetailData() {
      if (this.loading) return
      this.loading = true

      uni.request({
        url: BASE_URL + '/student/course/detail',
        method: 'GET',
        data: { cid: this.courseId },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.courseInfo = r.data.data.course || this.courseInfo
            this.chapterList = r.data.data.chapter || []
            this.teacherInfo = r.data.data.teacher || this.teacherInfo
          }
        },
        fail: () => { uni.showToast({ title: "课程加载失败", icon: "none" }) },
        complete: () => { this.loading = false }
      })
    }
  }
}
