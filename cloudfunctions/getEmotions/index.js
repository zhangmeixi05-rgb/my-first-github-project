const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const collection = db.collection('emotion_record');

exports.main = async (event) => {
  const { userId } = event;

  if (!userId) {
    return {
      errorCode: -1,
      errorMessage: '参数缺失',
      statusCode: 400
    };
  }

  try {
    const res = await collection.where({
      userId
    }).get();

    return {
      errorCode: 0,
      errorMessage: '查询成功',
      statusCode: 200,
      data: res.data
    };
  } catch (error) {
    return {
      errorCode: -1,
      errorMessage: error.message,
      statusCode: 500
    };
  }
};
