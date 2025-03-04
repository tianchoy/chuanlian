const { envList } = require('../../envList');

// pages/me/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },
  onLoad() {
    // wx.cloud.callFunction({
    //   name: 'getOpenid',
    //   success: (res) => {
    //     const openid = res.result.openid;
    //     wx.setStorageSync('openid', openid); // 存储 openid
    //     console.log('获取 openid 成功:', openid);
    //   },
    //   fail: (err) => {
    //     console.log('获取 openid 失败:', err);
    //   }
    // });
  },
});
