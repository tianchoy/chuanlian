Page({

    /**
     * 页面的初始数据
     */
    data: {
        certificatePositions: [
            { name: '一类', items: ['船长', '轮机长', '大副', '大管轮', '二副','二管轮', '三副', '三管轮'] },
            { name: '二类', items: ['船长', '驾驶员', '轮机长', '轮机员'] },
            { name: '三类', items: ['船长', '驾驶员', '轮机长', '轮机员'] },
            { name: '水手', items: ['水手'] }
        ],
        selectedCertificate: '一类',
        ranks: '',
        selectedRank: '大副',
        genders: ['男', '女'],
        selectedGender: '男',
        salaryOptions: ['每月', '每日'],
        selectedSalary: '每月',
        year: '',
        location: '',
        amount: '',
        skill: '',
        mobilePhone: '',
        charCount: 0,
        maxLength: 50,
        openid: '',
        isLogin: false,
        isLoading: false,
        isSubmitting: false, // 新增字段，用于控制提交按钮的禁用状态
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getOpenid();
        console.log(options);
        const id = options.id;
        const openid = this.data.openid;
        if (openid && id) {
            this.getResumesInfo(openid, id);
        }
        this.bindCertificateChange('')
    },

    // 获取 openid
    getOpenid() {
        this.setData({ isLoading: true }); // 开始加载
        const userinfo = wx.getStorageSync('userinfo');
        console.log('用户ID:', userinfo);
        const userid = userinfo.nickName;
        const openid = userinfo.openid;
        this.setData({
            openid,
            isLogin: !!userid, // 更新登录状态
            isLoading: false, // 结束加载
        });
    },

    // 编辑功能，根据职位的 id 获取职位详情
    getResumesInfo(openid, id) {
        let that = this;
        const db = wx.cloud.database();
        db.collection('resumes').where({ openid, _id: id }).get({
            success: function (res) {
                console.log('查询成功', res.data[0]);
                // 在这里处理返回的数据
                that.setData({
                    selectedCertificate: res.data[0].selectedCertificate,
                    selectedRank: res.data[0].selectedRank,
                    year: res.data[0].age,
                    selectedGender: res.data[0].selectedGender,
                    location: res.data[0].location,
                    selectedSalary: res.data[0].selectedSalary,
                    amount: res.data[0].amount,
                    mobilePhone: res.data[0].mobilePhone,
                    skill: res.data[0].skill,
                });
            },
            fail: function (err) {
                console.error('查询失败', err);
            },
        });
    },

    // 设置个人证书类别
    bindCertificateChange: function (e) {
        const index = e ? e.detail.value : 0;
        const selectedCategory = this.data.certificatePositions[index].name; // 获取选择的分类名称
        const subCategories = this.data.certificatePositions[index].items.map(item => ({ name: item })); // 获取子项列表
        // 如果选择的分类是 "水手"，直接设置 selectedRank 为 "水手"
        if (selectedCategory === '水手') {
            this.setData({
                selectedRank: '水手',
                selectedCertificate: selectedCategory,
                ranks: subCategories, // 清空子项列表，因为 "水手" 没有子项
            });
        } else {
            // 否则，更新选择的分类和子项列表，并清空 selectedRank
            this.setData({
                selectedCertificate: selectedCategory,
                ranks: subCategories,
                selectedRank: '' // 清空 selectedRank
            });
        }
    },

    // 设置个人职业
    bindRankChange: function (e) {
        const index = e.detail.value;
        const selectedSubCategory = this.data.ranks[index].name;
        this.setData({
            selectedRank: selectedSubCategory
        });
    },

    // 设置性别
    bindGenderChange: function (e) {
        this.setData({
            selectedGender: this.data.genders[e.detail.value],
        });
    },

    // 设置期望待遇
    bindSalaryChange: function (e) {
        this.setData({
            selectedSalary: this.data.salaryOptions[e.detail.value],
        });
    },

    // 设置年龄
    bindYearInput: function (e) {
        this.setData({
            year: e.detail.value,
        });
    },

    // 设置常驻地点
    bindLocationInput: function (e) {
        this.setData({
            location: e.detail.value,
        });
    },

    // 设置具体金额
    bindAmountInput: function (e) {
        this.setData({
            amount: e.detail.value,
        });
    },

    // 设置个人技能描述
    bindSkillInput: function (e) {
        const value = e.detail.value;
        this.setData({
            charCount: value.length,
            skill: e.detail.value,
        });
    },

    // 处理电话号码
    bindMobilePhone(e) {
        const phoneNumber = e.detail.value;
        if (!this.validatePhoneNumber(phoneNumber)) {
            wx.showToast({
                title: '请输入有效的手机号码',
                icon: 'none',
            });
            return;
        }
        this.setData({ mobilePhone: phoneNumber });
    },

    validatePhoneNumber: function (phoneNumber) {
        // 简单的手机号码验证逻辑
        const reg = /^1[3456789]\d{9}$/;
        return reg.test(phoneNumber);
    },

    // 提交表单
    submitForm: function () {
        if (this.data.isSubmitting) {
            return; // 如果正在提交中，直接返回，防止重复提交
        }

        this.setData({ isSubmitting: true }); // 开始提交，锁定按钮

        const {
            selectedCertificate,
            selectedRank,
            selectedGender,
            year,
            location,
            selectedSalary,
            amount,
            skill,
            mobilePhone,
        } = this.data;

        // 检查必填字段
        if (!selectedCertificate || !selectedRank || !selectedGender || !year || !location || !selectedSalary || !amount || !skill || !mobilePhone) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
            });
            this.setData({ isSubmitting: false }); // 提交失败，解锁按钮
            return;
        }

        // 提交逻辑
        const formData = {
            openid: this.data.openid, // openid
            selectedCertificate, // 职位大类
            selectedRank, // 职位名称
            age: year, // 年龄
            selectedGender, // 性别
            amount, // 金额
            selectedSalary, // 月薪、日薪
            location, // 上船地点
            skill, // 技能描述
            mobilePhone, // 电话号码
            resumesStatus: '0',
        };
        console.log(formData);

        wx.cloud.callFunction({
            name: 'addResume',
            data: formData,
            success: res => {
                wx.showToast({
                    title: '发布成功，请等审核',
                    icon: 'success',
                });
                console.log('发布成功', res);
                wx.navigateBack();
            },
            fail: err => {
                wx.showToast({
                    title: '发布失败，请修改',
                    icon: 'none',
                });
                console.error('发布失败', err);
            },
            complete: () => {
                this.setData({ isSubmitting: false }); // 提交完成，解锁按钮
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

    },
});