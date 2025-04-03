// pages/recruiter/recruiter.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        jobLists: {}, // 改为对象形式存储各分类数据
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0,
        pageSize: 1,
        currentPages: {}, // 记录各分类当前页码
        hasMoreData: {}, // 记录各分类是否还有更多数据
        loadingMore: false // 是否正在加载更多
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.getJobs(true)
        app.on('jobBrowsed', this.handleJobBrowsed)
    },

    onUnload() {
        app.off('jobBrowsed', this.handleJobBrowsed)
    },
    // 调整高度计算
    initPage() {
        const { windowHeight, statusBarHeight } = wx.getSystemInfoSync();
        this.setData({
            swiperHeight: windowHeight - 50 - statusBarHeight // 减去tab栏和状态栏高度
        });
    },

    handleJobBrowsed({ jobId }) {
        this.setData({
            jobLists: Object.fromEntries(
                Object.entries(this.data.jobLists).map(([title, jobs]) => [
                    title,
                    jobs.map(job =>
                        job.id === jobId ? { ...job, isBrowsed: true } : job
                    )
                ])
            )
        })
    },

    async getJobs(initialLoad = false) {
        if (this.data.loadingMore && !initialLoad) return

        this.setData({ loadingMore: true })
        initialLoad ? this.showLoading() : wx.showNavigationBarLoading()

        try {
            const currentTabTitle = this.data.tabs[this.data.currentTab]?.name
            const currentPage = initialLoad ? 1 : (this.data.currentPages[currentTabTitle] || 1) + 1

            const res = await wx.cloud.callFunction({
                name: 'getJobs',
                data: {
                    types: '2',
                    currentPage: currentPage,
                    categoryTitles: initialLoad ? [] : [currentTabTitle],
                    pageSize: this.data.pageSize
                }
            })

            let newJobLists = initialLoad ? {} : { ...this.data.jobLists }
            let newCurrentPages = initialLoad ? {} : { ...this.data.currentPages }
            let newHasMoreData = initialLoad ? {} : { ...this.data.hasMoreData }

            if (initialLoad) {
                // 初次加载
                newJobLists = res.result.jobLists
                Object.keys(newJobLists).forEach(title => {
                    newCurrentPages[title] = 1
                    newHasMoreData[title] = res.result.hasMoreData[title]
                })
            } else if (currentTabTitle) {
                // 加载更多
                newJobLists[currentTabTitle] = res.result.jobLists[currentTabTitle] || []
                newCurrentPages[currentTabTitle] = currentPage
                newHasMoreData[currentTabTitle] = res.result.hasMoreData[currentTabTitle]
            }

            // 处理浏览状态
            if (this.data.isLogin) {
                const allJobIds = Object.values(newJobLists).flat().map(job => job.id).filter(Boolean)
                if (allJobIds.length > 0) {
                    const browsedIds = await checkBrowsedStatus(allJobIds, BROWSE_TYPE.JOB)
                    newJobLists = Object.fromEntries(
                        Object.entries(newJobLists).map(([title, jobs]) => [
                            title,
                            jobs.map(job => ({
                                ...job,
                                isBrowsed: browsedIds.includes(job.id)
                            }))
                        ])
                    )
                }
            }

            this.setData({
                tabs: res.result.tabs,
                jobLists: newJobLists,
                currentPages: newCurrentPages,
                hasMoreData: newHasMoreData
            })
        } catch (err) {
            console.error('获取岗位失败:', err)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        } finally {
            this.setData({ loadingMore: false })
            initialLoad ? this.hideLoading() : wx.hideNavigationBarLoading()
        }
    },

    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },

    toDetail(e) {
        const id = e.currentTarget.dataset.id
        if (!id) return

        if (this.data.isLogin) {
            trackBrowse(id, BROWSE_TYPE.JOB)
        }

        wx.navigateTo({
            url: `/pages/jobDetail/jobDetail?id=${id}`,
        })
    },

    getUserId() {
        const userinfo = wx.getStorageSync('userinfo')
        this.setData({
            isLogin: !!userinfo?.openId || !!userinfo?._id
        })
    },

    switchTab(e) {
        const index = e.currentTarget.dataset.index
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    swiperChange(e) {
        const index = e.detail.current
        this.setData({ currentTab: index }, () => {
            this.adjustScrollPosition(index)
        })
    },

    adjustScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data
        const scrollLeft = index * tabWidth - screenWidth / 2 + tabWidth / 2
        this.setData({ scrollLeft: Math.max(0, scrollLeft) })
    },

    showLoading() {
        wx.showLoading({ title: '加载中', mask: true })
    },

    hideLoading() {
        wx.hideLoading()
    },

    onShow() {
        if (!this.data.isLogin) {
            this.getUserId()
        }
        this.getJobs(true)
    },
    // 修改加载更多方法
    loadMore(e) {
        const category = e.currentTarget.dataset.category;
        if (this.data.hasMoreData[category] && !this.data.loadingMore) {
            this.getJobs();
        }
    }


    // // 上拉加载更多
    // onReachBottom() {
    //     const currentTabTitle = this.data.tabs[this.data.currentTab]?.name
    //     if (currentTabTitle && this.data.hasMoreData[currentTabTitle]) {
    //         this.getJobs()
    //     }
    // }
})