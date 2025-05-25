const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return {
      errorCode: 1,
      errorMessage: 'openid 获取失败'
    };
  }

  try {
    const res = await db.collection('fellow')
      .where({
        friendId: openid,
        isAgree: false
      })
      .get();

    return {
      errorCode: 0,
      data: res.data
    };
  } catch (err) {
    return {
      errorCode: -1,
      errorMessage: err.message,
      stackTrace: err.stack
    };
  }
};
