const $ = require('jquery');

class Card{
	constructor(x){
		this.name = x["name"];
		if(this.name === "pass")return;
		this.cost = x["cost"];
		this.effect = x["effect"];
		this.vp = x["vp"];
		this.type = x["type"];
		this.description = x["description"];
		
		if(this.type === "money"){
			this.money = x["money"];
			this.num = 10000;
		}
		else{
			this.money = 0;
			if(this.type === "vp"){
				//ここは、items.js内で変更する。
				this.num = -1;
			}
			else if(this.ispass()){
				this.num = 10000;
			}
			else{
				this.num = 10;
			}
		}
		
		if(this.description === undefined){
			this.description = this.effect.toString();
		}
	}
	*action(self,others){
		yield* this.effect(self,others);
	}
	ispass(){
		return (this.name === "pass");
	}
}

module.exports = Card;