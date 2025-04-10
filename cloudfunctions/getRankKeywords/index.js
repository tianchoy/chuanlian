// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const db = cloud.database()
  const $ = db.command.aggregate
  
  try {
    const res = await db.collection('resumes')
      .aggregate()
      .group({
        _id: '$selectedRank',
        count: $.sum(1)
      })
      .end()
    
    return {
      rankKeywords: res.list.map(item => item._id).filter(rank => rank && rank.trim())
    }
  } catch (err) {
    console.error('获取职级关键词失败:', err)
    // 降级方案：使用普通查询
    const fallbackRes = await db.collection('resumes')
      .field({ selectedRank: true })
      .get()
    
    const ranks = [...new Set(fallbackRes.data.map(item => item.selectedRank).filter(Boolean))]
    return { rankKeywords: ranks }
  }
}