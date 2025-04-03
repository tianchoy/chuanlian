// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const { types, pageSize = 5, currentPage = 1, categoryTitles = [] } = event
    
    // 1. 获取所有符合条件的职位
    const res = await db.collection('jobs')
        .where({ jobStatus: types })
        .orderBy('updatedAt', 'desc')
        .get()
    
    // 2. 按职位类别分组
    const groupedData = {}
    
    res.data.forEach(item => {
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
            familyName: item.familyName,
            id: item._id
        })
    })
    
    // 3. 转换为前端需要的格式
    const tabs = Object.keys(groupedData).map(title => ({
        name: title,
        tag: groupedData[title].tag
    }))
    
    // 4. 处理分页数据
    const jobLists = {}
    const hasMoreData = {}
    
    Object.keys(groupedData).forEach(title => {
        const allJobs = groupedData[title].jobs
        const page = categoryTitles.includes(title) ? currentPage : 1
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        
        jobLists[title] = allJobs.slice(0, endIndex)
        hasMoreData[title] = endIndex < allJobs.length
    })
    
    return {
        tabs: tabs,
        jobLists: jobLists,
        hasMoreData: hasMoreData
    }
}