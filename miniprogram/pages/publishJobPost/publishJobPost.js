Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        isLoading: false,
        isSubmitting: false, // 新增字段，用于控制提交按钮的禁用状态
        categories: [
            { name: '一类', items: ['船长', '轮机长', '大副', '大管轮', '二副','二管轮', '三副', '三管轮'] },
            { name: '二类', items: ['船长', '驾驶员', '轮机长', '轮机员'] },
            { name: '三类', items: ['船长', '驾驶员', '轮机长', '轮机员'] },
            { name: '水手', items: ['水手'] }
        ],
        subCategories: '',
        selectedJobCategory: '', // 选中的类别
        selectedJobType: '', // 选中的岗位
        routeFrom: '', // 航线起点
        routeTo: '', // 航线终点
        selectedDate: '', // 上船时间
        selectedLocation: [], // 上船地点
        salaryOptions: ['每天', '每月'], // 待遇选项
        selectedSalary: '', // 选中的待遇
        jobDescription: '', // 岗位描述
        totalSalary: '',
        mobilePhone: '',
        openid: '',
        charCount: 0,
        maxLength: 50,
        id: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getOpenid()
        console.log(options)
        const id = options.id
        const openid = this.data.openid
        this.setData({id})
        if (openid, id) {
            this.getJobInfo(openid, id)
        }
        this.handleJobCategoryChange('');
    },
    //获取openid
    getOpenid() {
        this.setData({ isLoading: true }); // 开始加载
        const userinfo = wx.getStorageSync('userinfo');
        console.log('用户ID:', userinfo);
        const userid = userinfo.nickName
        const openid = userinfo.openid
        this.setData({
            openid,
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        })
    },

    //编辑功能，根据职位的id获取职位详情
    getJobInfo(openid, id) {
        let that = this
        const db = wx.cloud.database()
        db.collection('jobs').where({ openid, _id: id }).get({
            success: function (res) {
                console.log('查询成功', res.data[0]);
                // 在这里处理返回的数据
                that.setData({
                    selectedJobCategory: res.data[0].selectedJobCategory,
                    selectedJobType: res.data[0].selectedJobType,
                    routeFrom: res.data[0].routeFrom,
                    routeTo: res.data[0].routeTo,
                    selectedDate: res.data[0].selectedDate,
                    selectedLocation: res.data[0].selectedLocation,
                    selectedSalary: res.data[0].selectedSalary,
                    totalSalary: res.data[0].totalSalary,
                    mobilePhone: res.data[0].mobilePhone,
                    jobDescription: res.data[0].jobDescription
                })
            },
            fail: function (err) {
                console.error('查询失败', err);
            }
        });
    },

    // 处理类别选择
    handleJobCategoryChange(e) {
        const index = e ? e.detail.value : 0;
        const selectedCategory = this.data.categories[index].name; // 获取选择的分类名称
        const subCategories = this.data.categories[index].items.map(item => ({ name: item })); // 获取子项列表
        // 如果选择的分类是 "水手"，直接设置 selectedJobType 为 "水手"
        if (selectedCategory === '水手') {
            this.setData({
                selectedJobType: '水手',
                selectedJobCategory: selectedCategory,
                subCategories: subCategories, // 清空子项列表，因为 "水手" 没有子项
            });
        } else {
            // 否则，更新选择的分类和子项列表，并清空 selectedJobType
            this.setData({
                selectedJobCategory: selectedCategory,
                subCategories: subCategories,
                selectedJobType: '' // 清空 selectedJobType
            });
        }
    },

    // 处理岗位选择
    handleJobTypeChange(e) {
        const index = e.detail.value;
        const selectedSubCategory = this.data.subCategories[index].name;
        this.setData({
            selectedJobType: selectedSubCategory
        });
    },

    // 处理航线起点输入
    handleRouteFromInput(e) {
        this.setData({ routeFrom: e.detail.value });
    },

    // 处理航线终点输入
    handleRouteToInput(e) {
        this.setData({ routeTo: e.detail.value });
    },

    // 处理上船时间选择
    handleDateChange(e) {
        this.setData({ selectedDate: e.detail.value });
    },

    // 处理上船地点选择
    handleLocationChange(e) {
        const selectedLocation = e.detail.value; // 获取选中的省市区
        this.setData({ selectedLocation });
    },

    // 处理待遇选择
    handleSalaryChange(e) {
        const index = e.detail.value;
        const selectedSalary = this.data.salaryOptions[index];
        this.setData({ selectedSalary });
    },
    handleMoneyChange(e) {
        const money = e.detail.value
        this.setData({ totalSalary: money })
    },

    //处理手机号码
    handlemobilePhoneChange(e) {
        const phoneNo = e.detail.value
        if (!this.validatePhoneNumber(phoneNo)) {
            wx.showToast({
                title: '请输入有效的手机号码',
                icon: 'none'
            });
            return;
        }
        this.setData({ mobilePhone: phoneNo })
    },

    validatePhoneNumber: function (phoneNumber) {
        // 简单的手机号码验证逻辑
        const reg = /^1[3456789]\d{9}$/;
        return reg.test(phoneNumber);
    },

    // 处理岗位描述输入
    handleJobDescriptionInput(e) {
        const value = e.detail.value;
        this.setData({
            charCount: value.length,
            jobDescription: value
        });
    },

    // 处理提交
    handleSubmit() {
        wx.showLoading({
          title: '发布中',
        })
        if (this.data.isSubmitting) {
            return; // 如果正在提交中，直接返回，防止重复提交
        }

        this.setData({ isSubmitting: true }); // 开始提交，锁定按钮

        const {
            id, // 数据的唯一标识，如果存在则更新，否则新增
            selectedJobCategory,
            selectedJobType,
            routeFrom,
            routeTo,
            selectedDate,
            selectedLocation,
            selectedSalary,
            totalSalary,
            jobDescription,
            mobilePhone,
            openid,
        } = this.data;

        // 检查必填字段
        if (
            !selectedJobCategory ||
            !selectedJobType ||
            !routeFrom ||
            !routeTo ||
            !selectedDate ||
            !selectedLocation ||
            !totalSalary ||
            !jobDescription ||
            !mobilePhone ||
            !selectedSalary
        ) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
            });
            this.setData({ isSubmitting: false }); // 提交失败，解锁按钮
            return;
        }

        // 提交逻辑
        wx.cloud.callFunction({
            name: 'addJob', // 云函数名称
            data: {
                id, // 传递 id，如果存在则更新，否则新增
                openid,
                selectedJobCategory,
                selectedJobType,
                routeFrom,
                routeTo,
                selectedDate,
                selectedLocation,
                selectedSalary,
                totalSalary,
                jobDescription,
                mobilePhone,
            },
            success: res => {
                console.log('云函数返回:', res);
                if (res.result.code === 1) {
                    wx.hideLoading()
                    wx.showToast({
                        title: id ? '更新成功' : '发布成功',
                        icon: 'success',
                    });
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 1500);
                } else {
                    wx.hideLoading()
                    wx.showToast({
                        title: id ? '更新失败' : '发布失败',
                        icon: 'none',
                    });
                }
                // this.setData({ isSubmitting: false }); // 提交完成，解锁按钮
            },
            fail: err => {
                console.error('操作失败', err);
                wx.showToast({
                    title: '操作失败，请重试',
                    icon: 'none',
                });
                this.setData({ isSubmitting: false }); // 提交失败，解锁按钮
            },
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 页面显示时执行
        console.log('onShow 加载状态:', this.data.isLoading);
        if (!this.data.isLogin && !this.data.isLoading) {
            console.log('用户未登录，重新获取用户ID');
            this.getOpenid();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})