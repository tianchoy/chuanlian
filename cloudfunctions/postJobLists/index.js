// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()
    const res = await db.collection('jobs').get()

    const data = res.data
    const groupedData = {}

    data.forEach(item => {
        const key = `${item.selectedJobCategory}${item.selectedJobType}`
        if (!groupedData[key]) {
            groupedData[key] = []
        }

        groupedData[key].push({
            title: `${item.selectedJobCategory}${item.selectedJobType}`,
            salary: `${item.selectedSalary}${item.totalSalary}`,
            route: `${item.routeFrom}~${item.routeTo}`,
            date: item.selectedDate,
            selectedLocation:item.selectedLocation,
            id: item._id,
            status: item.jobStatus
        })
    })

    const jobLists = Object.keys(groupedData).map(key => {
        return groupedData[key]
    })

    return {
        jobLists: jobLists
    }
}