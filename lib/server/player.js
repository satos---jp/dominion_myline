//ここでclientとやっていくつもり

const Utils = require('./utils');
const Items = require('./items');
const Card = require('./card');


class Player{
	constructor(socket,bfun){
		this.socket = socket;
		this.sendBroadcast = bfun;
		this.pile = [];
		this.hand = [];
		this.discards = [];
		this.nowdiscards = [];
	}
	initFields(items){
		this.items = items;
		this.refleshField();
		
		this.pile = [];
		
		const doka = this.items.getItemByName("銅貨");
		for(let i=0;i<7;i++){
			this.pile.push(doka);
		}
		const yashiki = this.items.getItemByName("屋敷");
		for(let i=0;i<3;i++){
			this.pile.push(yashiki);
		}
		/*
		//デバッグのため
		const x = this.items.getItemByName("民兵");
		for(let i=0;i<10;i++){
			this.pile.push(x);
		}
		*/
		
		Utils.shuffle(this.pile);
		this.redraw();
	}
	
	*play(others){
		//手札をplayする。
		this.actnum = 1;
		this.money = 0;
		this.buynum = 1;
		this.refleshPlayer();
		this.log("アタックフェイズです");
		while(this.actnum>0){
			const x = yield* this.getHandChoice();
			if(x.ispass()){
				this.log("パスしました");
				break;
			}
			if(x.type !== "action"){
				this.warn("これはアクションカードではない");
				this.addHand(x);
				continue;
			}
			this.actnum--;
			this.discard(x);
			yield* x.action(this,others);
			this.refleshPlayer();
		}
		
		for(let i=0;i<this.hand.length;i++){
			const x = this.hand[i];
			this.money += x.money;
			this.discard(x);
		}
		this.hand = [];
		this.refleshPlayer();
		
		this.log("購入フェイズです");
		while(this.buynum>0){
			const x = yield* this.getFieldChoice();
			if(x.ispass()){
				this.log("パスしました");
				break;
			}
			if(x.num<=0){
				this.warn("ないものは買えない");
				continue;
			}
			if(this.money<x.cost){
				this.warn("お金が足りない");
				continue;
			}
			
			this.getItemFromField(x);
			this.discard(x);
			this.buynum -= 1;
			this.money -= x.cost;
			this.refleshPlayer();
		}
		
		this.actnum = undefined;
		this.money = undefined;
		this.buynum = undefined;
		this.redraw();
	}
	
	*attack(name,f){
		this.log(name + "によるアタックです。堀があると防げます。");
		let hit = true;
		for(;;){
			const x = yield* this.getHandChoice();
			if(x.name === "堀"){
				hit = false;
				this.addHand(x);
				break;
			}
			else if(x.ispass()){
				break;
			}
			else{
				this.warn("堀でないのでアタックは防げません");
				this.addHand(x);
			}
		}
		if(hit){
			yield* f();
		}
	}
	
	discard(x){
		this.nowdiscards.push(x);
	}
	
	addHand(x){
		this.hand.push(x);
		this.refleshPlayer();
	}
	draw(){
		if(this.pile.length<=0){
			Utils.shuffle(this.discards);
			this.pile = this.discards;
			this.discards = [];
		}
		if(this.pile.length<=0){
			//引ききってしまった
			this.log("引ききりです");
			return;
		}
		this.addHand(this.pile.shift());
	}
	redraw(){
		this.discards = this.discards.concat(this.nowdiscards);
		this.nowdiscards = [];
		this.discards = this.discards.concat(this.hand);
		this.hand = [];
		for(let i=0;i<5;i++){
			this.draw();
		}
	}
	
	getItemFromField(x){
		x.num -= 1;
		this.refleshField();
	}
	
	*getHandChoice(){
		console.log('choice Playerid :: ' + this.socket.id);
		//選ばれたカードは手札から消える
		for(;;){
			const getHandCard = yield* this.yieldToSelf('choice_hand');
			if(getHandCard === "pass")return new Card({name: "pass"});
			
			const idx = this.hand.findIndex((x)=>{
				return (x.name === getHandCard);
			});
			if(idx<0){
				this.warn("不正な選択です");
				continue;
			}
			const res = this.hand[idx];
			this.hand = Utils.removeidx(this.hand,idx);
			this.refleshPlayer();
			return res;
		}
	}
	
	*getFieldChoice(){
		const res = yield* this.yieldToSelf('choice_field');
		return this.items.getItemByName(res);
	}
	
	refleshField(){
		this.sendAll('fielddata',this.items);
	}
	
	refleshPlayer(){
		this.sendPlayer('playerdata',{
			hand: this.hand,
			status: {
				actnum: this.actnum,
				buynum: this.buynum,
				money: this.money,
			},
		});
		this.sendAll('nowdiscards',this.nowdiscards);
	}
	
	*yieldToSelf(data){
		return yield {to: this.socket.id,data: data};
	}
	
	sendPlayer(type,data){
		this.socket.emit(type,data);
	}
	
	sendAll(type,data){
		//this.socket.emit(type,data);
		this.sendBroadcast(type,data);
	}
	
	error(str){
		console.error('Playererror :: ' + str);
		this.sendAll('logdata',{
			type: 'error',
			msg: str
		});
	}
	log(str){
		console.log('PlayerLog :: ' + str);
		this.sendAll('logdata',{
			type: 'log',
			msg: str
		});
	}
	warn(str){
		console.log('PlayerWorning :: ' + str);
		this.sendAll('logdata',{
			type: 'warn',
			msg: str
		});
	}
}

module.exports = Player;