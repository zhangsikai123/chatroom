uiMessages = '#messages';
uiSendMessages = '#send-message';
uiSendForm = '#send-form';
uiRoom = '#room';
uiRoomList = '#room-list';
uiUserList = '#users-list';

function displayMessageTime() {
  const date = new Date().toDateString();
  const time = new Date().toLocaleTimeString();
  return time + '   ' + date;
}

function renderUser(avatar, name) {
  return `<div class="chat-user"><img class="chat-avatar"
src="${avatar}" alt=""><div class="chat-user-name">
<a href="#">${name}</a></div></div>`;
}

function renderMessage(me, message, avatar, name) {
  if (me) {
    place = 'right';
    id = 'mine-message';
  } else {
    place = 'left';
    id = 'other-message';
  }
  return `<div class="chat-message ${place}" id="${id}">
<img class="message-avatar" src="${avatar}" alt="">
<div class="message"><a class="message-author" href="#">${name}
</a><span class="message-date"> ${displayMessageTime()} </span>
<span class="message-content">${message}</span></div>`;
}
function divEscapedContentElement(message, avatar, name) {
  return renderMessage(true, message, avatar, name);
}

function divEscapedOtherChatContentElement(message, avatar, name) {
  return renderMessage(false, message, avatar, name);
}

function divSystemContentElement(message) {
  const avatar = '/avatars/system/5fe731ebdb0b513a664976f6.jpg';
  const name = 'crazy system';
  return renderMessage(false, message, avatar, name);
}

function processUserInput(chatApp, socket, currentRoom, yourName, yourAvatar) {
  const message = $(uiSendMessages).val();
  let sysMessage;
  if (message.charAt(0) === '/') {
    sysMessage = chatApp.processCommand(message);
    if (sysMessage) {
      $(uiMessages).append(divSystemContentElement(message));
    }
  } else {
    chatApp.sendMessage(currentRoom, message);
    const messages = $(uiMessages);
    messages.append(divEscapedContentElement(message, yourAvatar, yourName));
    messages.scrollTop(messages.prop('scrollHeight'));
  }
  $(uiSendMessages).val('');
}

const socket = io.connect();

$(document).ready(function() {
  let currentRoom = '';
  let yourName;
  let yourAvatar;
  const chatApp = new Chat(socket);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let name = urlParams.get('name');
  chatApp.login(name);

  socket.on('userInfo', function(result) {
    let message;
    yourName = result.name;
    yourAvatar = result.avatar;
  });

  socket.on('joinResult', function(result) {
    $(uiRoom).text(result.room);
    messages = $(uiMessages);
    messages.empty();
    messages.append(divSystemContentElement(`welcome to ${ result.room }.`));
    currentRoom = result.room;
  });

  socket.on('message', function(message) {
    const newElement = divEscapedOtherChatContentElement(
        message.text, message.avatar, message.name);
    messages = $(uiMessages);
    messages.append(newElement);
    messages.scrollTop(messages.prop('scrollHeight'));
  });

  socket.on('rooms', function(rooms) {
    $(uiRoomList).empty();
    for (let idx=0; idx<rooms.length; idx++) {
      room = rooms[idx];
      if (room !== '') {
        $(uiRoomList).append(room);
      }
    }
  });

  socket.on('friendsList', function(result) {
    users = result.users;
    $(uiUserList).empty();
    for (let i=0; i<users.length; i++) {
      user = users[i];
      avatar = user.avatar;
      name = user.name;
      $(uiUserList).append(renderUser(avatar, name));
    }
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
  setInterval(function() {
    socket.emit('friendsList');
  }, 1000);

  $(uiSendMessages).focus();
  $(uiSendForm).submit(function() {
    processUserInput(chatApp, socket, currentRoom, yourName, yourAvatar);
    return false;
  });
});
