const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const usersCollection = db.collection('fellow')

exports.main = async (event, context) => {
  const { _id } = event
  try {
    // 直接根据 userId 查找并修改数据
    await usersCollection.doc(_id).update({
      data: {
        isAgree:true
      }
    })

    return { code: 200, message: '修改成功' }
  } catch (error) {
    return { code: 500, message: '修改失败', error }
  }
}