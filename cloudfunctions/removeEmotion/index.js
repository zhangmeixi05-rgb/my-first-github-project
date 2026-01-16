const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const collection = db.collection('emotion_record');

exports.main = async (event) => {
  const { userId, date } = event;

  if (!userId || !date) {
    return {
      errorCode: -1,
      errorMessage: '参数缺失',
      statusCode: 400
    };
  }

  try {
    const exist = await collection.where({
      userId,
      date
    }).get();

    if (exist.data.length > 0) {
      await collection.doc(exist.data[0]._id).remove();
      return {
        errorCode: 0,
        errorMessage: '删除成功',
        statusCode: 200
      };
    } else {
      return {
        errorCode: -1,
        errorMessage: '记录不存在',
        statusCode: 404
      };
    }
  } catch (error) {
    return {
      errorCode: -1,
      errorMessage: error.message,
      statusCode: 500
    };
  }
};
