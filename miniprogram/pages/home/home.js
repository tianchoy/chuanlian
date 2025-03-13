Page({
    data: {

    },

    onLoad() {
        
    },

    goToRecruit() {
        console.log('aaa')
        wx.reLaunch({
          url: '/pages/index/index',
        });
      },
    
      // 跳转到求职页面
      goToJob() {
        wx.switchTab({
          url: '/pages/qiuzhi/index/index',
        });
      },


});