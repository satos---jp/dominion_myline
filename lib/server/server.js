'use strict';

const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const server = http.createServer(app);

const Game = require('./game');
const Player = require('./player');

app.use(express.static('client'));

var io = socketIO(server);

const players = [];

let cont = undefined;

let roomidx = 0;

io.on('connection', function (socket) {
	
	let acked = false;
	socket.on('ack',()=>{
		if(!acked){
			players.push(new Player(socket,((x,y)=>{io.to('room0').emit(x,y);})));
			socket.join('room0');
			
			console.log('connected .. ' + players.length);
			acked = true;
			
			if(players.length >= 2){ //1ƒ‹[ƒ€‚Å‚«‚ ‚ª‚é
				console.log('Game start!!');
				const ng = new Game(players);
				cont = ng.run();
				const emitdata = cont.next()["value"];
				io.to(emitdata["to"]).emit(emitdata["data"]);
				
				//players = [];
			}
		}
	});
	
	socket.on('choiced',(x)=>{
		console.log('choiced!!');
		const emitdata = cont.next(x)["value"];
		io.to(emitdata["to"]).emit(emitdata["data"]);
	});
});

server.listen(process.env.PORT || 8080, function () {
	console.log('Listening localhost:process.env.PORT || 8080...');
});
