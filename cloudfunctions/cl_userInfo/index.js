// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { type, userAvatar, nickName } = event
    const openid = wxContext.OPENID
    if (type == "get") {
        // 查询用户
        let resp = await db.collection("users").where({ openid }).get();
        if (resp.data.length > 0) {
            return resp.data[0]; 
        } else {
            // 插入新用户
            let respn = await db.collection("users").add({
                data: {
                    nickName: '',
                    userAvatar: '',
                    openid
                }
            })
            // 重新查询以确保返回数组
            res = await db.collection("users").where({ openid }).get();
            return res.data[0]; // 返回数组
        }
    }
    if (type == 'post') {
        let respn = await db.collection('users').doc(event.id).update({
            data: event.fields
        })
        resn = await db.collection("users").where({ openid }).get();
        return {
            code: 0,
            message: '字段新增成功',
            data:resn.data
        }
    }
}