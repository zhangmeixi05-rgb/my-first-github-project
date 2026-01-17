/**
 * 云函数：取消好友申请
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { requestId } = event;

  try {
    await db.collection('friendRequest')
      .doc(requestId)
      .remove();

    return { success: true, message: '取消成功' };
  } catch (err) {
    console.error('取消请求失败', err);
    return { success: false, message: '取消失败' };
  }
};