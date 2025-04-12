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
            swiperHeight: windowHeight - 50 - statusBarHeight
        });
    },

    // 处理岗位浏览事件（与求职者页面一致）
    handleJobBrowsed: async function({ jobId }) {
        if (!jobId) return;

        // 1. 更新内存状态
        this.updateJobBrowsedStatus(jobId, true);

        // 2. 持久化到本地缓存（无论是否登录）
        const localBrowsed = wx.getStorageSync('browsedJobs') || [];
        if (!localBrowsed.includes(jobId)) {
            wx.setStorageSync('browsedJobs', [...localBrowsed, jobId]);
        }

        // 3. 同步到云端（仅限登录用户）
        const userInfo = wx.getStorageSync('userinfo');
        if (userInfo?._id) {
            try {
                await wx.cloud.callFunction({
                    name: 'addBrowseRecord',
                    data: {
                        userId: userInfo._id,
                        targetId: jobId,
                        type: 'job'
                    }
                });
            } catch (err) {
                console.error('云端同步失败，降级到本地', err);
            }
        }
    },

    // 更新岗位浏览状态（与求职者页面一致）
    updateJobBrowsedStatus: function(jobId, isBrowsed) {
        this.setData({
            jobLists: Object.fromEntries(
                Object.entries(this.data.jobLists).map(([title, jobs]) => [
                    title,
                    jobs.map(job => 
                        job.id === jobId ? { ...job, isBrowsed } : job
                    )
                ])
            ),
            cachedJobLists: Object.fromEntries(
                Object.entries(this.data.cachedJobLists).map(([title, jobs]) => [
                    title,
                    jobs.map(job => 
                        job.id === jobId ? { ...job, isBrowsed } : job
                    )
                ])
            )
        });
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
            [`cachedJobLists.${currentTabTitle}`]: [],
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
            filterLocation: '',
            [`currentPages.${currentTabTitle}`]: 1,
            [`jobLists.${currentTabTitle}`]: [],
            [`hasMoreData.${currentTabTitle}`]: false,
            [`cachedJobLists.${currentTabTitle}`]: [],
            [`cachedCurrentPages.${currentTabTitle}`]: 1,
            [`cachedHasMoreData.${currentTabTitle}`]: false
        }, () => {
            this.getJobsForTab(currentTabTitle, true)
        })
    },

    // 为特定分类获取工作（修改后的版本）
    async getJobsForTab(tabInfo, initialLoad = false) {
        if (this.data.loadingMore && !initialLoad) return

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

            // 1. 先读取本地浏览记录
            const localBrowsed = wx.getStorageSync('browsedJobs') || []

            // 调用云函数获取岗位数据
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

            // 处理返回数据
            let newData = res.result.data?.jobs || []
            newData = newData.map(job => ({
                ...job,
                isBrowsed: localBrowsed.includes(String(job.id))
            }))

            // 如果是登录用户，再检查云端浏览记录
            if (this.data.isLogin) {
                const userInfo = wx.getStorageSync('userinfo')
                if (userInfo?._id) {
                    try {
                        const cloudRes = await wx.cloud.callFunction({
                            name: 'getBrowsedJobs',
                            data: { userId: userInfo._id }
                        })
                        
                        // 确保返回的是数组
                        const cloudBrowsed = Array.isArray(cloudRes.result) 
                            ? cloudRes.result.map(id => String(id))
                            : []
                        
                        newData = newData.map(job => ({
                            ...job,
                            isBrowsed: job.isBrowsed || cloudBrowsed.includes(String(job.id))
                        }))
                    } catch (cloudErr) {
                        console.error('获取云端浏览记录失败:', cloudErr)
                    }
                }
            }

            const currentData = this.data.cachedJobLists[currentTabTitle] || []

            // 更新缓存数据
            const updatedCache = {
                ...this.data.cachedJobLists,
                [currentTabTitle]: initialLoad ? newData : [...currentData, ...newData]
            }

            // 更新显示数据
            const shouldUpdateDisplay = initialLoad || 
                this.data.tabs[this.data.currentTab]?.name === currentTabTitle

            this.setData({
                cachedJobLists: updatedCache,
                [`currentPages.${currentTabTitle}`]: currentPage,
                [`hasMoreData.${currentTabTitle}`]: res.result.data?.pagination?.hasMore || false,
                loadingMore: false,
                ...(shouldUpdateDisplay && {
                    [`jobLists.${currentTabTitle}`]: initialLoad ? newData : [...currentData, ...newData]
                }),
                initialLoadComplete: true
            })

        } catch (err) {
            console.error('获取岗位失败:', err)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
            this.setData({ loadingMore: false })
        } finally {
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
        
        // 记录浏览行为（与求职者页面一致）
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
        const currentTab = this.data.tabs[index]
        if (!currentTab) return

        const currentTabTitle = currentTab.name

        // 先显示缓存数据（如果有）
        if (this.data.cachedJobLists[currentTabTitle]) {
            this.setData({
                currentTab: index,
                [`jobLists.${currentTabTitle}`]: this.data.cachedJobLists[currentTabTitle] || [],
                scrollLeft: this.calculateScrollPosition(index)
            })
            
            // 如果缓存数据为空或需要刷新，则重新加载
            if (this.data.cachedJobLists[currentTabTitle].length === 0 || 
                this.data.isFiltering[currentTabTitle]) {
                this.getJobsForTab(currentTab, true)
            }
        } else {
            // 没有缓存数据，直接加载
            this.setData({ 
                currentTab: index,
                scrollLeft: this.calculateScrollPosition(index)
            }, () => {
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
                scrollLeft: this.calculateScrollPosition(index)
            })
            
            // 如果缓存数据为空或需要刷新，则重新加载
            if (this.data.cachedJobLists[currentTabTitle].length === 0 || 
                this.data.isFiltering[currentTabTitle]) {
                this.getJobsForTab(currentTab, true)
            }
        } else {
            // 没有缓存数据，直接加载
            this.setData({ 
                currentTab: index,
                scrollLeft: this.calculateScrollPosition(index)
            }, () => {
                this.getJobsForTab(currentTab, true)
            })
        }
    },

    // 计算滚动位置
    calculateScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data
        return index * tabWidth - screenWidth / 2 + tabWidth / 2
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
        const category = e.currentTarget.dataset.category
        if (this.data.hasMoreData[category] && !this.data.loadingMore) {
            const currentTab = this.data.tabs.find(tab => tab.name === category)
            if (currentTab) {
                this.getJobsForTab(currentTab)
            }
        }
    },

    onTabItemTap() {
        const currentTab = this.data.tabs[this.data.currentTab]
        if (currentTab) {
            this.getJobsForTab(currentTab, true)
        }
    }
})