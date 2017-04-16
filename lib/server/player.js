//ここでclientとやっていくつもり

const Utils = require('./utils');
const Items = require('./items');
const Card = require('./card');


class Player{
	constructor(socket,bfun,roomidx,playeridx){
		this.socket = socket;
		this.sendBroadcast = bfun;
		this.pile = [];
		this.hand = [];
		this.discards = [];
		this.nowdiscards = [];
		this.sendPlayer('initRoomidx',roomidx);
		this.status = "接続待ち";
		this.playeridx = playeridx;
		
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
		const x = this.items.getItemByName("金貨");
		for(let i=0;i<10;i++){
			this.pile.push(x);
		}
		*/
		/*
		実装あとまわし
		呪い,宰相,玉座の間,密偵,役人,書庫,魔女,冒険者
		*/
		
		Utils.shuffle(this.pile);
		this.status = "待機中";
		this.redraw();
	}
	
	*play(others){
		//手札をplayする。
		this.actnum = 1;
		this.money = 0;
		this.buynum = 1;
		this.status = "アタックフェイズ";
		this.refleshPlayer();
		this.allLog("Player " + this.playeridx + " の番です"); 
		while(this.actnum>0){
			const x = yield* this.getHandChoice();
			if(x.ispass()){
				this.selfLog("パスしました");
				break;
			}
			if(x.type !== "action"){
				this.warn("これはアクションカードではない");
				this.addHand(x);
				continue;
			}
			this.actnum--;
			this.allLog(x.name + "を使いました");
			yield* x.action(this,others);
			if(!x.dispose){
				this.discard(x);
			}
			this.refleshPlayer();
		}
		
		for(let i=0;i<this.hand.length;i++){
			const x = this.hand[i];
			this.money += x.money;
			this.discard(x);
		}
		this.hand = [];
		this.allLog(this.money + "金です");
		
		this.status = "購入フェイズ";
		this.refleshPlayer();
		
		while(this.buynum>0){
			const x = yield* this.getFieldChoice();
			if(x.ispass()){
				this.selfLog("パスしました");
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
			
			this.fieldToDiscards(x);
			this.allLog(x.name + "を購入しました");
			this.buynum -= 1;
			this.money -= x.cost;
			this.refleshPlayer();
		}
		
		this.actnum = undefined;
		this.money = undefined;
		this.buynum = undefined;
		this.status = "待機中";
		this.redraw();
	}
	
	*attack(f,name){
		this.selfLog(name + " によるアタックです。堀があると防げます。");
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
			this.allLog(name + "によるアタックを防げませんでした");
			yield* f();
		}
		else{
			this.allLog(name + " によるアタックを堀で防ぎました");
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
		const x = this.getTopOfPile();
		if(x.ispass()){
			this.selfLog("引ききりです");
		}
		else{
			this.addHand(x);
		}
	}
	
	getTopOfPile(){
		if(this.pile.length<=0){
			Utils.shuffle(this.discards);
			this.pile = this.discards;
			this.discards = [];
		}
		if(this.pile.length<=0){
			return new Card({name: "pass"});
		}
		return this.pile.shift();
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
	
	calcVP(){
		let res = 0;
		const allcards = this.hand.concat(this.pile).concat(this.discards).concat(this.nowdiscards);
		for(let i=0;i<allcards.length;i++){
			res += allcards[i].vp;
			if(allcards[i].name === "呪い"){
				res += Math.floor((allcards.length + 0.5)/10);
			}
		}
		return res;
	}
	
	getItemFromField(x){
		x.num -= 1;
		this.refleshField();
	}
	
	fieldToDiscards(x){
		this.getItemFromField(x);
		this.discard(x);
	}
	
	*getHandChoice(){
		//console.log('choice Playerid :: ' + this.socket.id);
		//選ばれたカードは手札から消える
		for(;;){
			const getHandCard = yield* this.yieldToSelf('choice_hand');
			if(getHandCard === "pass")return new Card({name: "pass"});
			
			const idx = this.hand.findIndex((x)=>{
				return (x.name === getHandCard);
			});
			if(idx<0){
				this.error("ないものが選ばれています!!");
				continue;
			}
			const res = this.hand[idx];
			this.hand = Utils.removeidx(this.hand,idx);
			this.refleshPlayer();
			return res;
		}
	}
	
	*getChoice(cards){
		const mh = this.hand;
		this.hand = cards;
		this.refleshPlayer();
		const x = yield* this.getHandChoice();
		cards = this.hand;
		this.hand = mh;
		this.refleshPlayer();
		return {choiced: x,tocards: cards};
	}
	
	*getFieldChoice(){
		const res = yield* this.yieldToSelf('choice_field');
		return this.items.getItemByName(res);
	}
	
	*getYesNo(){
		const s = yield* this.yieldToSelf('choice_option',['yes','no']);
		return (s === 'yes');
	}
	
	*getOptionChoice(ops){
		return yield* this.yieldToSelf('choice_option',ops);
	}
	
	*getRestrictedFieldChoice(f){
		for(;;){
			const x = yield* this.getFieldChoice();
			if(f(x)){
				return x;
			}
			else{
				this.warn("これは選択できません");
			}
		}
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
				status: this.status,
				playeridx: this.playeridx,
				allmycardnum: (this.pile.length + this.hand.length + this.discards.length + this.nowdiscards.length),
			},
		});
		this.sendAll('nowdiscards',this.nowdiscards);
	}
	
	*yieldToSelf(type,data){
		return yield {to: this.socket.id,type: type,data: data};
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
		this.sendPlayer('logdata',{
			type: 'error',
			msg: str
		});
	}
	selfLog(str){
		console.log('PlayerSelfLog :: ' + str);
		this.sendPlayer('logdata',{
			type: 'log',
			msg: '個人log :: ' + str
		});
	}
	allLog(str){
		console.log('PlayerAllLog :: ' + str);
		this.sendAll('logdata',{
			type: 'log',
			msg: 'Player ' + this.playeridx + ' :: ' + str
		});
	}
	warn(str){
		console.log('PlayerWorning :: ' + str);
		this.sendPlayer('logdata',{
			type: 'warn',
			msg: str
		});
	}
}

module.exports = Player;