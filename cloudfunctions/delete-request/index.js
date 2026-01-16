// 云函数入口文件
const cloud = require('wx-server-sdk');

// 初始化 cloud
cloud.init();

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 从 event 中获取传入的 userId
    const { _id,userId} = event;
    if(!_id){
     await db.collection('fellow').where({
        userId:userId
      }).remove();
    }else{
      await db.collection('fellow').doc(_id).remove();
    }
    // 删除 class_number 集合中符合条件的数据
    // const res = 

    return 200;
  } catch (err) {
    console.error(err);
    throw err;
  }
};