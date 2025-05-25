const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { requestId, isAgreed } = event

  if (!requestId) {
    return { success: false, message: 'requestId 缺失' }
  }

  // 更新 friend 表中的 isAgreed 字段
  await db.collection('friend').doc(requestId).update({
    data: {
      isAgreed: isAgreed
    }
  })

  return {
    success: true,
    message: isAgreed ? '已同意好友请求' : '已处理请求'
  }
}
