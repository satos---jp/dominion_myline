//ここでclientとやっていくつもり

const Utils = require('./utils');
const Items = require('./items');

class Player{
	constructor(socket){
		this.socket = socket;
		
		this.socket.on('choiced', (name)=>{
			this.selected = true;
			this.selectname = name;
		});
	}
	initFields(items){
		this.items = items;
		this.socket.emit('fielddata',this.items);
		this.pile = [];
		const doka = this.items.getItemByName("銅貨");
		for(let i=0;i<7;i++){
			this.pile.push(doka);
		}
		const yashiki = this.items.getItemByName("屋敷");
		for(let i=0;i<3;i++){
			this.pile.push(yashiki);
		}
		Utils.shuffle(this.pile);
		this.discards = [];
	}
	getHandChoice(){
		//選ばれたカードは手札から消える
		for(;;){
			this.selected = false;
			this.socket.emit('choice_hand',{});
			console.log('waiting');
			while(!this.selected){}
			console.log('waited');
			
			const idx = this.hand.findIndex((x)=>{
				return (x.name === this.selectname);
			});
			if(idx<0){
				this.error("不正な選択です");
				continue;
			}
			const res = this.hand[idx];
			this.hand = this.hand.slice(0,idx).concat(this.hand.slice(idx));
			this.reflesh();
			return res;
		}
	}
	getFieldChoice(){
		this.selected = false;
		this.socket.emit('choice_field');
		while(!this.selected){}
		return this.items.getItemByName(this.selectname);
	}
	
	play(others){
		//手札をplayする。
		this.actnum = 1;
		this.money = 0;
		this.buynum = 1;
		while(this.actnum>0){
			const x = this.getHandChoice();
			if(x.ispass())break;
			this.actnum--;
			x.action(this,others);
		}
		
		for(let i=0;i<this.hand.length;i++){
			this.money += this.hand[i].money;
		}
		
		while(this.buynum>0){
			const x = player.getFieldChoice();
			if(x.ispass())break;
			if(x.num<=0){
				this.error("ないものは買えない");
				continue;
			}
			if(x.cost<money){
				this.error("お金が足りない");
				continue;
			}
			
			x.num -= 1;
			this.discard(x);
			this.buynum -= 1;
			this.reflesh();
		}
	}
	
	attack(f){
		let hit = true;
		for(;;){
			const x = this.getHandChoice();
			if(x.name === "堀"){
				hit = false;
				this.addHand(x);
				break;
			}
			else if(x.ispass()){
				this.addHand(x);
				break;
			}
		}
		if(hit){
			f();
		}
	}
	
	discard(x){
		this.discards.push(x);
	}
	
	addHand(x){
		this.hand.push(x);
		this.reflesh();
	}
	draw(){
		if(this.pile.length<=0){
			Utils.shuffle(this.discards);
			this.pile = this.discards;
			this.discards = [];
		}
		this.addHand(this.pile.shift());
		this.reflesh();
	}
	redraw(){
		this.discards = this.discards.concat(this.hand);
		this.hand = [];
		for(let i=0;i<5;i++){
			this.draw();
		}
		this.addHand(this.items.getItemByName("パス"));
	}
	
	reflesh(){
		this.socket.emit('fielddata',this.items);
		this.socket.emit('handdata',this.hand);
	}
	
	error(str){
		console.error('Playererror :: ' + str);
	}
}

module.exports = Player;