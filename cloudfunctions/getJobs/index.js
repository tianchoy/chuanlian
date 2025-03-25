// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const res = await db.collection('jobs').orderBy('updatedAt', 'desc').get()
    const { types } = event
    
    // 1. 过滤出符合条件的职位
    const filteredData = res.data.filter(item => item.jobStatus === types)
    
    // 2. 为每个职位生成唯一分组键（包含 title 和唯一标识）
    const groupedData = {}
    
    filteredData.forEach((item, index) => {
        const title = `${item.selectedJobCategory}${item.selectedJobType}`
        const uniqueKey = `${title}_${index}` // 添加索引确保唯一性
        
        groupedData[uniqueKey] = {
            tag: item.jobStatus,
            jobs: [{
                title: title,
                salary: `${item.selectedSalary}${item.totalSalary}`,
                route: `${item.routeFrom}~${item.routeTo}`,
                date: item.selectedDate,
                selectedLocation: item.selectedLocation,
                id: item._id
            }]
        }
    })
    
    // 3. 转换为前端需要的格式
    const tabs = Object.keys(groupedData).map(key => ({
        name: groupedData[key].jobs[0].title, // 使用职位标题
        tag: groupedData[key].tag
    }))
    
    const jobLists = Object.keys(groupedData).map(key => 
        groupedData[key].jobs
    )
    
    return {
        tabs: tabs,
        jobLists: jobLists
    }
}