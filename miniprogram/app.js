// app.js
App({
    onLaunch: function () {
        if (!wx.cloud) {
            console.error("请使用 2.2.3 或以上的基础库以使用云能力");
        } else {
            wx.cloud.init({
                env: "chuanlian-2gj6h1ar20ff84ba",
                traceUser: true,
            });
        }
        this.checkUpdate();
        this.globalData = {};
    },
    // 检查更新
    checkUpdate() {
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager();

            // 监听检查更新事件
            updateManager.onCheckForUpdate((res) => {
                if (res.hasUpdate) {
                    console.log('检测到新版本');
                } else {
                    console.log('当前已是最新版本');
                }
            });

            // 监听更新下载完成事件
            updateManager.onUpdateReady(() => {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已准备好，是否重启应用？',
                    success: (res) => {
                        if (res.confirm) {
                            // 重启应用
                            updateManager.applyUpdate();
                        }
                    },
                });
            });

            // 监听更新失败事件
            updateManager.onUpdateFailed(() => {
                wx.showToast({
                    title: '更新失败，请稍后重试',
                    icon: 'none',
                });
            });
        } else {
            // 如果微信版本过低，提示用户升级微信
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用更新功能，请升级到最新微信版本后重试。',
                showCancel: false,
            });
        }
    },
});
