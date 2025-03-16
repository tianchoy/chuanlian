// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()

    //读取的是招聘的职位
    const res = await db.collection('jobs').orderBy('updatedAt', 'desc').get()
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

        //读取的是求职的简历
        const res1 = await db.collection('resumes').orderBy('updatedAt', 'desc').get()
        const data1 = res1.data
        const groupedData1 = {}
        data1.forEach(itemr => {
            const key = `${itemr.selectedCertificate}${itemr.selectedRank}`
            if (!groupedData1[key]) {
                groupedData1[key] = []
            }
            groupedData1[key].push({
                title: `${itemr.selectedCertificate}${itemr.selectedRank}`,
                salary: `${itemr.selectedSalary}${itemr.amount}`,
                location:itemr.location,
                age:itemr.age,
                selectedGender:itemr.selectedGender,
                id: itemr._id,
                rusumesStatus: itemr.rusumesStatus
            })
        })
        const resumesLists = Object.keys(groupedData1).map(key => {
            return groupedData1[key]
        })

    return {
        jobLists: [jobLists,resumesLists]
    }
}