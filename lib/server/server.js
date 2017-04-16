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


let roomidx = 0;
const players = [[]];
const conts = [];

io.on('connection', function (socket) {
	let acked = false;
	socket.on('ack',(playerNum)=>{
		if(!acked){
			const roomname = 'room' + roomidx;
			players[roomidx].push(new Player(socket,((x,y)=>{io.to(roomname).emit(x,y);}),roomidx,players[roomidx].length));
			socket.join(roomname);
			
			console.log('connected .. ' + players[roomidx].length);
			acked = true;
			
			if(playerNum>=1 && players[roomidx].length >= playerNum){ //1ƒ‹[ƒ€‚Å‚«‚ ‚ª‚é
				console.log('Game start!!');
				const ng = new Game(players[roomidx]);
				conts.push(ng.run());
				const emitdata = conts[roomidx].next()["value"];
				console.log('io_emit :: ',emitdata);
				io.to(emitdata["to"]).emit(emitdata["type"],emitdata["data"]);
				
				roomidx += 1;
				players.push([]);
			}
		}
	});
	
	socket.on('choiced',(x)=>{
		console.log('choiced!!');
		const emitdata = conts[x["idx"]].next(x["data"])["value"];
		if(emitdata.finished === true){
			console.log('finish game ' + x["idx"]);
		}
		else{
			io.to(emitdata["to"]).emit(emitdata["type"],emitdata["data"]);
		}
	});
});


server.listen(process.env.PORT || 8080, function () {
	console.log('Listening localhost:process.env.PORT || 8080...');
});
