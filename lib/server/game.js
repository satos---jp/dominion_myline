const Items = require('./items');

class Game{
	constructor(players){
		//init game state
		this.players = players;
		this.items = new Items();
		for(let i=0;i<this.players.length;i++){
			const p = this.players[i];
			p.initFields(this.items);
			p.redraw();
		}
		
		this.playeridx = 0;
		this.run();
	}
	
	run(){
		for(;;){
			console.log('Play player ' + this.playeridx);
			const player = this.players[this.playeridx];
			const others = this.players.slice(0,this.playeridx).concat(this.players.slice(this.playeridx+1));
			player.play();
			player.redraw();
			
			this.playeridx = (this.playeridx+1) % this.players.size;
			
			if(this.isfinish()){
				console.log("試合終了");
				break;
			}
		}
	}
	
	isfinish(){
		return this.items.soldout();
	}
	
	error(str){
		console.error("error !!! " + str);
	}
}


module.exports = Game;


/*

let x = new Set();
x.add(3);
x.add(4);
x.add(5);
x[0];
*/