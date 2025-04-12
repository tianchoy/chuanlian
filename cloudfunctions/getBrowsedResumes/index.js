// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数：获取用户浏览过的简历 ID 列表
exports.main = async (event, context) => {
    const { userId } = event
    const db = cloud.database()
    
    const res = await db.collection('browse_records')
      .where({
        userId,
        type: 'resume'
      })
      .field({
        _id: false,
        targetId: true
      })
      .get()
  
    return res.data.map(item => item.targetId)
  }