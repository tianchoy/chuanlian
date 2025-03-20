// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
const db = cloud.database();

exports.main = async (event, context) => {
  const {
    id, // 数据的唯一标识，如果存在则更新，否则新增
    openid, // openid
    selectedJobCategory, // 职位大类
    selectedJobType, // 职位名称
    routeFrom, // 起点
    routeTo, // 终点
    totalSalary, // 金额
    selectedSalary, // 月薪、日薪
    selectedLocation, // 上船地点
    jobDescription, // 职位描述
    mobilePhone, // 电话号码
    selectedDate, // 登船日期
    jobStatus = '0', // 招聘状态为0“审核中”，1“未过审”，2“已发布”，3“已下线”，默认状态为“0审核中”
  } = event;

  try {
    let result;
    if (id) {
      // 如果 id 存在，则更新数据
      result = await db.collection('jobs').doc(id).update({
        data: {
          openid,
          selectedJobCategory,
          selectedJobType,
          routeFrom,
          routeTo,
          totalSalary,
          selectedSalary,
          selectedLocation,
          jobDescription,
          mobilePhone,
          selectedDate,
          jobStatus,
          updatedAt: db.serverDate(), // 更新更新时间
        },
      });
      return {
        code: 1,
        message: '更新成功',
        data: result,
      };
    } else {
      // 如果 id 不存在，则新增数据
      result = await db.collection('jobs').add({
        data: {
          openid,
          selectedJobCategory,
          selectedJobType,
          routeFrom,
          routeTo,
          totalSalary,
          selectedSalary,
          selectedLocation,
          jobDescription,
          mobilePhone,
          selectedDate,
          jobStatus,
          createdAt: db.serverDate(), // 新增创建时间
          updatedAt: db.serverDate(), // 新增更新时间
        },
      });
      return {
        code: 1,
        message: '发布成功',
        data: result,
      };
    }
  } catch (err) {
    return {
      code: 0,
      message: id ? '更新失败' : '发布失败',
      error: err,
    };
  }
};