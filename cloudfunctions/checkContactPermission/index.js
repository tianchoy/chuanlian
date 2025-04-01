// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { targetType,openid } = event;
    const db = cloud.database();
    const _ = db.command;

    // 检查权限
    if (targetType === 'viewJobContact') {
        // 求职者想查看招聘电话 → 检查是否有 resumesStatus=2 的简历
        const count = await db.collection('resumes')
            .where({
                openid:wxContext.OPENID,
                resumesStatus: '2'
            })
            .count();
        return { hasPermission: count.total > 0  };

    } else if (targetType === 'viewResumeContact') {
        // 招聘者想查看求职电话 → 检查是否有 jobStatus=2 的职位
        const count = await db.collection('jobs')
            .where({
                openid:wxContext.OPENID,
                jobStatus: '2'
            })
            .count();
        return { hasPermission: count.total > 0 };
    }

    return { hasPermission: false };
}