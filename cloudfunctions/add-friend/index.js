// 云函数：add-friend
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { userId, friendId, reason, nickName, avatarUrl } = event;

  // 参数校验
  if (!userId || !friendId || userId === friendId) {
    return { success: false, message: '参数错误或不能添加自己为好友' };
  }

  try {
    // 检查是否已经申请过或已经是好友
    const [existRequest, existFriend] = await Promise.all([
      db.collection('fellow').where({
        userId,
        friendId
      }).get(),

      db.collection('friend').where({
        userId,
        friendId
      }).get()
    ]);

    if (existRequest.data.length > 0) {
      return { success: false, message: '已申请，请勿重复' };
    }

    if (existFriend.data.length > 0) {
      return { success: false, message: '已是好友' };
    }

    // 写入好友申请记录到 fellow 表
    await db.collection('fellow').add({
      data: {
        userId,        // 申请人 ID
        friendId,      // 被申请人 ID
        reason: reason || '请求添加为好友',
        nickName,      // 申请人昵称（用于展示）
        avatarUrl,     // 申请人头像
        timestamp: new Date(),
        isAgree: false // 是否同意，初始为 false
      }
    });

    return { success: true, message: '申请已发送' };
  } catch (error) {
    console.error('添加好友失败：', error);
    return { success: false, message: '服务器错误', error };
  }
};
