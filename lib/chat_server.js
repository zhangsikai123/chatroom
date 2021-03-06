let fs = require('fs');
let nickNames = {};
let avatars = {};
let avatarsUsed = [];
let namesUsed = [];
let currentRoom = {};
let adjectives = [
    '种族歧视者',
    '内裤撕裂者',
    '疯狂的',
    '中年油腻的',
    '忧郁的',
    '打工人',
    '暴躁的',
    '搞笑的',
    '喜欢说fuck的',
    '笑起来很猥琐的',
    '欠扁的'
];
let nouns = [
    '藤田',
    '孝太郎',
    '冲田一郎',
    '穆罕默德',
    '买买提',
    '侯赛因',
    'bitch',
    '尼哥',
    '麦克',
    'tiger the nigger',
    '东莞仔',
    '铁柱',
    '龟孙儿',
    '李铁蛋',
    '约翰逊',
    '杰克森',
    '雪莉',
    '柯南',
    '妮可'
];
let systemAvatar = '/avatars/system/5fe731ebdb0b513a664976f6.jpg';
let io;
let cache = {};
let systemName = 'crazy system';

socketio = require('socket.io');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateNickName(namesUsed) {
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
    return nickName
}

function getAllAvatars(baseDir) {
    let allAvatars = [];
    let relativeBasePath = '/avatars/';
    fs.readdirSync(baseDir).forEach(file => {
        if (file === 'system') {
        }
        else {
            allAvatars.push(relativeBasePath + file)
        }
    });
    return allAvatars;
}

function generateAvatar(avatarUsed, allAvatars) {
    if (avatarUsed.length === allAvatars.length) {
        alert('你的头像库已经干涸，请联系工程师 zhangsikai314@mail.zhangsikai.com 多加一点头像');
    }
    avatar = allAvatars[getRndInteger(0, allAvatars.length)];
    while (avatarUsed.indexOf(avatar) !== -1) {
        avatar = allAvatars[getRndInteger(0, allAvatars.length)]
    }
    avatarUsed.push(avatar);
    return avatar
}

function assignGuestName(socket, nickNames, namesUsed, nickName) {

    let name = nickName;
    nickNames[socket.id] = name;

    let allAvatars;
    if (cache['allAvatars'] !== undefined) {
        allAvatars = cache['allAvatars']
    } else {
        allAvatars = getAllAvatars('./public/avatars/');
        cache['allAvatars'] = allAvatars;
    }
    let avatar = assignAvatar(socket, avatars, avatarsUsed, allAvatars);

    socket.emit('nameResult', {success: true, name: name, avatar: avatar});
    namesUsed.push(name);
    return name;
}

function assignAvatar(socket, avatars, avatarUsed, allAvatars) {
    let avatar = generateAvatar(avatarUsed, allAvatars);
    avatars[socket.id] = avatar;
    socket.emit('avatarResult', {success: true, avatar: avatar});
    return avatar
}

function joinRoom(socket, room) {
    console.debug('join in ' + room);
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room: room});
    socket.broadcast.to(room).emit('message', {
        avatar: systemAvatar,
        name: systemName,
        id: socket.id,
        text: nickNames[socket.id] + ' <b> 加入了 ' + room + '.</b>'
    });
    let usersInRoom = io.sockets.adapter.rooms[room];
    if (usersInRoom && usersInRoom.length > 1) {
        let usersInRoomSummary = '';
        keys = Object.keys(usersInRoom.sockets);
        for (idx in keys) {
            let userInRoomSocketId = keys[idx];
            if (userInRoomSocketId !== socket.id) {
                usersInRoomSummary += nickNames[userInRoomSocketId] + "</br>"
            }
        }
        usersInRoomSummary += '<b>对你说: fucking bitch! 来聊天啊.</b>';
        socket.emit('message', {
            avatar: systemAvatar,
            name: systemName,
            id: socket.id,
            text: usersInRoomSummary
        })
    }

}

function handleMessageBroadcasting(socket, nickNames, avatars) {
    socket.on('message', function (message) {
        myMessage =
            console.debug('got message:' + message.text);
        socket.broadcast.to(message.room).emit('message', {
            id: socket.id,
            text: message.text,
            name: nickNames[socket.id],
            avatar: avatars[socket.id],
        });
    });
}

function handleRoomJoining(socket) {
    socket.on('join', function (joinRoomRequest) {
        let room = currentRoom[socket.id];
        if (joinRoomRequest.newRoom === room) {
            return
        }
        socket.leave(room);
        socket.broadcast.to(room).emit('message', {
            avatar: systemAvatar,
            name: systemName,
            id: socket.id,
            text: nickName + " <b>离开了" + currentRoom[socket.id] + ", fuck他! </b>"
        });
        joinRoom(socket, joinRoomRequest.newRoom);
    });
}

function handleClientDisconnection(socket, nickNames, namesUsed) {
    socket.on('disconnect', function () {
        let nickName = nickNames[socket.id];
        let nameIndex = namesUsed.indexOf(nickName);
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
            avatar: systemAvatar,
            name: systemName,
            id: socket.id,
            text: nickName + " <b>退出了 , fuck他! </b>"
        });
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}

function handleNameChangeAttempts(socket, nickNames) {
    socket.on('changeNameAttempt', function (name) {
        if (name.indexOf('Guest') === 0) {
            socket.emit('nameResult', {
                success: false,
                message: 'Names cannot begin with Guest sorry, pick another one plz'
            })
        } else {
            if (namesUsed.indexOf(name) === -1) {
                previousName = nickNames[socket.id];
                previousNameIdx = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete namesUsed[previousNameIdx];
                socket.emit('nameResult', {
                    success: true,
                    name: name,
                });
                socket.broadcast.to(currentRoom[socket.id]).emit(
                    'message', {
                        text: previousName + ' 找警察叔叔改名了, 他现在叫: ' + name + '.'
                    });
            } else {
                socket.emit('nameResult', {
                    success: false,
                    message: 'That name is already in use.'
                });
            }
        }
    });
}

function ActiveRooms() {
    let activeRooms = [];
    Object.keys(io.sockets.adapter.rooms).forEach(room => {
        let isRoom = true;
        Object.keys(io.sockets.adapter.sids).forEach(id => {
            isRoom = (id === room) ? false : isRoom;
        });
        if (isRoom) activeRooms.push(room);
    });
    return activeRooms;
}

exports.listen = function (server) {
    defaultRoom = '精神病院';
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        nickName = generateNickName(namesUsed);
        assignGuestName(socket, nickNames, namesUsed, nickName);
        joinRoom(socket, defaultRoom);
        handleMessageBroadcasting(socket, nickNames, avatars);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms', function () {
            socket.emit('rooms', ActiveRooms())
        });
        handleClientDisconnection(socket, nickNames, namesUsed);
    });
};