// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

exports.main = async (event, context) => {
    const { type, id, openid, action } = event;

    if (!type || !id || !openid || !action) {
        return {
            code: 0,
            message: '参数缺失',
        };
    }

    try {
        let collectionName, statusField, newStatus;

        // 根据 type 确定集合和状态字段
        switch (type) {
            case 'job':
                collectionName = 'jobs'; // 职位集合
                statusField = 'jobStatus'; // 职位状态字段
                break;
            case 'resume':
                collectionName = 'resumes'; // 简历集合
                statusField = 'resumesStatus'; // 简历状态字段
                break;
            default:
                return {
                    code: 0,
                    message: '无效的类型',
                };
        }

        // 根据 action 确定新状态
        switch (action) {
            case 'online':
                newStatus = '2'; // 上线
                break;
            case 'offline':
                newStatus = '3'; // 下线
                break;
            default:
                return {
                    code: 0,
                    message: '无效的操作类型',
                };
        }

        // 更新数据状态
        const res = await db.collection(collectionName)
            .where({ _id: id, openid }) // 根据 id 和 openid 查询
            .update({
                data: {
                    [statusField]: newStatus, // 动态更新状态字段
                    updatedAt: db.serverDate(), // 更新时间
                },
            });

        if (res.stats.updated === 1) {
            return {
                code: 1,
                message: '状态更新成功',
                data: res,
            };
        } else {
            return {
                code: 0,
                message: '未找到匹配的数据',
            };
        }
    } catch (err) {
        console.error('云函数执行失败:', err);
        return {
            code: 0,
            message: '状态更新失败',
            error: err,
        };
    }
};