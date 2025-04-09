// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const _ = cloud.database().command  // 添加这行引入数据库操作符
// 辅助函数：转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

exports.main = async (event, context) => {
    const db = cloud.database()
    const {
        types = '2',                  // 默认查询类型为2
        pageSize = 5,                  // 默认每页5条
        currentPage = 1,               // 默认第一页
        selectedJobCategory = '',      // 职位类别
        selectedJobType = '',          // 职位类型
        filterLocation = '',           // 筛选地点
        orderBy = 'updatedAt',         // 默认按更新时间排序
        order = 'desc'                 // 默认降序
    } = event

    // 1. 构建基础查询条件
    const queryCondition = {
        jobStatus: types,
        deleted: _.neq(true)           // 软删除过滤
    }

    // 2. 添加分类筛选条件
    if (selectedJobCategory) {
        queryCondition.selectedJobCategory = selectedJobCategory
    }
    if (selectedJobType) {
        queryCondition.selectedJobType = selectedJobType
    }

    // 3. 添加地点筛选条件
    if (filterLocation && typeof filterLocation === 'string') {
        queryCondition.selectedLocation = db.RegExp({
            regexp: escapeRegExp(filterLocation.trim()),
            options: 'i'
        })
    }

    console.log('最终查询条件:', JSON.stringify(queryCondition, null, 2))
    console.log('分页参数:', { currentPage, pageSize })

    try {
        // 4. 执行查询
        const res = await db.collection('jobs')
            .where(queryCondition)
            .orderBy(orderBy, order)
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .get()

        // 5. 获取总数用于分页
        const countRes = await db.collection('jobs')
            .where(queryCondition)
            .count()

        // 6. 格式化返回数据
        const jobs = res.data.map(item => ({
            id: item._id,
            title: `${item.selectedJobCategory || ''}${item.selectedJobType || ''}`,
            salary: item.selectedSalary ? `${item.selectedSalary}${item.totalSalary || ''}` : '面议',
            route: item.routeFrom && item.routeTo ? `${item.routeFrom}~${item.routeTo}` : '航线未指定',
            date: item.selectedDate || '日期未指定',
            selectedLocation: item.selectedLocation || '地点未指定',
            familyName: item.familyName || '匿名用户',
            company: item.companyInfo || {},
            updatedAt: item.updatedAt,
            isUrgent: !!item.isUrgent,
            tags: item.tags || []
        }))

        // 7. 返回结果
        return {
            success: true,
            data: {
                jobs,
                pagination: {
                    currentPage,
                    pageSize,
                    total: countRes.total,
                    totalPages: Math.ceil(countRes.total / pageSize),
                    hasMore: (currentPage * pageSize) < countRes.total
                }
            }
        }

    } catch (err) {
        console.error('数据库查询失败:', err)
        return {
            success: false,
            errCode: 'DB_QUERY_FAILED',
            errMsg: err.message,
            requestId: context.requestId
        }
    }
}