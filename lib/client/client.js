const $ = require('jquery');
const socket = require('socket.io-client')(); //これだけでserverのsocketと繋がるっぽい

const Cardview = require('./cardview');

class Client{
	constructor(){
		console.log('constructing');
		$('#ackbutton').on('click',()=>{
			socket.emit('ack');
		});
		socket.on('fielddata', (data) => {
			console.log('getdata');
			this.field = data.items;
			this.showField(this.field);
		});
		socket.on('playerdata', (data) => {
			this.showPlayer(data);
		});
		
		socket.on('choice_hand', () => {
			console.log('choice_hand');
			this.choiceFrom(this.hand);
		});
		socket.on('choice_field', () => {
			console.log('choice_field');
			this.choiceFrom(this.field);
		});
	}
	
	showField(data){
		$('#field').empty();
		this.field = data.map((d)=>{
			const x = new Cardview(d);
			const v = x.drawInField();
			
			v.hover(()=>{
				$('#hoverView').empty();
				$('#hoverView').append((new Cardview(x)).drawInHand());
			},()=>{
			});
			$('#field').append(v);
			return x;
		});
	}
	
	showPlayer(data){
		this.showHand(data["hand"]);
		this.showStatus(data["status"]);
	}
	
	showHand(data){
		$('#hands').empty();
		this.hand = data.map((d)=>{
			const x = new Cardview(d);
			$('#hands').append(x.drawInHand(data.length));
			return x;
		});
	}
	
	showStatus(data){
		$('#playerinfo').empty();
		$('#playerinfo').append($('<div>',{
			text: ("残りアクション数 :: " + data["actnum"] + 
					"　　残り購入数 :: " + data["buynum"] + 
					"　　残金 :: " + data["money"] + "　　")
		})); 
	}
	
	choiceFrom(x){
		const disablefunc = (()=>{
			for(let j=0;j<x.length;j++){
				x[j].elem.off('mouseup');
				x[j].emphasis(false);
			}
			$('#passbutton').off('mouseup');
		});
		for(let i=0;i<x.length;i++){
			const d = x[i];
			d.emphasis(true);
			d.elem.on('mouseup',()=>{
				socket.emit('choiced',d.name);
				disablefunc();
			});
		}
		$('#passbutton').on('mouseup',()=>{
			socket.emit('choiced','pass');
			disablefunc();
		});
	}
}

$(document).ready(() => {
	const cilent = new Client();
});
