const chatServer = require('./lib/chat_server');
const fs = require('fs');
const http = require('http');
const mime = require('mime');
const path = require('path');
const cache = {};
const user = {};
const port = 60001;


function send404(response) {
  response.writeHead(404, {'content-type': 'text/plain'});
  response.write('Error 404: avatars not found');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'content-type': mime.getType(path.basename(filePath))});
  response.end(fileContents);
}

function serveStatic(response, cache, absPathOfStatic) {
  fs.exists(absPathOfStatic, function(exists) {
    if (!exists) {
      send404(response);
    } else {
      fs.readFile(absPathOfStatic, function(err, data) {
        if (err) {
          send404(response);
        } else {
          cache[absPathOfStatic] = data;
          sendFile(response, absPathOfStatic, data);
        }
      });
    }
  });
}

function router(url) {
  let filePath = false;
  while (true) {
    if (url == '/'){
      filePath = 'public/chat.html';
      break;
    }
    if (url.startsWith('/new')){
      filePath = 'public/chat2.html';
      break;
    }
    if( url == '/hello'){
      filePath = 'public/hello.html';
      break;
    }
    else{
      filePath = 'public' + url;
      break;
    }
  }
  return filePath;
}

mainServer = http.createServer(function(request, response) {
  console.debug('got request ' + request.method + ':' + request.url);
  filePath = router(request.url);
  const absPathOfStatic = './' + filePath;
  serveStatic(response, cache, absPathOfStatic);
}).listen(port, function() {
  console.log('server is starting at port: ' + port);
});
chatServer.listen(mainServer);
