Page({
    data: {
        tabs: [
            { name: '一类轮机长', tag: '已下架' },
            { name: '二类轮机长', tag: '招聘中' },
            { name: '三类轮机长', tag: '招聘中' },
            { name: '一类轮船员', tag: '招聘中' },
            { name: '二类轮船员', tag: '招聘中' },
            { name: '三类轮船员', tag: '招聘中' },
            { name: '一类船长', tag: '招聘中' },
            { name: '二类船长', tag: '招聘中' },
            { name: '三类船长', tag: '招聘中' },
            { name: '一类水手', tag: '招聘中' },
            { name: '二类水手', tag: '招聘中' },
            { name: '三类水手', tag: '招聘中' },
            { name: '一类厨师', tag: '招聘中' },
            { name: '二类厨师', tag: '招聘中' },
            { name: '三类厨师', tag: '招聘中' },
            { name: '其他岗位', tag: '招聘中' }
        ],
        jobLists: [
            [
                { title: '一类轮机长', salary: '8000', route: '上海~武汉', date: '2月10号' },
                { title: '一类轮机长', salary: '8000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类轮机长', salary: '6000', route: '上海~武汉', date: '2月10号' },
                { title: '二类轮机长', salary: '6000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类轮机长', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '三类轮机长', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '一类轮船员', salary: '7000', route: '上海~武汉', date: '2月10号' },
                { title: '一类轮船员', salary: '7000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类轮船员', salary: '6000', route: '上海~武汉', date: '2月10号' },
                { title: '二类轮船员', salary: '6000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类轮船员', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '三类轮船员', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '一类船长', salary: '10000', route: '上海~武汉', date: '2月10号' },
                { title: '一类船长', salary: '10000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类船长', salary: '8000', route: '上海~武汉', date: '2月10号' },
                { title: '二类船长', salary: '8000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类船长', salary: '6000', route: '上海~武汉', date: '2月10号' },
                { title: '三类船长', salary: '6000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '一类水手', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '一类水手', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类水手', salary: '4000', route: '上海~武汉', date: '2月10号' },
                { title: '二类水手', salary: '4000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类水手', salary: '3000', route: '上海~武汉', date: '2月10号' },
                { title: '三类水手', salary: '3000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '一类厨师', salary: '6000', route: '上海~武汉', date: '2月10号' },
                { title: '一类厨师', salary: '6000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '二类厨师', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '二类厨师', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '三类厨师', salary: '4000', route: '上海~武汉', date: '2月10号' },
                { title: '三类厨师', salary: '4000', route: '上海~武汉', date: '2月10号' }
            ],
            [
                { title: '其他岗位', salary: '5000', route: '上海~武汉', date: '2月10号' },
                { title: '其他岗位', salary: '5000', route: '上海~武汉', date: '2月10号' }
            ]
        ],
        currentTab: 0, // 当前选中的 Tab
        scrollLeft: 0, // 选项卡滚动位置
        swiperHeight: 0, // swiper 的高度
        tabWidth: 117, // 每个 Tab 的宽度
        screenWidth: 0 // 屏幕宽度
    },

    onLoad() {
        // 获取屏幕宽度
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const screenWidth = systemInfo.screenWidth;
        const tabHeight = 50; // 顶部选项卡的高度
        this.setData({
            swiperHeight: windowHeight - tabHeight,
            screenWidth: screenWidth
        });
        this.getLocation()
    },

    // 获取地理位置
    getLocation() {
        wx.getLocation({
            type: 'wgs84',
            success: (res) => {
                const latitude = res.latitude;
                const longitude = res.longitude;
                this.setData({
                    latitude,
                    longitude
                });
                console.log(res)
                // this.getAddress(latitude, longitude);
            },
            fail: (err) => {
                if (err.errMsg === 'getLocation:fail auth deny') {
                    wx.showModal({
                        title: '提示',
                        content: '请授权地理位置权限',
                        success: (res) => {
                            if (res.confirm) {
                                wx.openSetting({
                                    success: (res) => {
                                        if (res.authSetting['scope.userLocation']) {
                                            this.getLocation(); // 重新获取位置
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    console.error('获取地理位置失败', err);
                    wx.showToast({
                        title: '获取位置失败',
                        icon: 'none'
                    });
                }
            }
        });
    },

    // 切换 Tab
    switchTab(e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentTab: index
        });
        this.adjustScrollPosition(index);
    },
    // Swiper 切换事件
    swiperChange(e) {
        const index = e.detail.current;
        this.setData({
            currentTab: index
        });
        this.adjustScrollPosition(index);
    },
    // 调整滚动位置，确保选中的 Tab 居中
    adjustScrollPosition(index) {
        const { tabWidth, screenWidth } = this.data;
        const halfScreenWidth = screenWidth / 2; // 屏幕宽度的一半
        const scrollLeft = index * tabWidth - halfScreenWidth + tabWidth / 2;

        this.setData({
            scrollLeft: scrollLeft
        });
    }
});