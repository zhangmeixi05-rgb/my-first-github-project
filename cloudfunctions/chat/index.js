const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const chatCollection = db.collection('chat');

exports.main = async (event, context) => {
  const { chat_id, message } = event; // 从小程序端传递的数据中获取 chat_id 和 list

  // 查询数据库中是否存在对应 chat_id 的数据
  const checkExistence = await chatCollection.where({
    chat_id: chat_id
  }).get();

  if (checkExistence.data.length > 0) {
    // 如果存在，则更新数据
    await chatCollection.where({
      chat_id: chat_id
    }).update({
      data: {
        list: db.command.push(message) // 将新数据插入到原有列表中
      }
    });
    return { message: '数据更新成功' };
  } else {
    // 如果不存在，则创建新数据并插入 list
    await chatCollection.add({
      data: {
        chat_id: chat_id,
        list: [message] // 如果列表不存在，创建一个新列表并插入数据
      }
    });
    return { message: '数据插入成功' };
  }
};