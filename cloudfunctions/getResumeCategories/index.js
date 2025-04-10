// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const { types } = event
    
    // 1. 获取所有符合条件的简历分组统计
    const res = await db.collection('resumes')
        .where({ resumesStatus: types })
        .field({
            selectedCertificate: true,
            selectedRank: true,
            resumesStatus: true
        })
        .get()
    
    // 2. 按证书+职级分组统计
    const categoryMap = new Map()
    
    res.data.forEach(item => {
        const key = `${item.selectedCertificate}${item.selectedRank}`
        if (!categoryMap.has(key)) {
            categoryMap.set(key, {
                count: 0,
                tag: item.resumesStatus
            })
        }
        categoryMap.get(key).count++
    })
    
    // 3. 转换为前端需要的格式
    const tabs = Array.from(categoryMap.entries()).map(([name, info]) => ({
        name: name,
        tag: info.tag,
        count: info.count
    }))
    
    return {
        tabs: tabs
    }
}