const chatUser = require('./chat_users.js');
const fs = require('fs');
const systemAvatar = '/avatars/system/5fe731ebdb0b513a664976f6.jpg';
const systemName = 'crazy system';
const socketio = require('socket.io');
const currentRoom = {};


function handleUserLogin(socket) {
  socket.on('login', function(user) {
    console.log(`${user.name} login`);
    user = chatUser.create(user.name, socket.id);
    socket.emit('userInfo', {
      success: true,
      name: user['name'],
      avatar: user['avatar']});
  });
}

function assignAvatar(socket, avatars, avatarUsed, allAvatars) {
  const avatar = generateAvatar(avatarUsed, allAvatars);
  avatars[socket.id] = avatar;
  socket.emit('avatarResult', {success: true, avatar: avatar});
  return avatar;
}

function joinRoom(socket, room) {
  console.debug('join in ' + room);
  socket.join(room);
  currentRoom[socket.id] = room;
  users = [];
  socket.emit('joinResult', {room: room});
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    user = chatUser.read(socket.id);
    myMessage = console.debug('got message:' + message.text);
    socket.broadcast.to(message.room).emit('message', {
      id: socket.id,
      text: message.text,
      name: user.name,
      avatar: user.avatar,
    });
  });
}

function handleRoomChanging(socket) {
  socket.on('changeRoom', function(joinRoomRequest) {
    const room = currentRoom[socket.id];
    if (joinRoomRequest.newRoom === room) {
      return;
    };
    user = chatUser.read(socket.id);
    socket.leave(room);
    socket.broadcast.to(room).emit('message', {
      avatar: systemAvatar,
      name: systemName,
      id: socket.id,
      text: user.name + ' <b>离开了' + currentRoom[socket.id] + '</b>',
    });
    joinRoom(socket, joinRoomRequest.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    chatUser.delete(socket.id);
  });
}

function handleNameChangeAttempts(socket) {
  socket.on('changeNameAttempt', function(name) {
    chatUser.update(socket.id, name);
    user = chatUser.read(socket.id);
    socket.emit('userInfo', {
      success: true,
      name: user.name,
      avatar:user.avatar,
     });
   });
 };

function activeFriends() {
  return chatUser.readAll();
}

function activeRooms(io) {
  const activeRooms = [];
  Object.keys(io.sockets.adapter.rooms).forEach((room) => {
    let isRoom = true;
    Object.keys(io.sockets.adapter.sids).forEach((id) => {
      isRoom = (id === room) ? false : isRoom;
    });
    if (isRoom) activeRooms.push(room);
  });
  return activeRooms;
}

exports.listen = function(server) {
  let defaultRoom = '精神病院';
  const io = socketio.listen(server);
  io.set('log level', 1);
  let nickName = '';
  io.sockets.on('connection', function(socket) {
    handleUserLogin(socket);
    joinRoom(socket, defaultRoom);
    handleMessageBroadcasting(socket);
    handleNameChangeAttempts(socket);
    handleRoomChanging(socket);
    socket.on('rooms', function() {
      socket.emit('rooms', activeRooms(io));
    });
    socket.on('friendsList', function() {
      socket.emit('friendsList', {'users': activeFriends()});
    });
    handleClientDisconnection(socket);
  });
};
