const $ = require('jquery');

class Cardview{
	constructor(x){
		this.name = x["name"];
		this.cost = x["cost"];
		this.effect = x["effect"];
		this.vp = x["vp"];
		this.type = x["type"];
		this.num = x["num"];
		this.description = x["description"];
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
	drawInHand(num){
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
	
	emphasis(b){
		if(b){
			this.elem.css('border','solid 2px red');
		}
		else{
			this.elem.css('border','none');
		}
	}
}


module.exports = Cardview;