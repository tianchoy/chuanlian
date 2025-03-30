// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()
    const {types} = event
    const res = await db.collection('resumes').orderBy('updatedAt', 'desc').get()
    // 过滤出 resumesStatus 为 2 的数据 ,求职状态为0“审核中”，1“未过审”，2“已审核”，3“已下线”，
    const filteredData = res.data.filter(item => item.resumesStatus === types)
    const groupedData = {}

    filteredData.forEach(item => {
        const key = `${item.selectedCertificate}${item.selectedRank}`
        if (!groupedData[key]) {
            groupedData[key] = {
                tag: item.resumesStatus,
                resumes: []
            }
        }

        groupedData[key].resumes.push({
            title: `${item.selectedCertificate}${item.selectedRank}`,
            salary: `${item.selectedSalary}${item.amount}`,
            selectedLocation:item.selectedLocation,
            age:item.age,
            familyName:item.familyName,
            selectedGender:item.selectedGender,
            resumesStatus:item.resumesStatus,
            id: item._id
        })
    })

    const tabs = Object.keys(groupedData).map(key => {
        return {
            name: key,
            tag: groupedData[key].tag
        }
    })

    const resumesLists = Object.keys(groupedData).map(key => {
        return groupedData[key].resumes
    })

    return {
        tabs: tabs,
        resumesLists: resumesLists
    }
}