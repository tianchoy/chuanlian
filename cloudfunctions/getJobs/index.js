// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const res = await db.collection('jobs').orderBy('updatedAt', 'desc').get()
    const { types } = event
    
    // 1. 过滤出符合条件的职位
    const filteredData = res.data.filter(item => item.jobStatus === types)
    
    // 2. 按职位类别分组
    const groupedData = {}
    
    filteredData.forEach(item => {
        const title = `${item.selectedJobCategory}${item.selectedJobType}`
        
        if (!groupedData[title]) {
            groupedData[title] = {
                tag: item.jobStatus,
                jobs: []
            }
        }
        
        groupedData[title].jobs.push({
            title: title,
            salary: `${item.selectedSalary}${item.totalSalary}`,
            route: `${item.routeFrom}~${item.routeTo}`,
            date: item.selectedDate,
            selectedLocation: item.selectedLocation,
            id: item._id
        })
    })
    
    // 3. 转换为前端需要的格式
    const tabs = Object.keys(groupedData).map(title => ({
        name: title,
        tag: groupedData[title].tag
    }))
    
    const jobLists = Object.keys(groupedData).map(title => 
        groupedData[title].jobs
    )
    
    return {
        tabs: tabs,
        jobLists: jobLists
    }
}