let fs = require('fs');
let http = require('http');
let mime = require('mime');
let path = require('path');
let cache = {};
let port = 60001;


function send404(response) {
    response.writeHead(404, {'content-type': 'text/plain'});
    response.write('Error 404: avatars not found');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'content-type': mime.getType(path.basename(filePath))});
    response.end(fileContents)
}

function serveStatic(response, cache, absPathOfStatic) {

    // if (cache[absPathOfStatic]) {
    //     sendFile(response, absPathOfStatic, cache[absPathOfStatic])
    // } else {
        fs.exists(absPathOfStatic, function (exists) {
            if (!exists) {
                send404(response)
            } else {
                fs.readFile(absPathOfStatic, function (err, data) {
                    if (err) {
                        send404(response)
                    } else {
                        cache[absPathOfStatic] = data;
                        sendFile(response, absPathOfStatic, data)
                    }
                })
            }
        })
    // }
}

function router(url) {
    let filePath = false;
    switch (url) {
        case '/':
            filePath = 'public/chat.html';
            break;
        case '/hello':
            filePath = 'public/hello.html';
            break;
        default:
            filePath = 'public' + url
    }
    return filePath
}

mainServer = http.createServer(function (request, response) {
    console.debug('got request ' + request.method + ':' + request.url);
    filePath = router(request.url);
    let absPathOfStatic = './' + filePath;
    serveStatic(response, cache, absPathOfStatic)
}).listen(port, function () {
    console.log('server is starting at port: ' + port)
});

let chatServer = require('./lib/chat_server').listen(mainServer);
