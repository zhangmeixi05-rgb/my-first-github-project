// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const userId = event.userId;
  if (!userId) {
    return {
      friends: [],
      error: '缺少 userId 参数'
    };
  }

  try {
    console.log('get-simple-friends 调用，userId:', userId);
    const res = await db.collection('friend').where({ userId }).get();
    console.log('查询结果:', res.data);

    const friends = res.data.map(item => ({
      id: item.friendId,
      nickName: item.nickName,
      avatarUrl: item.avatarUrl
    }));

    return { friends };
  } catch (err) {
    console.error('查询异常:', err);
    return { friends: [], error: err.message };
  }
};
