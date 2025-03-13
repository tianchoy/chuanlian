Page({
    data: {

    },

    onLoad() {
        
    },

    goToRecruit() {
        console.log('aaa')
        wx.navigateTo({
          url: '/pages/zhaopin/index/index',
        });
      },
    
      // 跳转到求职页面
      goToJob() {
        wx.navigateTo({
          url: '/pages/qiuzhi/index/index',
        });
      },


});