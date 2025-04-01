// pages/jobDetail/jobDetail.js
const { formatDate } = require('../../../utils/formatDate');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        jobDetailInfo: {},
        formattedDate: '',
        id: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let jobId = options.id || wx.getStorageSync('adminJobId');
        if (!jobId) {
            // 处理错误情况
            wx.showToast({
                title: '参数错误，请返回重试',
                icon: 'none'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
            return;
        }
        this.getJobDetails(jobId);
    },
    //获取详情
    // 根据 ID 获取岗位详细信息
    getJobDetails(jobId) {
        const userinfo = wx.getStorageSync('userinfo')
        wx.showLoading({
            title: '加载中……',
        })
        if (userinfo.isAdmin) {
            const db = wx.cloud.database(); // 获取云数据库实例
            db.collection('jobs').doc(jobId).get({
                success: (res) => {
                    console.log(res.data)
                    wx.hideLoading()
                    this.setData({
                        id: jobId,
                        jobDetailInfo: res.data, // 将获取的数据存储到页面数据中
                        formattedDate: formatDate(res.data.updatedAt)
                    });
                },
                fail: (err) => {
                    console.error('获取数据失败', err);
                },
            });
        } else {
            wx.reLaunch({
                url: '/pages/user-center/index',
            })
        }

    },
    //拨打联系电话
    makePhoneCall: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.jobDetailInfo.mobilePhone
        });
    },
    //通过审核 
    accept() {
        this.changeStatus('审核中……', '2')
    },
    //拒绝审核
    reject() {
        this.changeStatus('拒绝中', '1')
    },
    //封装函数
    changeStatus(control, statusId) {
        wx.showToast({
            title: control,
        })
        const id = this.data.id
        console.log(id, statusId)
        wx.cloud.callFunction({
            name: 'adminUpdateStatus',
            data: {
                jobId: id,
                newStatus: statusId
            },
            success: res => {
                console.log(res)
                wx.hideToast()
                wx.showToast({
                    title: res.result.message,
                    duration: 1000
                })
                wx.navigateBack()
            }
        })
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