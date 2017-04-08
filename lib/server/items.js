const Card = require('./card');

class Items{
	constructor(){ //個数
		this.items = [
			new Card({
				name: "銅貨",
				cost: 0,
				effect: ()=>{},
				vp: 0,
				type: "money",
				money: 1,
			}),
			new Card({
				name: "銀貨",
				cost: 3,
				effect: ()=>{},
				vp: 0,
				type: "money",
				money: 2,
			}),
			new Card({
				name: "金貨",
				cost: 0,
				effect: ()=>{},
				vp: 0,
				type: "money",
				money: 3,
			}),
			new Card({
				name: "屋敷",
				cost: 2,
				effect: ()=>{},
				vp: 1,
				type: "vp",
			}),
			new Card({
				name: "公領",
				cost: 5,
				effect: ()=>{},
				vp: 3,
				type: "vp",
			}),
			new Card({
				name: "属州",
				cost: 8,
				effect: ()=>{},
				vp: 6,
				type: "vp",
			}),
		];
		
		
		const actions = [
			new Card({
				name: "村",
				cost: 3,
				effect: (self,others)=>{
					self.actnum += 2;
					self.draw();
				},
				vp: 0,
				type: "action",
			}),
			new Card({
				name: "鉱山",
				cost: 5,
				effect: (self,others)=>{
					for(;;){
						const x = self.getHandChoice();
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
							if(x.name === names["from"]){
								const y = this.getItemByName(names["to"]);
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
			}),
			new Card({
				name: "堀",
				cost: 2,
				effect: (self,others)=>{
					self.draw();
					self.draw();
				},
				vp: 0,
				type: "action",
			}),
			new Card({
				name: "民兵",
				cost: 4,
				effect: (self,others)=>{
					self.money += 2;
					for(let i=0;i<others.length;i++){
						others[i].attack(()=>{
							const x = others[i].getHandChoice();
							others[i].discard(x);
						});
					}
				},
				vp: 0,
				type: "action",
			}),
			new Card({
				name: "研究所",
				cost: 5,
				effect: (self,others)=>{
					self.actnum += 1;
					self.draw();
					self.draw();
				},
				vp: 0,
				type: "action",
			}),
			new Card({
				name: "木こり",
				cost: 3,
				effect: (self,others)=>{
					self.buynum += 1;
					self.money += 2;
				},
				vp: 0,
				type: "action",
			}),
			new Card({
				name: "鍛冶屋",
				cost: 4,
				effect: (self,others)=>{
					self.draw();
					self.draw();
					self.draw();
				},
				vp: 0,
				playable: true,
			}),
			new Card({
				name: "改築",
				cost: 4,
				effect: ()=>{
					for(;;){
						const x = self.getHandChoice();
						if(x.ispass()){
							self.addHand(x);
							break;
						}
						
						const y = self.getFieldChooice();
						if(y.money <= x.money + 2){
							y.num -= 1;
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
				playable: true,
			}),
			new Card({
				name: "市場",
				cost: 5,
				effect: (self,others)=>{
					self.draw();
					self.actnum += 1;
					self.buynum += 1;
					self.money += 1;
				},
				vp: 0,
				playable: true,
			}),
			new Card({
				name: "祝祭",
				cost: 5,
				effect: (self,others)=>{
					self.actnum += 2;
					self.buynum += 1;
					self.money += 2;
				},
				vp: 0,
				playable: true,
			}),
		];
		
		//ここ、ランダムにする
		this.items = this.items.concat(actions);
		
		this.items.push(
			new Card({
				name: "パス",
				cost: 0,
				effect: ()=>{},
				vp: 0
			}));
	}
	
	
	getItemByName(name){
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