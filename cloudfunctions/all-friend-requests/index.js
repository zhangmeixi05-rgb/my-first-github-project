/**
 * 云函数：获取所有好友请求（包括已处理）
 * 支持类型：received（收到的），sent（发出的）
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { userId, type } = event;

  try {
    if (type === 'received') {
      // 获取收到的所有请求（查询fellow表，where friendId是当前用户）
      const result = await db.collection('fellow')
        .where({ friendId: userId })
        .get();
      
      console.log('Received requests query result:', result);

      // 转换数据格式
      const data = result.data.map(item => ({
        _id: item._id,
        userId: item.userId, // 申请人ID
        nickName: item.nickName, // 申请人昵称
        avatarUrl: item.avatarUrl, // 申请人头像
        reason: item.reason, // 申请理由
        status: item.isAgree ? 'accepted' : 'pending', // 假设默认是pending，如果isAgree为false可能是rejected或pending，这里需要根据实际情况调整
        timestamp: item.timestamp
      }));

      return { success: true, data: data };
    } else if (type === 'sent') {
      // 获取发出的所有请求（查询fellow表，where userId是当前用户）
      const result = await db.collection('fellow')
        .where({ userId: userId })
        .get();
      
      console.log('Sent requests query result:', result);

      // 转换数据格式
      const data = result.data.map(item => ({
        _id: item._id,
        friendId: item.friendId, // 被申请人ID
        friendNickName: item.friendNickName || '未知用户', // 如果存储了就用存储的，否则需要查询
        friendAvatar: item.friendAvatar || '/img/default-avatar.png', // 如果存储了就用存储的，否则用默认
        reason: item.reason, // 申请理由
        status: item.isAgree ? 'accepted' : 'pending', // 假设默认是pending，如果isAgree为false可能是rejected或pending，这里需要根据实际情况调整
        timestamp: item.timestamp
      }));

      return { success: true, data: data };
    } else {
      return { success: false, message: '无效的请求类型' };
    }
  } catch (err) {
    console.error('获取请求失败', err);
    return { success: false, message: '获取请求失败', error: err.message };
  }
};