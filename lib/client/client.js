const $ = require('jquery');
const socket = require('socket.io-client')(); //これだけでserverのsocketと繋がるっぽい

const Cardview = require('./cardview');

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
			this.showHands(data);
		});
		
		socket.on('choice_hand', () => {
			console.log('choice_hand');
			console.log(this.hand);
			this.choiceFrom(this.hand);
		});
		socket.on('choice_field', () => {
			console.log('choice_field');
			console.log(this.field);
			this.choiceFrom(this.field);
		});
	}
	
	showHands(data){
		$('#hands').empty();
		this.hand = data.map((d)=>{
			const x = new Cardview(d);
			$('#hands').append(x.drawInHand(data.length));
			return x;
		});
	}
	
	showField(data){
		$('#field').empty();
		this.field = data.map((d)=>{
			const x = new Cardview(d);
			$('#field').append(x.drawInField());
			return x;
		});
	}
	
	choiceFrom(x){
		console.log(x);
		for(let i=0;i<x.length;i++){
			const d = x[i];
			d.emphasis(true);
			d.elem.on('mouseup',()=>{
				socket.emit('choiced',d.name);
				for(let j=0;j<x.length;j++){
					x[j].elem.off('mouseup');
					d.emphasis(false);
				}
			});
		}
	}
}

$(document).ready(() => {
	const cilent = new Client();
});
