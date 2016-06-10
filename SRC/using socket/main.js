var ws = require('express')();
var http = require('http').Server(ws);
var io = require('socket.io')(http);

ws.get('/', function(request, response){
  res.sendfile('main.html');
});

io.on('connection', function(socket){
  socket.on('text message', function(msg){
    io.emit('text message', msg);
  });
});

http.listen(8080, function(){
  console.log('running on *:3000');
});