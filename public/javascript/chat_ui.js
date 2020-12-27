function displayMessageTime(){
    let date = new Date().toDateString();
    let time = new Date().toLocaleTimeString();
    return time + '   ' + date
}


function divEscapedContentElement(message, avatar, name) {
    return '<div class="outgoing_msg">  <span class="outgoing_msg_nick_name">' + name + '</span> <div class="outgoing_msg_img"> <img src="' + avatar + '" alt="message"></div> <div class="sent_msg"> <p>' +
        message + '</p> <span class="time_date">'
        + displayMessageTime() + '</span> </div></div>'
}


function divEscapedOtherChatContentElement(message, avatar, name) {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    return '<div class="incoming_msg">  <span class="incoming_msg_nick_name">' + name + '</span> <div class="incoming_msg_img"><img src="' + avatar + '" alt="message"></div> <div class="received_msg"> <div class="received_withd_msg"> <p>'
        + message + '</p> <span class="time_date">' + displayMessageTime() + '</span></div> </div> </div>'
}

function divSystemContentElement(message) {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    return '<div class="incoming_msg">  <span class="incoming_msg_nick_name"> crazy system </span><div class="incoming_msg_img"><img src="/avatars/system/5fe731ebdb0b513a664976f6.jpg" alt="system"></div> <div class="received_msg"><div class="received_withd_msg"> <p>'
        + message + '</p><span class="time_date">' + displayMessageTime() + '</span> </div> </div> '
}

function processUserInput(chatApp, socket, currentRoom, yourName, yourAvatar) {
    let message = $('#send-message').val();
    let sysMessage;
    if (message.charAt(0) === '/') {
        sysMessage = chatApp.processCommand(message);
        if (sysMessage) {
            $('#messages').append(divSystemContentElement(message));
        }
    } else {
        chatApp.sendMessage(currentRoom, message);
        let messages = $('#messages');
        messages.append(divEscapedContentElement(message, yourAvatar, yourName));
        messages.scrollTop(messages.prop('scrollHeight'))
    }
    $('#send-message').val('');
}

let socket = io.connect();


$(document).ready(function () {
    let chatApp = new Chat(socket);
    let currentRoom = '';
    let yourName;
    let yourAvatar;

    socket.on('nameResult', function (result) {
        let message;
        if (result.success) {
            yourName = result.name;
            yourAvatar = result.avatar;
            message = "欢迎加入我们, <b>" + yourName + "</b>.";
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });


    socket.on('joinResult', function (result) {
        $('#room').text(result.room);
        messages = $('#messages');
        messages.empty();
        messages.append(divSystemContentElement(`你来到了 ${ result.room }.`));
        currentRoom = result.room
    });

    socket.on('message', function (message) {
        let newElement = divEscapedOtherChatContentElement(message.text, message.avatar, message.name);
        messages = $('#messages');
        messages.append(newElement);
        messages.scrollTop(messages.prop('scrollHeight'))

    });

    socket.on('rooms', function (rooms) {
        $('#room-list').empty();
        for (idx in rooms) {
            room = rooms[idx];
            if (room !== '') {
                $('#room-list').append(room);
            }
        }
        $('#room-list div').click(function () {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });
    setInterval(function () {
        socket.emit('rooms');
    }, 1000);
    $('#send-message').focus();
    $('#send-form').submit(function () {
        processUserInput(chatApp, socket, currentRoom, yourName, yourAvatar);
        return false;
    });
});