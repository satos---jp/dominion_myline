//ここでclientとやっていくつもり

const Utils = require('./utils');
const Items = require('./items');

class Player{
	constructor(socket){
		this.socket = socket;
		this.pile = [];
		this.hand = [];
		this.discards = [];
	}
	initFields(items){
		this.items = items;
		this.socket.emit('fielddata',this.items);
		this.pile = [];
		const doka = this.items.getItemByName("銅貨");
		for(let i=0;i<10;i++){
			this.pile.push(doka);
		}
		const yashiki = this.items.getItemByName("屋敷");
		for(let i=0;i<0;i++){
			this.pile.push(yashiki);
		}
		//デバッグのために10:0にしておく
		Utils.shuffle(this.pile);
		this.discards = [];
	}
	*getHandChoice(){
		//選ばれたカードは手札から消える
		for(;;){
			const getHandCard = yield 'choice_hand';
			
			const idx = this.hand.findIndex((x)=>{
				return (x.name === getHandCard);
			});
			if(idx<0){
				this.error("不正な選択です");
				continue;
			}
			const res = this.hand[idx];
			this.hand = Utils.removeidx(this.hand,idx);
			this.reflesh();
			return res;
		}
	}
	*getFieldChoice(){
		const res = yield 'choice_field';
		return this.items.getItemByName(res);
	}
	
	*play(others){
		//手札をplayする。
		this.actnum = 1;
		this.money = 0;
		this.buynum = 1;
		while(this.actnum>0){
			const x = yield* this.getHandChoice();
			if(x.ispass()){
				this.log("パスしました");
				break;
			}
			if(x.type !== "action"){
				this.error("これはアクションカードではない");
				this.addHand(x);
				continue;
			}
			this.actnum--;
			this.discard(x);
			yield* x.action(this,others);
		}
		
		for(let i=0;i<this.hand.length;i++){
			this.money += this.hand[i].money;
		}
		this.log("持ち金 : " + this.money);
		while(this.buynum>0){
			const x = yield* this.getFieldChoice();
			if(x.ispass()){
				this.log("パスしました");
				break;
			}
			if(x.num<=0){
				this.error("ないものは買えない");
				continue;
			}
			if(this.money<x.cost){
				this.error("お金が足りない");
				continue;
			}
			
			x.num -= 1;
			this.discard(x);
			this.buynum -= 1;
			this.money -= x.cost;
			this.reflesh();
		}
	}
	
	*attack(f){
		let hit = true;
		for(;;){
			const x = yield* this.getHandChoice();
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
			yield* f();
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
	log(str){
		console.log('PlayerLog :: ' + str);
	}
}

module.exports = Player;