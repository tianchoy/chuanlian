// pages/recruiter/recruiter.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        jobLists: [],
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.getJobs()
        app.on('jobBrowsed', this.handleJobBrowsed)
    },

    onUnload() {
        app.off('jobBrowsed', this.handleJobBrowsed)
    },

    initPage() {
        const systemInfo = wx.getSystemInfoSync()
        this.setData({
            swiperHeight: systemInfo.windowHeight - 50,
            screenWidth: systemInfo.screenWidth
        })
    },

    handleJobBrowsed({ jobId }) {
        this.setData({
            jobLists: this.data.jobLists.map(tabJobs =>
                tabJobs.map(job =>
                    job._id === jobId ? { ...job, isBrowsed: true } : job
                )
            )
        })
    },

    async getJobs() {
        this.showLoading()
        try {
            const res = await wx.cloud.callFunction({
                name: 'getJobs',
                data: { types: '2' }
            })
            let jobLists = res.result.jobLists
            console.log(jobLists)
            if (this.data.isLogin) {
                const allJobIds = jobLists.flat().map(job => job.id).filter(Boolean)
                if (allJobIds.length > 0) {
                    const browsedIds = await checkBrowsedStatus(allJobIds, BROWSE_TYPE.JOB)
                    jobLists = jobLists.map(tabJobs =>
                        tabJobs.map(job => job ? {
                            ...job,
                            isBrowsed: browsedIds.includes(job.id)
                        } : null).filter(Boolean)
                    )
                }
            }
            this.setData({
                tabs: res.result.tabs,
                jobLists
            })
        } catch (err) {
            console.error('获取岗位失败:', err)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        } finally {
            this.hideLoading()
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
        this.getJobs()
    }
})