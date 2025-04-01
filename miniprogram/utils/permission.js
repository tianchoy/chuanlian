// utils/permission.js
const checkContactPermission = (targetType) => {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'checkContactPermission',
        data: { targetType },
        success: (res) => {
          resolve(res.result.hasPermission);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  };
  
  // 导出两个场景化函数
  export const checkJobContactPermission = () => checkContactPermission('viewJobContact');
  export const checkResumeContactPermission = () => checkContactPermission('viewResumeContact');