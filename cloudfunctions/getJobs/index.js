// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()
    const res = await db.collection('jobs').orderBy('updatedAt', 'desc').get()
    // 过滤出 jobStatus 为 2 的数据
    const filteredData = res.data.filter(item => item.jobStatus === '2')
    const groupedData = {}

    filteredData.forEach(item => {
        const key = `${item.selectedJobCategory}${item.selectedJobType}`
        if (!groupedData[key]) {
            groupedData[key] = {
                tag: item.jobStatus,
                jobs: []
            }
        }

        groupedData[key].jobs.push({
            title: `${item.selectedJobCategory}${item.selectedJobType}`,
            salary: `${item.selectedSalary}${item.totalSalary}`,
            route: `${item.routeFrom}~${item.routeTo}`,
            date: item.selectedDate,
            selectedLocation:item.selectedLocation,
            id: item._id
        })
    })

    const tabs = Object.keys(groupedData).map(key => {
        return {
            name: key,
            tag: groupedData[key].tag
        }
    })

    const jobLists = Object.keys(groupedData).map(key => {
        return groupedData[key].jobs
    })

    return {
        tabs: tabs,
        jobLists: jobLists
    }
}