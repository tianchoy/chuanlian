// cloud/functions/addBrowseRecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    const { userId, targetId, type = 'job' } = event

    // 1. 参数验证
    if (!userId || !targetId) {
        return {
            success: false,
            error: 'MISSING_PARAMS',
            message: '缺少必要参数: userId 或 targetId'
        }
    }

    // 2. 确定集合配置
    const config = {
        job: {
            mainCollection: 'jobs',
            counterCollection: 'hot_job_counters'
        },
        resume: {
            mainCollection: 'resumes',
            counterCollection: 'hot_resume_counters'
        }
    }[type]

    try {
        // 3. 使用事务处理
        await db.runTransaction(async transaction => {
            // 3.1 检查是否已有浏览记录
            const browseRecords = await transaction.collection('browse_records')
                .where({
                    userId: userId,
                    targetId: targetId,
                    type: type
                })
                .get()

            if (browseRecords.data.length > 0) {
                // 已有记录，更新浏览次数和最后浏览时间
                await transaction.collection('browse_records')
                    .doc(browseRecords.data[0]._id)
                    .update({
                        data: {
                            sameUserCounts: _.inc(1),
                            lastBrowseTime: db.serverDate()
                        }
                    })
            } else {
                // 新记录，创建并初始化浏览次数为1
                await transaction.collection('browse_records').add({
                    data: {
                        userId,
                        targetId,
                        type,
                        sameUserCounts: 1,
                        firstBrowseTime: db.serverDate(),
                        lastBrowseTime: db.serverDate()
                    }
                })
            }

            // 3.2 更新总浏览计数器 - 使用update而不是set
            const counterRef = transaction.collection(config.counterCollection).doc(targetId)
            await counterRef.update({
                data: {
                    pendingCount: _.inc(1),
                    lastUpdated: db.serverDate()
                }
            })
        })

        return {
            success: true
        }
    } catch (err) {
        console.error('记录浏览失败:', err)
        return {
            success: false,
            error: 'TRANSACTION_FAILED',
            message: err.errMsg || '数据库操作失败'
        }
    }
}