const Card = require('./card');

class Items{
	constructor(){ //個数
		this.items = [
			new Card({
				name: "銅貨",
				cost: 0,
				effect: function*(){},
				vp: 0,
				type: "money",
				money: 1,
				description: "1金",
			}),
			new Card({
				name: "銀貨",
				cost: 3,
				effect: function*(){},
				vp: 0,
				type: "money",
				money: 2,
				description: "2金",
			}),
			new Card({
				name: "金貨",
				cost: 6,
				effect: function*(){},
				vp: 0,
				type: "money",
				money: 3,
				description: "3金",
			}),
			new Card({
				name: "屋敷",
				cost: 2,
				effect: function*(){},
				vp: 1,
				type: "vp",
				description: "1勝利点",
			}),
			new Card({
				name: "公領",
				cost: 5,
				effect: function*(){},
				vp: 3,
				type: "vp",
				description: "3勝利点",
			}),
			new Card({
				name: "属州",
				cost: 8,
				effect: function*(){},
				vp: 6,
				type: "vp",
				description: "6勝利点",
			}),
		];
		
		
		const actions = [
			new Card({
				name: "村",
				cost: 3,
				effect: function*(self,others){
					self.actnum += 2;
					self.draw();
				},
				vp: 0,
				type: "action",
				description: "+2アクション\n+1ドロー",
			}),
			new Card({
				name: "鉱山",
				cost: 5,
				effect: function*(self,others){
					for(;;){
						const x = yield* self.getHandChoice();
						console.log(x);
						if(x.ispass()){
							self.addHand(x);
							break;
						}
						
						if(x.type !== "money"){
							self.error("貨幣ではない");
							self.addHand(x);
							continue;
						}
						
						const names = [
							{from:"銅貨",to:"銀貨"},
							{from:"銀貨",to:"金貨"},
						];
						
						let ok = false;
						for(let i=0;i<2;i++){
							if(x.name === names[i]["from"]){
								const y = self.items.getItemByName(names[i]["to"]);
								self.addHand(y);
								ok = true;
								break;
							}
						}
						if(ok)break;
						else{
							self.addHand(x);
							self.error("銅貨、銀貨のみが採掘可能");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "(銅貨|銀貨)を破棄して(銀貨|金貨)を手札に加える",
			}),
			new Card({
				name: "堀",
				cost: 2,
				effect: function*(self,others){
					self.draw();
					self.draw();
				},
				vp: 0,
				type: "action",
				description: "+2ドロー\n他人のアタックカードの攻撃を防げる",
			}),
			new Card({
				name: "民兵",
				cost: 4,
				effect: function*(self,others){
					self.money += 2;
					for(let i=0;i<others.length;i++){
						yield* others[i].attack(this.name,function*(){
							for(let j=0;j<2;j++){
								others[i].log("残り" + (2-j) + "枚捨ててください");
								const x = yield* others[i].getHandChoice();
								if(x.ispass()){
									j += 1;
									continue;
								}
								others[i].discard(x);
							}
						});
					}
				},
				vp: 0,
				type: "action",
				description: "+2金\n他プレイヤーの手札から2枚を捨てさせる",
			}),
			new Card({
				name: "研究所",
				cost: 5,
				effect: function*(self,others){
					self.actnum += 1;
					self.draw();
					self.draw();
				},
				vp: 0,
				type: "action",
				description: "+2ドロー\n+1アクション",
			}),
			new Card({
				name: "木こり",
				cost: 3,
				effect: function*(self,others){
					self.buynum += 1;
					self.money += 2;
				},
				vp: 0,
				type: "action",
				description: "+1購入\n+2金",
			}),
			new Card({
				name: "鍛冶屋",
				cost: 4,
				effect: function*(self,others){
					self.draw();
					self.draw();
					self.draw();
				},
				vp: 0,
				type: "action",
				description: "+3ドロー",
			}),
			new Card({
				name: "改築",
				cost: 4,
				effect: function*(self,others){
					for(;;){
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							self.addHand(x);
							break;
						}
						
						const y = yield* self.getFieldChoice();
						console.log(x,y);
						if(y.cost <= x.cost + 2){
							self.getItemFromField(y);
							self.discard(y);
							break;
						}
						else{
							self.addHand(x);
							self.error("高すぎて購入できない");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "手札から1枚を破棄することにより\nそれよりたかだか2コスト高いカードを得られる",
			}),
			new Card({
				name: "市場",
				cost: 5,
				effect: function*(self,others){
					self.draw();
					self.actnum += 1;
					self.buynum += 1;
					self.money += 1;
				},
				vp: 0,
				type: "action",
				description: "+1ドロー\n+1アクション\n+1購入\n+1金",
			}),
			new Card({
				name: "祝祭",
				cost: 5,
				effect: function*(self,others){
					self.actnum += 2;
					self.buynum += 1;
					self.money += 2;
				},
				vp: 0,
				type: "action",
				description: "+2アクション\n+1購入\n+2金",
			}),
		];
		
		//ここ、ランダムにする
		this.items = this.items.concat(actions);
		
	}
	
	
	getItemByName(name){
		if(name === 'pass'){
			return new Card({name: 'pass'});
		}
		for(let i=0;i<this.items.length;i++){
			if(this.items[i].name === name)return this.items[i];
		}
		return undefined;
	}
	
	soldout(){
		let a = 0;
		for(let i=0;i<this.items.length;i++){
			const x = this.items[i];
			if(x.num<=0){
				a++;
				if(x.name === "属州"){//属州の売り切れ
					return true;
				}
			}
		}
		if(a>=3){
			return true; //3山切れ
		}
		
		return false;
	}
}

module.exports = Items;