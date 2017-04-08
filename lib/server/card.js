const $ = require('jquery');

class Card{
	constructor(x){
		this.name = x["name"];
		this.cost = x["cost"];
		this.effect = x["effect"];
		this.vp = x["vp"];
		this.type = x["type"];
		
		if(this.type === "money"){
			this.money = x["money"];
			this.num = 10000;
		}
		else{
			this.money = 0;
			if(this.type === "vp"){
				//ここ、人数によって変える
				this.num = 12;
			}
			else if(this.ispass()){
				this.num = 10000;
			}
			else{
				this.num = 10;
			}
		}
		
		if(x["description"] === undefined){
			this.description = this.effect.toString();
			this.description = "hoge";
		}
	}
	action(self,others){
		this.effect(self,others);
	}
	ispass(){
		return (this.name === "パス");
	}
	drawInField(){
		this.elem = $('<div>',{
			'class': 'fieldcard',
		});
		this.elem.append($('<div>',{
			'class': 'name',
			text: this.name
		}));
		this.elem.append($('<div>',{
			'class': 'cost',
			text: this.cost
		}));
		this.elem.append($('<div>',{
			'class': 'num',
			text: this.num
		}));
		return this.elem;
	}
	drawInHands(num){
		this.elem = $('<div>',{
			'class': 'handcard',
			'width': (100 / num) + '%'
		});
		this.elem.append($('<div>',{
			'class': 'name',
			text: this.name
		}));
		this.elem.append($('<div>',{
			'class': 'description',
			text: this.description
		}));
		return this.elem;
	}
}

module.exports = Card;