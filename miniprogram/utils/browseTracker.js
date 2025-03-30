// utils/browseTracker.js
const app = getApp()

export const BROWSE_TYPE = {
    JOB: 'job',
    RESUME: 'resume'
}

export const checkBrowsedStatus = async (targetIds, type) => {
    if (!targetIds || !targetIds.length) return []

    // 检查用户是否登录
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userinfo')
    if (!userInfo || !userInfo._id) {
        console.log('用户未登录，不检查浏览状态')
        return []
    }

    try {
        const res = await wx.cloud.database().collection('browse_records')
            .where({
                userId: userInfo._id,
                targetId: wx.cloud.database().command.in(targetIds),
                type
            })
            .field({ targetId: true })
            .get()

        return res.data.map(item => item.targetId)
    } catch (err) {
        console.error('检查浏览状态失败:', err)
        return []
    }
}

export const trackBrowse = async (targetId, type) => {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userinfo')
    if (!userInfo || !userInfo._id) {
        return { success: false, error: '用户未登录' }
    }

    const cacheKey = `browsed_${type}_${targetId}`
    if (wx.getStorageSync(cacheKey)) {
        return { success: true, isBrowsed: true }
    }

    try {
        const res = await wx.cloud.callFunction({
            name: 'addBrowseRecord',
            data: {
                userId: userInfo._id,
                targetId,
                type
            }
        })

        if (res.result.success) {
            wx.setStorage({ key: cacheKey, data: true })
            app.emit(`${type}Browsed`, { [type === BROWSE_TYPE.JOB ? 'jobId' : 'resumeId']: targetId })
        }

        return res.result
    } catch (err) {
        console.error('记录浏览失败:', err)
        return { success: false, error: err }
    }
}