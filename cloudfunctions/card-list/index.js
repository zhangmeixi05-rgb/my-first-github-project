const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const usersCollection = db.collection('posts')
// const personCollection = db.collection('person_list')

exports.main = async (event, context) => {
  const {title,content,images,date,location,username,avatar,userId,nickName} = event
  try {
   const res =  await usersCollection.add({
      data:{
        title,
        content, 
        images,
        date,
        location,
        username,
        avatar,
        userId,
        nickName
      }
    })
  // 如果账户名存在且密码正确，返回用户id
  return {
    code: 200,
    message: '添加成功'
  }
  } catch (error) {
    return {
      code: 500,
      message: '添加失败'
    }
  }
 
}