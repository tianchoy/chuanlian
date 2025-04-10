const cloud = require('wx-server-sdk')
cloud.init({ 
  env: cloud.DYNAMIC_CURRENT_ENV,
  timeout: 10000 // 增加超时时间
})

exports.main = async (event, context) => {
  const db = cloud.database()
  const { types, pageSize = 5, currentPage = 1, categoryTitles = [], filters = {}, rankKeywords = [] } = event
  
  // 1. 参数校验
  if (!categoryTitles || !Array.isArray(categoryTitles)) {
    return {
      errCode: 400,
      errMsg: '缺少必要参数 categoryTitles'
    }
  }

  // 2. 构建查询条件
  const queryCondition = { resumesStatus: types }
  const currentCategory = categoryTitles[0] || ''

  // 3. 动态处理分类名称
  if (currentCategory) {
    // 优先尝试匹配已知职级
    const matchedRank = rankKeywords.find(rank => 
      currentCategory.includes(rank)
    )
    
    if (matchedRank) {
      queryCondition.selectedRank = matchedRank
      queryCondition.selectedCertificate = currentCategory.replace(matchedRank, '')
    } else {
      // 默认处理：前2字符为证书，剩余为职级
      queryCondition.selectedCertificate = currentCategory.slice(0, 2)
      queryCondition.selectedRank = currentCategory.slice(2)
    }
  }

  // 4. 添加地点筛选
  if (filters.location && filters.location.trim()) {
    queryCondition.location = db.RegExp({
      regexp: filters.location.trim(),
      options: 'i'
    })
  }

  try {
    // 5. 执行分页查询
    const countRes = await db.collection('resumes')
      .where(queryCondition)
      .count()

    const dataRes = await db.collection('resumes')
      .where(queryCondition)
      .orderBy('updatedAt', 'desc')
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 6. 构造返回数据
    return {
      resumesLists: {
        [currentCategory]: dataRes.data.map(item => ({
          id: item._id,
          title: `${item.selectedCertificate || ''}${item.selectedRank || ''}`,
          salary: item.selectedSalary && item.amount ? 
            `${item.selectedSalary}${item.amount}` : '面议',
          location: item.location || '未知地点',
          age: item.age || '未知',
          familyName: item.familyName || '船连用户',
          selectedGender: item.selectedGender || '未填写',
          resumesStatus: item.resumesStatus
        }))
      },
      hasMoreData: {
        [currentCategory]: (currentPage * pageSize) < countRes.total
      }
    }
  } catch (err) {
    console.error('数据库查询失败:', err)
    return {
      errCode: 500,
      errMsg: '数据库查询失败',
      resumesLists: { [currentCategory]: [] },
      hasMoreData: { [currentCategory]: false }
    }
  }
}