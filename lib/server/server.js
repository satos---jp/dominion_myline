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

io.on('connection', function (socket) {
	
	socket.on('ack',()=>{
		if(!acked){
			players.push(new Player(socket));
			console.log('connected .. ' + players.length);
			
			if(players.length >= 1){ //ŠJŽn‚µ‚Ü‚·
				console.log('Game start!!');
				const ng = new Game(players);
				cont = ng.run();
				socket.emit(cont.next()["value"]);
				acked = true;
			}
		}
	});
	
	socket.on('choiced',(x)=>{
		
		console.log('choiced!!');
		socket.emit(cont.next(x)["value"]);
	});
	
});

server.listen(process.env.PORT || 8080, function () {
	console.log('Listening localhost:process.env.PORT || 8080...');
});
