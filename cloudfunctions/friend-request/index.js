const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const fellowCollection = db.collection('fellow')
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { friendId, isAgree } = event
  // 查询是否存在相同账户名
  const friendList = await fellowCollection.where({
    friendId:friendId,
    isAgree:isAgree
  }).get()
  const users= []
  for(const item of friendList.data){
    const user = await usersCollection.where({
      _id:item.userId
    }).get()
    users.push({
      _id:item._id,
      userId:item.userId,
      friendId:item.friendId,
      reason:item.reason,
      avatarUrl:user.data[0].avatarUrl,
      nickName:user.data[0].nickName
    })
  }

 return users;
}