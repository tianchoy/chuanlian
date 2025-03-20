// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const { collection, id } = event;
    const { OPENID } = cloud.getWXContext(); // 获取当前用户的 openid

    try {
        // 查询数据是否属于当前用户
        const res = await db.collection(collection).doc(id).get();
        if (res.data.openid !== OPENID) {
            return {
                success: false,
                data: OPENID,
                message: '无权删除该数据'
            };
        }

        // 删除数据
        await db.collection(collection).doc(id).remove();
        return {
            success: true,
            data: OPENID,
            message: '删除成功'
        };
    } catch (err) {
        return {
            success: false,
            message: '删除失败',
            error: err
        };
    }
};