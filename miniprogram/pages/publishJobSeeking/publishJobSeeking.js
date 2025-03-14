// pages/publishJobSeeking/publishJobSeeking.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        certificatePositions: ['一类', '二类', '三类'],
        selectedCertificate: '一类',
        ranks: ['大副', '轮机长', '大管轮'],
        selectedRank: '大副',
        genders: ['男', '女'],
        selectedGender: '男',
        salaryOptions: ['每月', '每日'],
        selectedSalary: '每月',
        year: '',
        location: '',
        amount: '',
        skill: '',
        mobilePhone:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    //设置个人证书类别
    bindCertificateChange: function (e) {
        this.setData({
            selectedCertificate: this.data.certificatePositions[e.detail.value]
        });
    },
    //设置个人职业
    bindRankChange: function (e) {
        this.setData({
            selectedRank: this.data.ranks[e.detail.value]
        });
    },
    //设置性别
    bindGenderChange: function (e) {
        this.setData({
            selectedGender: this.data.genders[e.detail.value]
        });
    },
    //设置期望待遇
    bindSalaryChange: function (e) {
        this.setData({
            selectedSalary: this.data.salaryOptions[e.detail.value]
        });
    },
    //设置年龄
    bindYearInput: function (e) {
        this.setData({
            year: e.detail.value
        });
    },
    //设置常驻地点
    bindLocationInput: function (e) {
        this.setData({
            location: e.detail.value
        });
    },
    //设置具体金额
    bindAmountInput: function (e) {
        this.setData({
            amount: e.detail.value
        });
    },
    //设置个人技能描述
    bindSkillInput: function (e) {
        this.setData({
            skill: e.detail.value
        });
    },

    //处理电话号码
    bindMobilePhone(e){
        const phoneNumber = e.detail.value
        if (!this.validatePhoneNumber(phoneNumber)) {
            wx.showToast({
              title: '请输入有效的手机号码',
              icon: 'none'
            });
            return;
          }
          this.setData({mobilePhone:phoneNumber})
    },
    validatePhoneNumber: function(phoneNumber) {
        // 简单的手机号码验证逻辑
        const reg = /^1[3456789]\d{9}$/;
        return reg.test(phoneNumber);
      },

    submitForm: function () {
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
        if(!selectedCertificate || !selectedRank || !selectedGender || !year || !location || !selectedSalary || !amount || !skill || !mobilePhone){
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
            });
            return;
        }
        // 提交逻辑
        wx.showToast({
            title: '提交成功',
            icon: 'success',
        });
        const formData = {
            certificate: selectedCertificate,
            rank: selectedRank,
            gender: selectedGender,
            year: year,
            location: location,
            salary: selectedSalary,
            amount: amount,
            skill: skill,
            mobilePhone:mobilePhone
        };
        console.log(formData);
        // 这里可以添加提交表单的逻辑
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