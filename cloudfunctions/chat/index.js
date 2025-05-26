// 云函数 chat/index.js
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const chatCollection = db.collection('chat');

exports.main = async (event, context) => {
  const { chat_id, message } = event;

  const checkExistence = await chatCollection.where({
    chat_id: chat_id
  }).get();

  if (checkExistence.data.length > 0) {
    // 更新消息列表
    await chatCollection.where({
      chat_id: chat_id
    }).update({
      data: {
        list: db.command.push(message)
      }
    });
    return { message: '数据更新成功' };
  } else {
    // 新建聊天记录
    await chatCollection.add({
      data: {
        chat_id: chat_id,
        list: [message]
      }
    });
    return { message: '数据插入成功' };
  }
};
