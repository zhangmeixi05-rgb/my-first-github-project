const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { requestId, agree, userId, friendId, userInfo, friendInfo } = event;

  if (!requestId || typeof agree === 'undefined') {
    return { success: false, message: '参数缺失' };
  }

  try {
    // 更新请求状态
    await db.collection('fellow').doc(requestId).update({
      data: {
        isAgree: agree
      }
    });

    if (agree) {
      // 双向添加到 friend 集合
      const batch = db.batch();

      const friendCol = db.collection('friend');

      batch.create(friendCol, {
        userId,
        friendId,
        nickName: friendInfo.nickName,
        avatarUrl: friendInfo.avatarUrl
      });

      batch.create(friendCol, {
        userId: friendId,
        friendId: userId,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });

      await batch.commit();
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: '处理失败', error: err };
  }
};
