// pages/recruiter/recruiter.js
import { trackBrowse, checkBrowsedStatus, BROWSE_TYPE } from '../../utils/browseTracker'
const app = getApp()

Page({
    data: {
        isLogin: false,
        isLoading: false,
        tabs: [],
        jobLists: {},        // 当前展示的数据
        cachedJobLists: {},  // 缓存所有分类的数据
        currentTab: 0,
        scrollLeft: 0,
        swiperHeight: 0,
        tabWidth: 117,
        screenWidth: 0,
        pageSize: 10,
        currentPages: {},
        cachedCurrentPages: {},  // 缓存所有分类的页码
        hasMoreData: {},
        cachedHasMoreData: {},   // 缓存所有分类的是否有更多数据
        loadingMore: false,
        showFilter: false,
        filterLocation: '',
        filterLocations: {},
        isFiltering: {},
        categoryMappings: {},
        initialLoadComplete: false  // 标记是否已完成初始加载
    },

    onLoad() {
        this.initPage()
        this.getUserId()
        this.initCate()
        app.on('jobBrowsed', this.handleJobBrowsed)

        // 获取屏幕宽度
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    screenWidth: res.windowWidth
                })
            }
        })
    },

    onUnload() {
        app.off('jobBrowsed', this.handleJobBrowsed)
    },

    // 初始化分类
    initCate() {
        wx.cloud.callFunction({
            name: 'getAllJobCategories',
            data: { types: '2' }
        }).then(res => {
            console.log('初始化分类数据:', res.result)
            this.setData({
                tabs: res.result.tabs || [],
                categoryMappings: res.result.categoryMappings || {},
                jobLists: {},
                cachedJobLists: {},
                currentPages: {},
                cachedCurrentPages: {},
                hasMoreData: {},
                cachedHasMoreData: {},
                initialLoadComplete: false
            }, () => {
                // 加载第一个分类的数据
                if (this.data.tabs.length > 0) {
                    this.getJobsForTab(this.data.tabs[0], true)
                }
            })
        }).catch(err => {
            console.error('初始化分类失败:', err)
            this.setData({
                tabs: [],
                categoryMappings: {}
            })
        })
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
            ),
            cachedJobLists: Object.fromEntries(
                Object.entries(this.data.cachedJobLists).map(([title, jobs]) => [
                    title,
                    jobs.map(job =>
                        job.id === jobId ? { ...job, isBrowsed: true } : job
                    )
                ])
            )
        })
    },

    // 切换筛选面板显示状态
    toggleFilter() {
        this.setData({
            showFilter: !this.data.showFilter
        })
    },

    // 输入框变化事件
    onFilterInput(e) {
        this.setData({
            filterLocation: e.detail.value
        })
    },

    // 应用筛选
    applyFilter() {
        if (this.data.filterLocation.trim() === '') {
            wx.showToast({
                title: '请输入筛选地点',
                icon: 'none'
            })
            return
        }

        const currentTabTitle = this.data.tabs[this.data.currentTab]?.name
        if (!currentTabTitle) return

        this.setData({
            [`filterLocations.${currentTabTitle}`]: this.data.filterLocation,
            [`isFiltering.${currentTabTitle}`]: true,
            showFilter: false,
            [`currentPages.${currentTabTitle}`]: 1,
            [`jobLists.${currentTabTitle}`]: [],
            [`hasMoreData.${currentTabTitle}`]: false,
            [`cachedJobLists.${currentTabTitle}`]: [],  // 清空缓存数据
            [`cachedCurrentPages.${currentTabTitle}`]: 1,
            [`cachedHasMoreData.${currentTabTitle}`]: false
        }, () => {
            this.getJobsForTab(currentTabTitle, true)
        })
    },

    // 清除筛选
    clearFilter() {
        const currentTabTitle = this.data.tabs[this.data.currentTab]?.name
        if (!currentTabTitle) return

        this.setData({
            [`filterLocations.${currentTabTitle}`]: '',
            [`isFiltering.${currentTabTitle}`]: false,
            filterLocation: '', // 清空输入框
            [`currentPages.${currentTabTitle}`]: 1,
            [`jobLists.${currentTabTitle}`]: [],
            [`hasMoreData.${currentTabTitle}`]: false,
            [`cachedJobLists.${currentTabTitle}`]: [],  // 清空缓存数据
            [`cachedCurrentPages.${currentTabTitle}`]: 1,
            [`cachedHasMoreData.${currentTabTitle}`]: false
        }, () => {
            this.getJobsForTab(currentTabTitle, true)
        })
    },

    // 为特定分类获取工作
    async getJobsForTab(tabInfo, initialLoad = false) {
        if (this.data.loadingMore && !initialLoad) return

        // 设置加载状态
        this.setData({ loadingMore: true })
        initialLoad ? this.showLoading() : wx.showNavigationBarLoading()

        try {
            const currentTabTitle = tabInfo.name || tabInfo
            const currentPage = initialLoad ? 1 : (this.data.currentPages[currentTabTitle] || 1) + 1
            const filterLocation = this.data.filterLocations?.[currentTabTitle] || ''

            // 确保数据结构存在
            if (!this.data.jobLists) this.setData({ jobLists: {} })
            if (!this.data.cachedJobLists) this.setData({ cachedJobLists: {} })
            if (!this.data.currentPages) this.setData({ currentPages: {} })
            if (!this.data.cachedCurrentPages) this.setData({ cachedCurrentPages: {} })
            if (!this.data.hasMoreData) this.setData({ hasMoreData: {} })
            if (!this.data.cachedHasMoreData) this.setData({ cachedHasMoreData: {} })

            // 获取分类映射关系
            const mappings = this.data.categoryMappings || {}
            const currentMapping = mappings[currentTabTitle] || {}
            
            // 调用云函数
            const res = await wx.cloud.callFunction({
                name: 'getJobs',
                data: {
                    types: '2',
                    currentPage: currentPage,
                    pageSize: this.data.pageSize,
                    selectedJobCategory: currentMapping.category,
                    selectedJobType: currentMapping.type,
                    filterLocation: filterLocation
                }
            })
            console.log(res.result)
            // 处理返回数据
            const newJobLists = { ...this.data.jobLists }
            const newCachedJobLists = { ...this.data.cachedJobLists }
            const newCurrentPages = { ...this.data.currentPages }
            const newCachedCurrentPages = { ...this.data.cachedCurrentPages }
            const newHasMoreData = { ...this.data.hasMoreData }
            const newCachedHasMoreData = { ...this.data.cachedHasMoreData }

            if (initialLoad) {
                // 初始加载
                newJobLists[currentTabTitle] = res.result.data?.jobs || []
                newCachedJobLists[currentTabTitle] = res.result.data?.jobs || []
            } else {
                // 加载更多 - 修复括号问题
                newJobLists[currentTabTitle] = [
                    ...(newJobLists[currentTabTitle] || []),
                    ...(res.result.data?.jobs || [])
                ]
                newCachedJobLists[currentTabTitle] = [
                    ...(newCachedJobLists[currentTabTitle] || []),
                    ...(res.result.data?.jobs || [])
                ]
            }

            newCurrentPages[currentTabTitle] = currentPage
            newCachedCurrentPages[currentTabTitle] = currentPage
            newHasMoreData[currentTabTitle] = res.result.data?.pagination?.hasMore || false
            newCachedHasMoreData[currentTabTitle] = res.result.data?.pagination?.hasMore || false

            // 处理浏览状态
            if (this.data.isLogin && newJobLists[currentTabTitle]?.length > 0) {
                const jobIds = newJobLists[currentTabTitle].map(job => job.id).filter(Boolean)
                const browsedIds = await checkBrowsedStatus(jobIds, BROWSE_TYPE.JOB)

                newJobLists[currentTabTitle] = newJobLists[currentTabTitle].map(job => ({
                    ...job,
                    isBrowsed: browsedIds.includes(job.id)
                }))
                newCachedJobLists[currentTabTitle] = newCachedJobLists[currentTabTitle].map(job => ({
                    ...job,
                    isBrowsed: browsedIds.includes(job.id)
                }))
            }

            // 更新数据
            this.setData({
                jobLists: newJobLists,
                cachedJobLists: newCachedJobLists,
                currentPages: newCurrentPages,
                cachedCurrentPages: newCachedCurrentPages,
                hasMoreData: newHasMoreData,
                cachedHasMoreData: newCachedHasMoreData,
                initialLoadComplete: true
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
        console.log(e)
        if (!id) return
        if (this.data.isLogin) {
            trackBrowse(id, BROWSE_TYPE.JOB)
        }
        console.log(id)
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
        const currentTab = this.data.tabs[index]
        if (!currentTab) return
        
        const currentTabTitle = currentTab.name
        
        // 先显示缓存数据（如果有）
        if (this.data.cachedJobLists[currentTabTitle]) {
            this.setData({
                currentTab: index,
                [`jobLists.${currentTabTitle}`]: this.data.cachedJobLists[currentTabTitle] || [],
                [`currentPages.${currentTabTitle}`]: this.data.cachedCurrentPages[currentTabTitle] || 1,
                [`hasMoreData.${currentTabTitle}`]: this.data.cachedHasMoreData[currentTabTitle] || false
            }, () => {
                this.adjustScrollPosition(index)
                this.getJobsForTab(currentTab, true)
                // 检查是否需要更新数据（如果缓存数据为空或需要刷新）
                // if (this.data.cachedJobLists[currentTabTitle]?.length === 0 || 
                //     this.data.isFiltering[currentTabTitle]) {
                //     this.getJobsForTab(currentTab, true)
                // }
            })
        } else {
            // 没有缓存数据，直接加载
            this.setData({ currentTab: index }, () => {
                this.adjustScrollPosition(index)
                this.getJobsForTab(currentTab, true)
            })
        }
    },

    swiperChange(e) {
        const index = e.detail.current
        const currentTab = this.data.tabs[index]
        if (!currentTab) return
        
        const currentTabTitle = currentTab.name
        
        // 先显示缓存数据（如果有）
        if (this.data.cachedJobLists[currentTabTitle]) {
            this.setData({
                currentTab: index,
                [`jobLists.${currentTabTitle}`]: this.data.cachedJobLists[currentTabTitle] || [],
                [`currentPages.${currentTabTitle}`]: this.data.cachedCurrentPages[currentTabTitle] || 1,
                [`hasMoreData.${currentTabTitle}`]: this.data.cachedHasMoreData[currentTabTitle] || false
            }, () => {
                this.adjustScrollPosition(index)
                this.getJobsForTab(currentTab, true)
                // 检查是否需要更新数据（如果缓存数据为空或需要刷新）
                // if (this.data.cachedJobLists[currentTabTitle]?.length === 0 || 
                //     this.data.isFiltering[currentTabTitle]) {
                //     this.getJobsForTab(currentTab, true)
                // }
            })
        } else {
            // 没有缓存数据，直接加载
            this.setData({ currentTab: index }, () => {
                this.adjustScrollPosition(index)
                this.getJobsForTab(currentTab, true)
            })
        }
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
    },

    loadMore(e) {
        const category = e.currentTarget.dataset.category;
        if (this.data.hasMoreData[category] && !this.data.loadingMore) {
            const currentTab = this.data.tabs.find(tab => tab.name === category)
            if (currentTab) {
                this.getJobsForTab(currentTab)
            }
        }
    }
})