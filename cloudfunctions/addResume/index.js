// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const {
        id, // 新增id参数
        openid,
        selectedCertificate,
        selectedRank,
        age,
        selectedGender,
        amount,
        selectedSalary,
        location,
        skill,
        mobilePhone,
        resumesStatus = '0'
    } = event

    // 数据验证
    if (!selectedCertificate ||
        !age ||
        !selectedGender ||
        !amount ||
        !selectedSalary ||
        !location ||
        !skill ||
        !mobilePhone) {
        return { code: 0, message: '请填写完整信息' }
    }

    // 特殊处理水手岗位
    const finalRank = selectedCertificate === '水手' ? '水手' : selectedRank

    // 非水手岗位必须填写具体职位
    if (selectedCertificate !== '水手' && !selectedRank) {
        return { code: 0, message: '请选择具体职位' }
    }

    // 准备数据对象
    const resumeData = {
        openid,
        selectedCertificate,
        selectedRank: finalRank,
        age,
        selectedGender,
        amount,
        selectedSalary,
        location,
        skill,
        mobilePhone,
        resumesStatus,
        updatedAt: db.serverDate()
    }

    try {
        let result;
        if (id) {
            // 更新现有记录
            result = await db.collection('resumes').doc(id).update({
                data: resumeData
            })
            return {
                code: 1,
                message: '更新成功',
                data: result
            }
        } else {
            // 新增记录
            result = await db.collection('resumes').add({
                data: {
                    ...resumeData,
                    createdAt: db.serverDate()
                }
            })
            return {
                code: 1,
                message: '发布成功',
                data: result
            }
        }
    } catch (err) {
        console.error('数据库操作失败:', err)
        return {
            code: 0,
            message: id ? '更新失败' : '发布失败',
            error: err.message
        }
    }
}