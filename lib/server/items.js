const Card = require('./card');
const Utils = require('./utils');

class Items{
	constructor(pnum){ //個数
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
				name: "地下貯蔵庫",
				cost: 2,
				effect: function*(self,others){
					self.actnum += 1;
					let disnum = 0;
					self.selfLog("カードを選んで捨ててください");
					for(;;){
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							break;
						}
						self.discard(x);
						disnum += 1;
					}
					self.allLog(disnum + "枚捨てました");
					for(let i=0;i<disnum;i++){
						self.draw();
					}
				},
				vp: 0,
				type: "action",
				description: "+1アクション\n捨て札1につき+1ドロー",
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
				name: "礼拝堂",
				cost: 2,
				effect: function*(self,others){
					let disnum = 0;
					self.selfLog("カードを選んで破棄してください");
					for(let i=0;i<4;i++){
						self.allLog("残り" + (4-disnum) + "枚破棄できます");
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							break;
						}
						disnum += 1;
					}
					self.allLog(disnum + "枚破棄しました");
				},
				vp: 0,
				type: "action",
				description: "手札から4枚まで破棄できる",
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
				name: "工房",
				cost: 3,
				effect: function*(self,others){
					for(;;){
						self.selfLog("欲しいカードを選択してください");
						const x = yield* self.getFieldChoice();
						if(x.ispass()){
							self.allLog("何も得ませんでした");
							break;
						}
						if(x.num >= 1 && x.cost <= 4){
							self.fieldToDiscards(x);
							self.allLog(x.name + "を得ました");
							break;
						}
						else{
							self.warn("高すぎるか、ないため得られません");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "コストがたかだか4以下のカードを1枚得られる",
			}),
			new Card({
				name: "宰相",
				cost: 3,
				effect: function*(self,others){
					self.money += 2;
					self.selfLog("山札を捨て札にしますか？");
					const b = yield* self.getYesNo();
					if(b){
						self.pile.forEach((c)=>{
							self.discard(c);
						});
						self.pile = [];
						self.allLog("山札を捨て札にしました");
					}
					else{
						self.allLog("山札を捨て札にはしませんでした");
					}
				},
				vp: 0,
				type: "action",
				description: "+2金\n山札のすべてを即座に捨て札にすることができる",
			}),
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
				name: "改築",
				cost: 4,
				effect: function*(self,others){
					for(;;){
						self.selfLog("改築元を選んでください");
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							self.allLog("なにも改築しませんでした");
							break;
						}
						
						let y = undefined;
						let rereadx = false;
						self.selfLog(x.name + "から改築する先を選んでください");
						for(;;){
							y = yield* self.getFieldChoice();
							if(y.ispass()){
								rereadx = true;
							}
							break;
						}
						
						if(rereadx){
							//xをキャンセルする
							self.addHand(x);
							continue;
						}
						
						if(y.num >= 1 && y.cost <= x.cost + 2){
							self.fieldToDiscards(y);
							
							self.allLog(x.name + "を" + y.name + "に改築しました");
							break;
						}
						else{
							self.addHand(x);
							self.warn("高すぎるか、もうないために改築できない");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "手札から1枚を破棄することにより\nそれよりたかだか2コスト高いカードを得られる",
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
				name: "金貸し",
				cost: 4,
				effect: function*(self,others){
					const a = self.hand.findIndex((x)=>{
						return (x.name === "銅貨");
					});
					if(a>=0){
						self.hand = Utils.removeidx(self.hand,a);
						self.allLog("銅貨を廃棄しました");
						self.money += 3;
						self.refleshPlayer();
					}
					else{
						self.allLog("銅貨はありませんでした");
					}
				},
				vp: 0,
				type: "action",
				description: "手札に1枚銅貨があれば必ず廃棄し、+3金得る",
			}),
			new Card({
				name: "玉座の間",
				cost: 4,
				effect: function*(self,others){
					self.selfLog("2度行うアクションカードを選択してください");
					for(;;){
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							self.allLog("なにも選択しませんでした");
							break;
						}
						
						if(x.isaction()){
							self.allLog(x.name + "を二回使用します");
							self.allLog(x.name + "の1回目の使用です");
							yield* x.action(self,others);
							self.allLog(x.name + "の2回目の使用です");
							yield* x.action(self,others);
							if(!x.dispose){
								self.discard(x);
							}
							break;
						}
						else{
							self.warn("アクションカードを選択してください");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "手札にあるアクションカードを2回使用する",
			}),
			new Card({
				name: "祝宴",
				cost: 4,
				effect: function*(self,others){
					self.selfLog("欲しいカードを選択してください");
					const x = yield* self.getRestrictedFieldChoice((x)=>{
						return (x.ispass() || (x.num>=1 && x.cost <= 5));
					});
					if(x.ispass()){
						self.allLog("なにも得ませんでした");
					}
					else{
						self.fieldToDiscards(x);
						self.allLog(x.name + "を得ました");
					}
				},
				vp: 0,
				type: "action",
				dispose: true,
				description: "この札を廃棄する代わりに5コスト以下のカードを得る",
			}),
			new Card({
				name: "庭園",
				cost: 4,
				effect: function*(){},
				vp: 0,
				type: "vp",
				description: "持ち札10枚ごとに1勝利点",
			}),
			new Card({
				name: "泥棒",
				cost: 4,
				effect: function*(self,others){
					for(let iii=0;iii<others.length;iii++){
						const p = others[iii];
						yield* p.attack(function*(){
							self.selfLog("Player " + p.playeridx + " から破棄させる財宝カードを選べます");
							const ncs = [];
							for(let i=0;i<2;i++){
								const c = p.getTopOfPile();
								if(c.ispass())continue;
								ncs.push(c);
							}
							
							for(;;){
								const pa = yield* self.getChoice(ncs);
								const x = pa.choiced,
									  tcs = pa.tocards;
								if(x.ispass()){
									self.allLog("player " + p.playeridx + " からはなにも廃棄させませんでした");
									tcs.forEach((c)=>{
										p.discard(c);
									});
									break;
								}
								
								if(x.type !== "money"){
									self.warn("財宝カードではない");
									continue;
								}
								else{
									self.allLog("player " + p.playeridx + " からは" + x.name  + "を廃棄させました");
									tcs.forEach((c)=>{
										p.discard(c);
									});
									
									self.selfLog(x.name + "を得ますか？");
									const b = yield* self.getYesNo();
									if(b){
										self.discard(x);
										self.allLog(x.name + "を得ました");
									}
									else{
										self.allLog(x.name + "を得ませんでした");
									}
									break;
								}
							}
						},this.name);
					}
				},
				vp: 0,
				type: "action",
				description: ("他プレイヤーの山札から2枚を捨てさせ、" + 
							  "そのうちに財宝カードがあれば、それを1枚まで廃棄させられる。" + 
							  "また、廃棄させたカードを得ることができる"),
			}),
			new Card({
				name: "密偵",
				cost: 4,
				effect: function*(self,others){
					self.actnum += 1;
					self.draw();
					for(let iii=0;iii<others.length;iii++){
						const p = others[iii];
						yield* p.attack(function*(){
							const c = p.getTopOfPile();
							if(c.ispass()){
								self.allLog("Player " + p.playeridx + " は引ききっています");
								return;
							}
							
							self.allLog("Player " + p.playeridx + " の山札の一番上は " + c.name + " です");
							self.selfLog("これを捨て札にさせますか？");
							
							const b = yield* self.getYesNo();
							if(b){
								p.discard(c);
								self.allLog(c.name + "を捨て札にさせました");
							}
							else{
								p.setTopOfPile(c);
								self.allLog(c.name + "をそのままにしました");
							}
						},this.name);
					}
				},
				vp: 0,
				type: "action",
				description: ("+1ドロー\n+1アクション\n" + 
							  "自分を含む各プレーヤーの山札の一番上のカードを公開させ、" + 
							  "それを捨て札にするかそのままにするかを選べる"),
			}),
			new Card({
				name: "民兵",
				cost: 4,
				effect: function*(self,others){
					self.money += 2;
					for(let i=0;i<others.length;i++){
						yield* others[i].attack(function*(){
							let cn = Math.min(2,others[i].hand.length);
							while(cn>0){
								others[i].selfLog("残り" + cn + "枚捨ててください");
								const x = yield* others[i].getHandChoice();
								if(x.ispass()){
									others[i].warn("捨てる必要があります");
									continue;
								}
								others[i].discard(x);
								cn--;
							}
						},this.name);
					}
				},
				vp: 0,
				type: "action",
				description: "+2金\n他プレイヤーの手札から2枚を捨てさせる",
			}),
			new Card({
				name: "役人",
				cost: 4,
				effect: function*(self,others){
					self.setTopOfPile(self.items.getItemByName("銀貨"));
					for(let i=0;i<others.length;i++){
						const p = others[i];
						yield* p.attack(function*(){
							if(p.hand.findIndex((c)=>{return c.type === "vp"}) < 0){
								self.allLog("Player " + p.playeridx + " の手札は " + 
									p.hand.map((c)=>{return c.name}) + " だったので" + 
									"勝利点はありませんでした");
							}
							else{
								p.selfLog("山札の上に置く勝利点カードを選択してください");
								for(;;){
									const x = yield* others[i].getHandChoice();
									if(x.ispass()){
										p.warn("カードを選択してください");
										continue;
									}
									if(x.type !== "vp"){
										p.warn("それは勝利点カードではないです");
										p.addHand(x);
										continue;
									}
									self.allLog("Player " + p.playeridx + " は" + x.name + "を置きました");
									break;
								}
							}
						},this.name);
					}
				},
				vp: 0,
				type: "action",
				description: "あなたは銀貨を一枚山札の上に置く\n他プレイヤーは手札から勝利点カードを山札の上に(あれば必ず)置く",
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
				name: "議事堂",
				cost: 5,
				effect: function*(self,others){
					self.draw();
					self.draw();
					self.draw();
					self.draw();
					self.buynum += 1;
					others.forEach((x)=>{
						x.draw();
						x.refleshPlayer();
					});
				},
				vp: 0,
				type: "action",
				description: "+4ドロー\n+1購入\n他人も+1ドロー",
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
				name: "鉱山",
				cost: 5,
				effect: function*(self,others){
					for(;;){
						const x = yield* self.getHandChoice();
						console.log(x);
						if(x.ispass()){
							self.allLog("採掘しませんでした");
							break;
						}
						
						if(x.type !== "money"){
							self.warn("貨幣ではない");
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
								self.allLog(x.name + "を" + y.name + "に変換しました");
								ok = true;
								break;
							}
						}
						if(ok)break;
						else{
							self.addHand(x);
							self.warn("銅貨、銀貨のみが採掘可能");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "(銅貨|銀貨)を破棄して(銀貨|金貨)を手札に加える",
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
			new Card({
				name: "書庫",
				cost: 5,
				effect: function*(self,others){
					const rmn = 7 - self.hand.length;
					const mh = self.hand;
					self.hand = [];
					for(let i=0;i<rmn;i++){
						self.draw();
					}
					
					self.selfLog("捨て札にしたいアクションカードを選んでください");
					for(;;){
						const x = yield* self.getHandChoice();
						if(x.ispass()){
							break;
						}
						if(x.isaction()){
							self.discard(x);
							self.draw();
						}
						else{
							self.addHand(x);
							self.warn("アクションカードしか捨てられません");
						}
					}
					self.hand = mh.concat(self.hand);
				},
				vp: 0,
				type: "action",
				description: "手札が7枚になるまでカードを引く。その際に、アクションカードを手札に加えずに捨て札にしてもよい。",
			}),
			new Card({
				name: "魔女",
				cost: 5,
				effect: function*(self,others){
					self.draw();
					self.draw();
					const sucs = [];
					const curs = self.items.getItemByName("呪い");
					if(curs.num<=0){
						self.allLog("呪いがないのでアタックは生じません");
						return;
					}
					
					for(let i=0;i<others.length;i++){
						const p = others[i];
						yield* p.attack(function*(){
							sucs.push(i);
						},this.name);
					}
					
					const gns = others.map((x)=>{return 0;});
					for(let i=0;i<2;i++){
						sucs.forEach((x)=>{
							if(curs.num > 0){
								others[x].discard(curs);
								curs.num -= 1;
								gns[x] += 1;
							}
						});
					}
					
					self.refleshField();
					for(let i=0;i<others.length;i++){
						const p = others[i];
						if(gns[i]>0){
							p.allLog("呪いを " + gns[i] + " 枚受け取りました");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "+2ドロー\n他プレーヤーは呪いを受け取る",
			}),
			new Card({
				name: "冒険者",
				cost: 6,
				effect: function*(self,others){
					let tn = 0;
					while(tn<2){
						const x = self.getTopOfPile();
						if(x.ispass()){
							self.allLog("引ききりました");
							break;
						}
						if(x.ismoney()){
							self.addHand(x);
							self.allLog(x.name + "を引いたので手札に加えました");
							tn++;
						}
						else{
							self.discard(x);
							self.allLog(x.name + "を引いたので捨て札にしました");
						}
					}
				},
				vp: 0,
				type: "action",
				description: "山札から財宝カードが2枚出るまでカードを公開する。\n財宝カードは手札に加え、他は捨て札にする",
			}),
		];
		
		let ta = actions;
		Utils.shuffle(ta);
		if(!Utils.getOption('debugitem').ison){
			while(ta.length > 10){
				ta = Utils.removeidx(ta,Math.floor(ta.length * Math.random()));
			}
		}
		
		if(Utils.getOption('debugitem').ison || (ta.findIndex((c)=>{return c.name === "魔女";})>=0)){
			ta.push(new Card({
				name: "呪い",
				cost: 0,
				effect: function*(){},
				vp: -1,
				type: "vp",
				description: "-1勝利点",
			}));
		}
		ta = ta.sort((a,b)=>{return a.cost-b.cost;});
		this.items = this.items.concat(ta);
		
		this.items.forEach((x)=>{
			if(x.type === "vp"){
				let narr = [-1];
				if(x.name === "屋敷" || x.name === "公領"){
					narr = [-1,4,8,12,12,12,12];
				}
				else if(x.name === "属州"){
					narr = [-1,4,8,12,12,15,18];
				}
				else if(x.name === "庭園"){
					narr = [-1,4,8,12,12,12,12];
				}
				else if(x.name === "呪い"){
					narr = [-1,0,10,20,30,40,50];
				}
				if(narr.length <= pnum){
					x.num = narr.pop();
				}
				else{
					x.num = narr[pnum];
				}
			}
		});
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