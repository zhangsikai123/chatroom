const Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.login = function(name) {
  this.socket.emit('login', {
    name:name
  });
};

Chat.prototype.changeName = function(name) {
  this.socket.emit('changeNameAttempt', name);
};

Chat.prototype.sendMessage = function(room, text) {
  const message = {
    room: room, text: text,
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('change', {
    newRoom: room,
  });
};

Chat.prototype.processCommand = function(command) {
  const words = command.split(' ');
  command = words[0]
      .substring(1, words[0].length)
      .toLowerCase();
  let message = false;
  switch (command) {
    case 'join':
      words.shift();
      const room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nick':
      words.shift();
      const name = words.join(' ');
      this.socket.emit('changeNameAttempt', name);
      break;
    default:
      message = 'unrecognized command.';
      break;
  }
  return message;
};
