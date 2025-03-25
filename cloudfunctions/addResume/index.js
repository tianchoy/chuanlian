// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

exports.main = async (event, context) => {
    const {
        openid, // openid
        selectedCertificate, // 职位大类
        selectedRank, // 职位名称
        age, //年龄
        selectedGender,//性别
        amount,  //金额
        selectedSalary, // 月薪、日薪
        location,// 上船地点
        skill, //技能描述
        mobilePhone, // 电话号码
        resumesStatus = '0' // 求职状态为0“审核中”，1“未过审”，2“已审核”，3“已下线”，默认状态为“0审核中”
    } = event

    try {
        const result = await db.collection('resumes').add({
            data: {
                openid, // openid
                selectedCertificate, // 职位大类
                selectedRank, // 职位名称
                age, //年龄
                selectedGender,//性别
                amount,  //金额
                selectedSalary, // 月薪、日薪
                location,// 上船地点
                skill, //技能描述
                mobilePhone, // 电话号码
                resumesStatus,//求职状态
                createdAt: db.serverDate(),
                updatedAt: db.serverDate()
            }
        })
        return {
            code: 1,
            message: '发布成功',
            data: result
        }
    } catch (err) {
        return {
            code: 0,
            message: '发布失败',
            error: err
        }
    }
}