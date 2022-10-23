var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var handler = require('./handler');
var port = 8181;

app.use(express.static(__dirname + '/public'));

var nicknames = [];

io.sockets.on('connection', function(socket) {

	socket.on('new user', function(data) {

		var nicknameTaken;
		nicknames.forEach(function(name){
			if ( name.toLowerCase() === data.nickname.toLowerCase() ) {
                nicknameTaken = true;
				return;
			}
		});

		if ( nicknameTaken ) {
			socket.emit('nickname taken');

		} else {
			socket.set("nickname", data.nickname, function() {
				nicknames.push(data.nickname);
				socket.emit('welcome', data.nickname, nicknames);
				socket.broadcast.emit('user joined', data.nickname, nicknames);
			});

		}
		
	});
	socket.on('outgoing', function(data) {

		socket.get('nickname', function(err,nickname) {
			var eventArgs = {
				nickname: nickname,
				message: data.message
			};
			socket.emit('incoming', eventArgs, true);
			socket.broadcast.emit('incoming', eventArgs, false);
		});
	});
	socket.on('disconnect', function(){

		socket.get('nickname', function(err, nickname){
			nicknames.splice( nicknames.indexOf(nickname), 1 );
			if(nicknames.length === 0) return;
			socket.broadcast.emit('user left', nickname, nicknames);
		});
		
		console.log('user disconnected!');
	});
});


server.listen(port, function() { console.log("Server listening at http://localhost:"+port)});
app.get('/', handler);