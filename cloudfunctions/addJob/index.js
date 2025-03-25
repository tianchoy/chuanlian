// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
    const {
        id,
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
        jobStatus = '0',
    } = event;

    // 验证必填字段
    if (!selectedJobCategory ||
        !routeFrom ||
        !routeTo ||
        !totalSalary ||
        !selectedSalary ||
        !selectedLocation ||
        !jobDescription ||
        !mobilePhone ||
        !selectedDate) {
        return { code: 0, message: '请填写完整信息' };
    }

    // 特殊处理水手岗位
    const finalJobType = selectedJobCategory === '水手' ? '水手' : selectedJobType;

    // 非水手岗位必须填写岗位类型
    if (selectedJobCategory !== '水手' && !selectedJobType) {
        return { code: 0, message: '请选择具体岗位类型' };
    }

    try {
        const jobData = {
            openid,
            selectedJobCategory,
            selectedJobType: finalJobType, // 使用处理后的岗位类型
            routeFrom,
            routeTo,
            totalSalary,
            selectedSalary,
            selectedLocation,
            jobDescription,
            mobilePhone,
            selectedDate,
            jobStatus,
            updatedAt: db.serverDate(),
        };

        let result;
        if (id) {
            // 更新数据
            result = await db.collection('jobs').doc(id).update({
                data: jobData
            });
            return {
                code: 1,
                message: '更新成功',
                data: result,
            };
        } else {
            // 新增数据
            result = await db.collection('jobs').add({
                data: {
                    ...jobData,
                    createdAt: db.serverDate(),
                },
            });
            return {
                code: 1,
                message: '发布成功',
                data: result,
            };
        }
    } catch (err) {
        console.error('数据库操作失败:', err);
        return {
            code: 0,
            message: id ? '更新失败' : '发布失败',
            error: err.message,
        };
    }
};