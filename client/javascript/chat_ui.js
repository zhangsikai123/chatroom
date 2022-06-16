uiMessages = '#messages';
uiSendMessages = '#send-message';
uiSendForm = '#send-form';
uiRoom = '#room';
uiRoomList = '#room-list';

function displayMessageTime() {
  const date = new Date().toDateString();
  const time = new Date().toLocaleTimeString();
  return time + '   ' + date;
}


function divEscapedContentElement(message, avatar, name) {
  return '<div class="outgoing_msg">  <span class="outgoing_msg_nick_name">' +
    name + '</span> <div class="outgoing_msg_img"> <img src="' +
    avatar + '" alt="message"></div> <div class="sent_msg"> <p>' +
    message + '</p> <span class="time_date">' +
    displayMessageTime() +
    '</span> </div></div>';
}


function divEscapedOtherChatContentElement(message, avatar, name) {
  return '<div class="incoming_msg">  <span class="incoming_msg_nick_name">' +
    name + '</span> <div class="incoming_msg_img"><img src="' +
    avatar + '" alt="message"></div> <div class'+
    '="received_msg"> <div class="received_withd_msg"> <p>' +
    message + '</p> <span class="time_date">' +
    displayMessageTime() +
    '</span></div> </div> </div>';
}

function divSystemContentElement(message) {
  return '<div class="incoming_msg">  <span class="incoming_msg_nick_name">'+
    ' crazy system </span><div class="incoming_msg_img">'+
    '<img src="/avatars/system/5fe731ebdb0b513a664976f6.jpg"' +
    'alt="system"></div> <div class="received_msg">'+
    '<div class="received_withd_msg"> <p>' +
    message + '</p><span class="time_date">' +
    displayMessageTime() +
    '</span> </div> </div>';
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
  const chatApp = new Chat(socket);
  let currentRoom = '';
  let yourName;
  let yourAvatar;

  socket.on('nameResult', function(result) {
    let message;
    if (result.success) {
      yourName = result.name;
      yourAvatar = result.avatar;
      message = 'welcome, <b>' + yourName + '</b>.';
    } else {
      message = result.message;
    }
    $(uiMessages).append(divSystemContentElement(message));
  });


  socket.on('joinResult', function(result) {
    $(uiRoom).text(result.room);
    messages = $(uiMessages);
    messages.empty();
    messages.append(divSystemContentElement(`你来到了 ${ result.room }.`));
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
    //    $(uiRoomList + ' div').click(function() {
    // chatApp.processCommand('/join ' + $(this).text());
    // $(uiSendMessages).focus();
    // });
  });
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
  $(uiSendMessages).focus();
  $(uiSendForm).submit(function() {
    processUserInput(chatApp, socket, currentRoom, yourName, yourAvatar);
    return false;
  });
});
