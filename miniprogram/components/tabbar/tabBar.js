// components/tabbar/tabBar.js
Component({
    properties: {
      activeIndex: {
        type: Number,
        value: 0
      }
    },
  
    data: {
      list: [
        {
          pagePath: "/pages/admin/jobIndex/jobIndex",
          text: "招聘",
          iconPath: "../../images/icons/home.png",
          selectedIconPath: "../../images/icons/home-active.png"
        },
        {
          pagePath: "/pages/admin/resumeIndex/resumeIndex",
          text: "求职",
          iconPath: "../../images/icons/findman.png",
          selectedIconPath: "../../images/icons/findman-active.png",
        },
        {
          pagePath: "/pages/user-center/index",
          text: "返回",
          iconPath: "../../images/icons/usercenter.png",
          selectedIconPath: "../../images/icons/usercenter-active.png"
        }
      ]
    },
  
    methods: {
      switchTab(e) {
        const { path, index } = e.currentTarget.dataset
        const ins = this.data.activeIndex
        if (index === ins) return
        
        wx.reLaunch({
          url: path,
          success: () => {
            this.setData({ activeIndex: index })
          }
        })
      }
    }
  })