// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
    const db = cloud.database()
    const { types } = event
    
    try {
        // 获取所有不重复的分类组合
        const res = await db.collection('jobs')
            .aggregate()
            .match({ jobStatus: types })
            .group({
                _id: {
                    combined: { $concat: ["$selectedJobCategory", "$selectedJobType"] },
                    category: "$selectedJobCategory",
                    type: "$selectedJobType"
                },
                count: { $sum: 1 } // 统计每个分类的数量
            })
            .sort({ "_id.combined": 1 }) // 按分类名称排序
            .end()

        // 构建返回数据
        const result = {
            tabs: res.list.map(item => ({
                name: item._id.combined,
                tag: types,
                count: item.count // 可选：返回该分类下的职位数量
            })),
            categoryMappings: res.list.reduce((map, item) => {
                map[item._id.combined] = {
                    category: item._id.category,
                    type: item._id.type
                }
                return map
            }, {})
        }

        console.log('获取分类结果:', JSON.stringify(result, null, 2))
        return result
    } catch (err) {
        console.error('获取分类失败:', err)
        return {
            tabs: [],
            categoryMappings: {}
        }
    }
}