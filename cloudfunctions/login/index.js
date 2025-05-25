// 云函数 login/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { username, password } = event

  try {
    const res = await db.collection('users').where({ username, password }).get()

    if (res.data.length > 0) {
      return {
        code: 200,
        message: '登录成功',
        data: res.data[0]
      }
    } else {
      return {
        code: 401,
        message: '用户名或密码错误'
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '数据库查询失败',
      error
    }
  }
}
