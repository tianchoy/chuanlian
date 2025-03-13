Page({
    data: {

    },

    onLoad() {
        
    },

    goToRecruit() {
        console.log('aaa')
        wx.reLaunch({
          url: '/pages/zhaopin/index/index',
        });
      },
      
    
      // 跳转到求职页面
      goToJob() {
        wx.reLaunch({
          url: '/pages/qiuzhi/index/index',
        });
      },


});