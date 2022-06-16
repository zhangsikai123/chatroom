chatUser = require('../server/chat_users.js');
assert = require('assert');
// start mocha test
describe('User', function() {
  describe('#CRUD', function(){
    it('should create a user and then users should have a user', function(){
     avatarSize = 10;
     for(let i=0;i<avatarSize;i++){
       name = `testUser-${i}`;
       user = chatUser.create(name, i);
       assert.equal(name, user['name']);
       id = user['id'];
       newName = 'new' + name;
       chatUser.update(id, newName);
       newUser = chatUser.read(id);
       assert.equal(newName, newUser.name);
       chatUser.delete(id);
       assert.equal(undefined, chatUser.read(id));
     };
    });
  });
  describe('#generateAvatar()', function() {
    it('should return avatar addr string with cache filled', function() {
      avatarSize = 100;
       for(let i=0;i<avatarSize;i++){
        avatar = chatUser.generateAvatar();
        console.log(avatar);
      }
    });
  });
});
