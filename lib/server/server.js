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
let acked = false;

let roomidx = 0;

io.on('connection', function (socket) {
	
	socket.on('ack',()=>{
		if(!acked){
			players.push(new Player(socket,((x,y)=>{io.to('room0').emit(x,y);})));
			console.log('connected .. ' + players.length);
			acked = true;
			
			if(players.length >= 1){ //1���[���ł�������
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
