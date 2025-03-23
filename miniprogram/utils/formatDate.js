// 格式化日期函数
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';

    // 如果 date 是字符串，转换为 Date 对象
    if (typeof date === 'string') {
        date = new Date(date);
    }

    const year = date.getFullYear(); // 年
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月
    const day = String(date.getDate()).padStart(2, '0'); // 日
    const hours = String(date.getHours()).padStart(2, '0'); // 时
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 分
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 秒

    // 根据传入的格式替换占位符
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 导出函数
module.exports = {
    formatDate,
};