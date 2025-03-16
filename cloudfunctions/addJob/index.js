// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

exports.main = async (event, context) => {
    const {
        openid, // openid
        selectedJobCategory, // 职位大类
        selectedJobType, // 职位名称
        routeFrom, // 起点
        routeTo, //终点
        totalSalary,  //金额
        selectedSalary, // 月薪、日薪
        selectedLocation,// 上船地点
        jobDescription, //职位描述
        mobilePhone, // 电话号码
        selectedDate, //登船日期
        jobStatus = '0' // 招聘状态为0“审核中”，1“未过审”，2“已审核”，3“已下线”，默认状态为“0审核中”
    } = event

    try {
        const result = await db.collection('jobs').add({
            data: {
                openid, // openid
                selectedJobCategory, // 职位大类
                selectedJobType, // 职位名称
                routeFrom, // 起点
                routeTo, //终点
                totalSalary,  //金额
                selectedSalary, // 月薪、日薪
                selectedLocation,// 上船地点
                jobDescription, //职位描述
                mobilePhone, // 电话号码
                selectedDate, //登船日期
                jobStatus, //招聘状态
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