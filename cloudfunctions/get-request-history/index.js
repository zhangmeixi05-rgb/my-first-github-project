const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const userId = event.userId;

  if (!userId) {
    return {
      success: false,
      message: '缺少 userId 参数'
    };
  }

  try {
    const sentQuery = db.collection('fellow').where({
      userId: userId
    });

    const receivedQuery = db.collection('fellow').where({
      friendId: userId
    });

    const [sentResult, receivedResult] = await Promise.all([
      sentQuery.get(),
      receivedQuery.get()
    ]);

    const sentRequests = sentResult.data;
    const receivedRequests = receivedResult.data;

    return {
      success: true,
      sent: sentRequests,
      received: receivedRequests
    };
  } catch (err) {
    console.error('获取申请历史失败', err);
    return {
      success: false,
      message: '获取失败',
      error: err.message
    };
  }
};