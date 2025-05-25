const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { requestId, agree, userId, friendId, userInfo, friendInfo } = event;

  console.log('⚙️ 接收到参数：', { requestId, agree, userId, friendId });

  if (!requestId || typeof agree === 'undefined') {
    return { success: false, message: '参数缺失' };
  }

  try {
    console.log('🔄 正在更新 fellow 表');
    await db.collection('fellow').doc(requestId).update({
      data: {
        isAgree: agree
      }
    });

    if (agree) {
      const friendCol = db.collection('friend');

      console.log('📦 检查是否已存在好友记录');
      const exist1 = await friendCol.where({ userId, friendId }).count();
      if (exist1.total === 0) {
        console.log('🟢 添加 user -> friend');
        await friendCol.add({
          data: {
            userId,
            friendId,
            nickName: friendInfo?.nickName || '',
            avatarUrl: friendInfo?.avatarUrl || '',
            createdAt: db.serverDate()
          }
        });
      }

      const exist2 = await friendCol.where({ userId: friendId, friendId: userId }).count();
      if (exist2.total === 0) {
        console.log('🟢 添加 friend -> user');
        await friendCol.add({
          data: {
            userId: friendId,
            friendId: userId,
            nickName: userInfo?.nickName || '',
            avatarUrl: userInfo?.avatarUrl || '',
            createdAt: db.serverDate()
          }
        });
      }
    }

    console.log('✅ 操作成功');
    return { success: true };
  } catch (err) {
    console.error('❌ deal-request 出错', err);
    return {
      success: false,
      message: '处理失败',
      error: {
        message: err.message || '',
        stack: err.stack || '',
        name: err.name || ''
      }
    };
  }
};
