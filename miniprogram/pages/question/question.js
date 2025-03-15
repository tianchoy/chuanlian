// pages/question/question.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        phoneNumber: '13646271310' // 可以动态设置电话号码
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    makePhoneCall() {
        const phoneNumber = this.data.phoneNumber;
        wx.makePhoneCall({
            phoneNumber: phoneNumber,
            success(res) {
                console.log('拨打电话成功', res);
            },
            fail(err) {
                console.error('拨打电话失败', err);
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