const BASE_URL = 'http://localhost:8001/api'

export default {
  data() {
    return {
      drawerShow: false,
      searchKey: "",
      tabList: [{ name: "推荐" }, { name: "热门" }, { name: "直播" }, { name: "免费" }, { name: "会员" }],
      currentTab: 0,
      cateList: [] as Array<any>,
      currentCateId: 0,
      courseList: [] as Array<any>,
      loading: false
    }
  },
  onShow() {
    this.getCateData()
    this.getCourseData()
  },
  methods: {
    toggleDrawer() { this.drawerShow = !this.drawerShow },
    closeDrawer() { this.drawerShow = false },
    selectCate(cateId, parentId) {
      this.currentCateId = cateId
      this.closeDrawer()
      this.getCourseData()
    },
    switchTab(idx) {
      this.currentTab = idx
      this.getCourseData()
    },
    getCateData() {
      uni.request({
        url: BASE_URL + '/course/category',
        method: 'GET',
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.cateList = r.data.data.list || []
          }
        },
        fail: () => { uni.showToast({ title: "分类加载失败", icon: "none" }) }
      })
    },
    getCourseData() {
      if (this.loading) return
      this.loading = true
      uni.request({
        url: BASE_URL + '/course/list',
        method: 'GET',
        data: { cateId: this.currentCateId, tabType: this.currentTab },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.courseList = r.data.data.list || []
          }
        },
        fail: () => { uni.showToast({ title: "课程加载失败", icon: "none" }) },
        complete: () => { this.loading = false }
      })
    },
    doSearch() {
      const keyword = this.searchKey.trim()
      if (keyword.length === 0) { uni.showToast({ title: "请输入关键词", icon: "none" }); return }
      this.loading = true
      uni.request({
        url: BASE_URL + '/course/search',
        method: 'GET',
        data: { keyword: keyword, cateId: this.currentCateId, tabType: this.currentTab },
        success: (res) => {
          const r = res as any
          if (r.statusCode === 200 && r.data.code === 200) {
            this.courseList = r.data.data.list || []
          }
        },
        fail: () => { uni.showToast({ title: "搜索失败", icon: "none" }) },
        complete: () => { this.loading = false }
      })
    },
    goLink(url) {
      if (!url || url.length === 0) return
      uni.navigateTo({ url: url })
    }
  }
}
