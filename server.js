const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const chatServer = require('./lib/chat_server');
const port = 60001;
app.use(express.static(__dirname + '/public'));
app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});


chatServer.listen(server);
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
