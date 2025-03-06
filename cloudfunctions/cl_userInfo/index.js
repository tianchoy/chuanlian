// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const  type  = event.type
    if (type == 'get') {
        let res = await db.collection('users').where({ openid }).get()
        if (res.data.length) {
            return res.data[0]
        } else {
          let addData = {
            nickName:'船连用户',
            userAvatar:'',
            openid
          }
          let addToSql = await db.collection('users').add({
              data:addData
          })
          return addToSql
        }
    }
}