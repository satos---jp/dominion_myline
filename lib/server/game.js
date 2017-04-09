const Items = require('./items');
const Utils = require('./utils');

class Game{
	constructor(players){
		//init game state
		this.players = players;
		this.items = new Items();
		for(let i=0;i<this.players.length;i++){
			const p = this.players[i];
			p.initFields(this.items);
			//p.socket.emit('i am player ' + i);
		}
		this.playeridx = 0;
	}
	
	*run(){
		for(;;){
			this.log('Play player ' + this.playeridx);
			const player = this.players[this.playeridx];
			const others = Utils.removeidx(this.players,this.playeridx);
			yield* player.play(others);
			
			this.playeridx = (this.playeridx+1) % this.players.length;
			
			if(this.isfinish()){
				this.log("試合終了");
				break;
			}
		}
	}
	
	isfinish(){
		return this.items.soldout();
	}
	
	error(str){
		console.error("Game error :: " + str);
	}
	log(str){
		console.log("Game log :: " + str);
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
