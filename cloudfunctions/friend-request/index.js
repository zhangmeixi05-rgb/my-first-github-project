const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { userId } = event;

  if (!userId) {
    return {
      success: false,
      message: '缺少 userId'
    };
  }

  try {
    const res = await db.collection('fellow')
      .where({
        friendId: userId,
        isAgree: false
      })
      .get();

      return {
        success: true,
        data: res.data // 而不是 requests
      };
      
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
