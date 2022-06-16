const express = require('express');
const path = require('path');
const http = require('http');
const siofu = require("socketio-file-upload");
const app = express();
const chatServer = require('./server/chat_server');
const port = 60001;
const multer = require('multer');
const imageUpload = multer({
    dest: 'images',
});
const server = http.createServer(app);

app.use(express.static(__dirname + '/client'));
app.use(siofu.router);

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


chatServer.listen(server);
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
