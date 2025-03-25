const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { reusmeId, newStatus } = event
    const { OPENID } = cloud.getWXContext()

    try {
        // 1. 获取并验证管理员信息
        const adminRes = await db.collection('users')
            .where({
                openid: OPENID,
                isAdmin: true
            })
            .field({ nickName: true })
            .get()

        if (adminRes.data.length === 0) {
            return { code: 403, message: '权限不足：非管理员用户' }
        }

        // 2. 检查目标文档是否存在
        const resumesDoc = await db.collection('resumes').doc(reusmeId).get()
        if (!resumesDoc.data) {
            return { code: 404, message: '招聘信息不存在' }
        }

        // 3. 执行更新
        const res = await db.collection('resumes').doc(reusmeId).update({
            data: {
                resumesStatus: newStatus,
                operatorName: adminRes.data[0].nickName,
                updatedAt: db.serverDate()
            }
        })

        return { code: 200, data: res, message: '状态更新成功' }

    } catch (err) {
        console.error('云函数错误:', err)
        return {
            code: 500,
            message: '服务端错误',
            error: err.message
        }
    }
}