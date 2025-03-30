// syncBrowseCounters/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 定时触发器配置
exports.main = async (event, context) => {
    const BATCH_SIZE = 100
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3600000)

    // 定义需要同步的计数器类型
    const syncTasks = [
        {
            counterCol: 'hot_job_counters',
            targetCol: 'jobs',
            processed: 0
        },
        {
            counterCol: 'hot_resume_counters',
            targetCol: 'resumes',
            processed: 0
        }
    ]

    // 并行处理所有类型
    await Promise.all(syncTasks.map(async task => {
        // 1. 获取需要同步的计数器
        const counters = await db.collection(task.counterCol)
            .where({
                pendingCount: _.gt(0),
                lastUpdated: _.lt(oneHourAgo)
            })
            .limit(BATCH_SIZE)
            .get()

        if (counters.data.length === 0) return

        // 2. 批量更新
        const batch = db.startBatch()

        counters.data.forEach(counter => {
            // 更新目标集合
            batch.update({
                collection: task.targetCol,
                doc: counter._id,
                data: {
                    browseCount: _.inc(counter.pendingCount),
                    updatedAt: db.serverDate()
                }
            })

            // 重置计数器
            batch.update({
                collection: task.counterCol,
                doc: counter._id,
                data: {
                    pendingCount: 0,
                    lastUpdated: db.serverDate()
                }
            })
        })

        await batch.commit()
        task.processed = counters.data.length
    }))

    return {
        success: true,
        detail: syncTasks.map(task => ({
            type: task.targetCol,
            processed: task.processed
        }))
    }
}