Component({
    properties: {
      // 接收外部传入的 tabBar 配置
      tabList: {
        type: Array,
        value: [] // 默认值为空数组
      },
      // 接收外部传入的当前选中索引
      activeIndex: {
        type: Number,
        value: 0 // 默认选中第一个
      }
    },
  
    methods: {
      // 切换 tab
      switchTab(event) {
        const { path, index, isTab } = event.currentTarget.dataset;
        this.setData({
          activeIndex: index
        });
  
        if (isTab) {
          // 跳转到 tabBar 页面
          wx.switchTab({
            url: path
          });
        } else {
          // 跳转到普通页面
          wx.navigateTo({
            url: path
          });
        }
  
        // 触发事件，通知父组件当前选中的索引
        this.triggerEvent('tabChange', { index });
      }
    }
  });