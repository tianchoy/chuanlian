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
        age: '',
        location: '',
        amount: '',
        skill: '',
        mobilePhone: '',
        charCount: 0,
        maxLength: 50,
        openid: '',
        id:'',
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
        this.setData({id})
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
                    age: res.data[0].age,
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
            age: e.detail.value,
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
            return; // 防止重复提交
        }
    
        this.setData({ isSubmitting: true });
    
        const {
            id,
            selectedCertificate,
            selectedRank,
            selectedGender,
            age,
            location,
            selectedSalary,
            amount,
            skill,
            mobilePhone,
        } = this.data;
       
        // 特殊处理水手岗位
        const finalRank = selectedCertificate === '水手' ? '水手' : selectedRank;
     console.log(!selectedCertificate ,
        (!selectedRank && selectedCertificate !== '水手') , 
        !selectedGender,
        !age ,
        !location ,
        !selectedSalary ,
        !amount ,
        !skill ,
        !mobilePhone)
        // 检查必填字段（修改后的验证逻辑）
        if (!selectedCertificate ||
            (!selectedRank && selectedCertificate !== '水手') || // 只有当证书不是"水手"时才验证职位
            !selectedGender ||
            !age ||
            !location ||
            !selectedSalary ||
            !amount ||
            !skill ||
            !mobilePhone) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
            });
            this.setData({ isSubmitting: false });
            return;
        }
    
        // 提交数据
        const formData = {
            id,
            openid: this.data.openid,
            selectedCertificate,
            selectedRank: finalRank, // 使用处理后的职位
            age: age,
            selectedGender,
            amount,
            selectedSalary,
            location,
            skill,
            mobilePhone,
            resumesStatus: '0',// 招聘状态为0“审核中”，1“未过审”，2“已发布”，3“已下线”，默认状态为“0审核中”
        };
    
        wx.cloud.callFunction({
            name: 'addResume',
            data: formData,
            success: res => {
                wx.showToast({
                    title: '发布成功，请等审核',
                    icon: 'success',
                });
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
                this.setData({ isSubmitting: false });
            }
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