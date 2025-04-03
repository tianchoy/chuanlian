// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const { types, pageSize = 5, currentPage = 1, categoryTitles = [] } = event
    
    // 1. 获取所有符合条件的简历
    const res = await db.collection('resumes')
        .where({ resumesStatus: types })
        .orderBy('updatedAt', 'desc')
        .get()
    
    // 2. 按证书+职级分组
    const groupedData = {}
    
    res.data.forEach(item => {
        const title = `${item.selectedCertificate}${item.selectedRank}`
        
        if (!groupedData[title]) {
            groupedData[title] = {
                tag: item.resumesStatus,
                resumes: []
            }
        }
        
        groupedData[title].resumes.push({
            title: title,
            salary: `${item.selectedSalary}${item.amount}`,
            selectedLocation: item.selectedLocation,
            age: item.age,
            familyName: item.familyName,
            selectedGender: item.selectedGender,
            resumesStatus: item.resumesStatus,
            id: item._id
        })
    })
    
    // 3. 转换为前端需要的格式
    const tabs = Object.keys(groupedData).map(title => ({
        name: title,
        tag: groupedData[title].tag,
        count: groupedData[title].resumes.length // 新增总数统计
    }))
    
    // 4. 处理分页数据
    const resumesLists = {}
    const hasMoreData = {}
    
    Object.keys(groupedData).forEach(title => {
        const allResumes = groupedData[title].resumes
        const page = categoryTitles.includes(title) ? currentPage : 1
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        
        resumesLists[title] = allResumes.slice(0, endIndex)
        hasMoreData[title] = endIndex < allResumes.length
    })
    
    return {
        tabs: tabs,
        resumesLists: resumesLists,
        hasMoreData: hasMoreData
    }
}