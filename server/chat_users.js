fs = require('fs');
const chatConst = require('./chat_const.js');
const users = {};
const cache = {};
const adjectives = chatConst.adjectives();
const nouns = chatConst.nouns();

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function usedNames(){
  names = [];
  userIds = Object.keys(users);
  for(let i=0;i<userIds.length;i++){
    userId = userIds[i];
    name = users[userId]['name'];
    names.push(avatar);
  }
  return names;
}

function generateNickName() {
  let namesUsed = usedNames();
  if (namesUsed.length === (adjectives.length * nouns.length)) {
    alert('你的名字库已经干涸，请联系工程师 zhangsikai314@mail.zhangsikai.com 多加一点名字');
  }
  idx1 = getRndInteger(0, adjectives.length);
  idx2 = getRndInteger(0, nouns.length);
  nickName = adjectives[idx1] + nouns[idx2];
  while (namesUsed.indexOf(nickName) !== -1) {
    idx1 = getRndInteger(0, adjectives.length);
    idx2 = getRndInteger(0, nouns.length);
    nickName = adjectives[idx1] + nouns[idx2];
  }
  return nickName;
}

function generateID(){
  // generate UUID
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function usedAvatars(){
  avatars = [];
  userIds = Object.keys(users);
  for(let i=0;i<userIds.length;i++){
    userId = userIds[i];
    avatar = users[userId]['avatar'];
    avatars.push(avatar);
  }
  return avatars;
}

function getAllAvatars(baseDir) {
  const allAvatars = [];
  const relativeBasePath = '/avatars/';
  fs.readdirSync(baseDir).forEach((file) => {
    if (file === 'system') {
    } else {
      allAvatars.push(relativeBasePath + file);
    }
  });
  return allAvatars;
}

exports.generateAvatar = function () {
  avatarUsed = usedAvatars();
  if (cache['allAvatars'] !== undefined) {
    allAvatars = cache['allAvatars'];
  } else {
    allAvatars = getAllAvatars('./client/avatars/');
    cache['allAvatars'] = allAvatars;
  }
  if (avatarUsed.length === allAvatars.length) {
    throw new Error('你的头像库已经干涸，请联系工程师 zhangsikai314@mail.zhangsikai.com 多加一点头像');
  }
  avatar = allAvatars[getRndInteger(0, allAvatars.length)];
  while (avatarUsed.indexOf(avatar) !== -1) {
    avatar = allAvatars[getRndInteger(0, allAvatars.length)];
  }
  return avatar;
};

exports.readAll = function(){
  result = [];
  userIds = Object.keys(users);
  for(let i=0;i<userIds.length;i++){
    userId = userIds[i];
    user = users[userId];
    result.push(user);
  }
  return result;
}

exports.create = function(name, id){
  if(name == undefined || name == ''){
    name = generateNickName();
  }
  avatar = this.generateAvatar();
  user = {
    "id": id,
    "name": name,
    "avatar": avatar,
  };
  users[id] = user;
  return user;
};


exports.update = function(id, name) {
  user = users[id];
  user['name'] = name;
};

exports.read = function(id) {
  return users[id];
};

exports.delete = function(id) {
  delete users[id];
};
