const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const collection = db.collection('emotion_record');

exports.main = async (event) => {
  const { userId, date, emotion } = event;

  if (!userId || !date || !emotion) {
    return {
      errorCode: -1,
      errorMessage: '参数缺失',
      statusCode: 400
    };
  }

  try {
    // 如果已存在该用户该日期记录，则更新，否则新增
    const exist = await collection.where({
      userId,
      date
    }).get();

    if (exist.data.length > 0) {
      await collection.doc(exist.data[0]._id).update({
        data: { emotion }
      });
    } else {
      await collection.add({
        data: {
          userId,
          date,
          emotion
        }
      });
    }

    return {
      errorCode: 0,
      errorMessage: '保存成功',
      statusCode: 200
    };
  } catch (error) {
    return {
      errorCode: -1,
      errorMessage: error.message,
      statusCode: 500
    };
  }
};
