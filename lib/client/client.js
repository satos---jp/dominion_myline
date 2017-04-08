const $ = require('jquery');
const socket = require('socket.io-client')(); //これだけでserverのsocketと繋がるっぽい

const Card = require('./../server/card');

class Client{
	constructor(){
		console.log('constructing');
		$('#ackbutton').on('click',()=>{
			socket.emit('ack');
		});
		socket.on('test', () => {
			console.log('test data');
		});
		socket.on('test2', (x) => {
			console.log('test data 2');
			console.log(x);
		});
		socket.on('fielddata', (data) => {
			console.log('getdata');
			console.log(data);
			this.field = data.items;
			this.showField(this.field);
		});
		socket.on('handdata', (data) => {
			this.hand = data;
			this.showHands(data);
		});
		
		socket.on('choice_hand', () => {
			this.choiceFrom(this.hand);
		});
		socket.on('choice_field', () => {
			this.choiceFrom(this.field);
		});
	}
	
	showHands(data){
		$('#hands').empty();
		for(let i=0;i<data.length;i++){
			const d = new Card(data[i]);
			console.log(d);
			console.log(JSON.stringify(d));
			$('#hands').append(d.drawInHands(data.length));
		}
	}
	
	showField(data){
		$('#field').empty();
		for(let i=0;i<data.length;i++){
			const d = new Card(data[i]);
			console.log(d);
			console.log(JSON.stringify(d));
			$('#field').append(d.drawInField());
		}
	}
	
	choiceFrom(x){
		for(let i=0;i<x.length;i++){
			const d = x[i];
			d.elem.attr('onclick',()=>{
				socket.emit('choiced',d.name);
				for(let i=0;i<x.length;i++){
					x[i].d.elem.attr('onclick',()=>{});
				}
			});
		}
	}
}

$(document).ready(() => {
	const cilent = new Client();
});
