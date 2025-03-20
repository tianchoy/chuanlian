// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 数据分组和格式化函数
const groupAndFormatData = (data, groupKeyFn, formatFn) => {
    const groupedData = {};
    data.forEach((item, index) => {
        // 在键中添加索引以确保唯一性
        const key = `${groupKeyFn(item)}_${index}`;
        groupedData[key] = [formatFn(item)]; // 每个键对应一个数组，数组中只有一个元素
    });
    return groupedData;
};

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const { openid } = event;

    // 读取招聘职位
    const jobsRes = await db.collection('jobs')
        .where({ openid })
        .orderBy('updatedAt', 'desc')
        .get();
    const jobsData = jobsRes.data;

    const groupedJobs = groupAndFormatData(
        jobsData,
        item => `${item.selectedJobCategory}${item.selectedJobType}`,
        item => ({
            title: `${item.selectedJobCategory}${item.selectedJobType}`,
            salary: `${item.selectedSalary}${item.totalSalary}`,
            route: `${item.routeFrom}~${item.routeTo}`,
            date: item.selectedDate,
            selectedLocation: item.selectedLocation,
            id: item._id,
            status: item.jobStatus
        })
    );

    // 读取求职简历
    const resumesRes = await db.collection('resumes')
        .where({ openid })
        .orderBy('updatedAt', 'desc')
        .get();
    const resumesData = resumesRes.data;

    const groupedResumes = groupAndFormatData(
        resumesData,
        itemr => `${itemr.selectedCertificate}${itemr.selectedRank}`,
        itemr => ({
            title: `${itemr.selectedCertificate}${itemr.selectedRank}`,
            salary: `${itemr.selectedSalary}${itemr.amount}`,
            location: itemr.location,
            age: itemr.age,
            selectedGender: itemr.selectedGender,
            id: itemr._id,
            rusumesStatus: itemr.rusumesStatus
        })
    );

    // 将分组后的数据转换为数组
    const jobLists = Object.keys(groupedJobs).map(key => groupedJobs[key]);
    const resumesLists = Object.keys(groupedResumes).map(key => groupedResumes[key]);

    return {
        jobLists: [jobLists, resumesLists]
    };
};