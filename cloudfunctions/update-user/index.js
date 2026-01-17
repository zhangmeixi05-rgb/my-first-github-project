// 引入云函数 SDK
const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init();

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const {_id,avatarUrl, nickName, phoneNumber, studentId, gender } = event; // 假设传入的数据是一个包含 _id 和更新字段的对象
    // 执行更新操作
    const res = await db.collection('users').doc(_id).update({
      data: {
        avatarUrl,
        nickName,
        phoneNumber,
        studentId,
        gender
      }
    });
    return res; // 返回更新结果
  } catch (err) {
    console.error(err);
    throw err;
  }
};