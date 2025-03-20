Page({
    data: {
        isLogin: false,
        isLoading: false,
        status: ['审核中', '未过审', '已审核', '已下线'],
        jobLists: [],
        openid: ''
    },

    onLoad: function (options) {
        // 页面创建时执行
        this.getUserId()
        console.log('onload', !!this.data.openid)
        if (this.data.isLogin) {
            this.getJobsList()
        }
    },
    // 获取数据列表
    async getJobsList() {
        try {
            const openid = this.data.openid;
            const res = await wx.cloud.callFunction({
                name: 'postJobLists', // 云函数名称
                data: { openid }, // 传递 openid
            });
            console.log(res.result.jobLists)
            // 更新页面数据
            this.setData({
                jobLists: res.result.jobLists, // 假设云函数返回的数据字段是 jobLists
            });
        } catch (err) {
            console.error('获取数据失败:', err);
            wx.showToast({
                title: '获取数据失败',
                icon: 'none',
            });
        }
    },
    //获取用户id来确定用户是否是登陆了
    getUserId() {
        this.setData({ isLoading: true }); // 开始加载
        const userinfo = wx.getStorageSync('userinfo');
        console.log('用户ID:', userinfo);
        const userid = userinfo.nickName
        this.setData({
            openid: userinfo.openid,
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        });
        console.log('加载状态:', this.data.isLoading);
    },
    //如果用户没有登陆，则去用户中心登陆
    toLogin() {
        wx.switchTab({
            url: '/pages/user-center/index',
        })
    },

    //跳转到发布招聘页面
    async publish(e) {
        const types = e.target.dataset.type;
        const db = wx.cloud.database();
        const openid = this.data.openid;
        // 定义类型与集合、页面路径及发布上限的映射关系
        const typeConfig = {
            publishJobPost: {
                collection: 'jobs',
                pageUrl: '/pages/publishJobPost/publishJobPost',
                limit: 10
            },
            publishJobSeeking: {
                collection: 'resumes',
                pageUrl: '/pages/publishJobSeeking/publishJobSeeking',
                limit: 3
            }
        };
        // 获取当前配置
        const config = typeConfig[types];
        if (!config) {
            console.error('未知的类型:', types);
            return;
        }
        // 查询当前用户发布的数量
        const countRes = await db.collection(config.collection)
            .where({ openid })
            .count();
        // 检查发布上限
        if (countRes.total >= config.limit) {
            wx.showToast({
                title: '已达发布上限',
                icon: 'error',
                duration: 2000
            });
        } else {
            wx.navigateTo({
                url: config.pageUrl,
            });
        }
    },

    //修改上下线状态
    changeJobStatus(e) {
        const { type, id } = e.currentTarget.dataset
        console.log(type, id)

    },
    //删除发布的信息
    async btDel(e) {
        try {
            const id = e.target.dataset.id; // 获取需要删除的数据 ID
            const types = e.target.dataset.type; // 获取集合名称
            console.log('删除参数:', id, types);

            // 弹出确认框
            const modalRes = await wx.showModal({
                title: '提示',
                content: '您确定要删除这条数据吗？',
            });

            if (modalRes.confirm) {
                // 调用云函数删除数据
                const cloudRes = await wx.cloud.callFunction({
                    name: 'delInfo',
                    data: {
                        collection: types, // 集合名称
                        id: id, // 需要删除的数据 ID
                    },
                });
                console.log('云函数返回:', cloudRes);

                if (cloudRes.result && cloudRes.result.success) {
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                    });

                    // 刷新数据
                    this.getJobsList();
                } else {
                    wx.showToast({
                        title: '删除失败',
                        icon: 'none',
                    });
                }
            }
        } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({
                title: '删除失败，请重试',
                icon: 'none',
            });
        }
    },

    //编辑功能
    editStatus(e){
        console.log(e.target.dataset)
        const id = e.target.dataset.id
        const types = e.target.dataset.type
        if(types === 'job'){
            wx.navigateTo({
                url: '/pages/publishJobPost/publishJobPost?id='+id,
              })
        }
        if(types === 'resume'){
            wx.navigateTo({
                url: '/pages/publishJobSeeking/publishJobSeeking?id='+id,
              })
        }
        
    },
    onShow: function () {
        console.log('发布模块，onShow 加载状态:', this.data.isLoading);
        if (!this.data.isLogin && !this.data.isLoading) {
            console.log('发布模块，用户未登录，重新获取用户ID');
            this.getUserId();
        }
        if (this.data.isLogin) {
            console.log('发布模块，加载工作列表')
            this.getJobsList()
        }

    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面隐藏时执行
    },
    onUnload: function () {
        // 页面卸载时执行
    }
});