// pages/jobDetail/jobDetail.js
const app = getApp()
const { formatDate } = require('../../utils/formatDate.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        jobDetailInfo: {},
        formattedDate: '',
        isBrowsed: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.jobId = options.id
        if (this.jobId) {
            this.getJobDetails(this.jobId); // 调用方法获取数据
            app.on('jobBrowsed', this.handleJobBrowsed);
        }
    },
    //获取详情
    onUnload() {
        // 移除事件监听
        getApp().off('jobBrowsed', this.handleJobBrowsed);
    },
    handleJobBrowsed: function ({ jobId }) {
        console.log(jobId, this.jobId)
        if (jobId === this.jobId) {
            this.setData({ isBrowsed: true });
        }
    },
    // 根据 ID 获取岗位详细信息
    getJobDetails(jobId) {
        const db = wx.cloud.database(); // 获取云数据库实例
        db.collection('jobs').doc(jobId).get({
            success: (res) => {
                console.log(res.data)
                this.sendBrowse(jobId)
                this.setData({
                    jobDetailInfo: res.data, // 将获取的数据存储到页面数据中
                    formattedDate: formatDate(res.data.updatedAt)
                });
            },
            fail: (err) => {
                console.error('获取数据失败', err);
            },
        });
    },
    //记录浏览行为
    async sendBrowse(jobId) {
        try {
            // 1. 检查文档是否存在
            const jobDoc = await wx.cloud.database().collection('jobs')
                .doc(jobId)
                .field({ _id: true })
                .get()

            if (!jobDoc.data) {
                console.error('职位文档不存在:', jobId)
                return { success: false, error: 'DOCUMENT_NOT_FOUND' }
            }

            // 2. 获取当前用户ID
            const userInfo = wx.getStorageSync('userinfo') || app.globalData.userInfo
            if (!userInfo || !userInfo._id) {
                return { success: false, error: 'USER_NOT_LOGIN' }
            }

            // 3. 调用云函数记录浏览
            const res = await wx.cloud.callFunction({
                name: 'addBrowseRecord',
                data: {
                    userId: userInfo._id,
                    targetId: jobId,
                    type: 'job'
                }
            })
            console.log(res)
            app.emit('jobBrowsed', { jobId: jobId });
            if (!res.result.success) {

                console.error('浏览记录失败:', res.result)
            }
            return res.result
        } catch (err) {
            console.error('记录浏览异常:', err)
            return {
                success: false,
                error: 'CLIENT_ERROR',
                message: err.message
            }
        }
    },
    //拨打联系电话
    makePhoneCall: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.jobDetailInfo.mobilePhone
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