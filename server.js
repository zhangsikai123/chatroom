const express = require('express');
const path = require('path');
const http = require('http');
const siofu = require("socketio-file-upload");
const app = express();

const chatServer = require('./lib/chat_server');
const port = 60001;
app.use(express.static(__dirname + '/public'));
app.use(siofu.router);
const multer = require('multer');
const imageUpload = multer({
    dest: 'images',
});

app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});
app.post('/image', imageUpload.single('image'), (req, res) => {
    console.log(req.file);
    res.json('/image api');
});
app.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, '/images/' + filename);
  return res.sendFile(fullfilepath);
});

const server = http.createServer(app);
chatServer.listen(server);
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
