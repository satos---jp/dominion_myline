const Items = require('./items');
const Utils = require('./utils');

class Game{
	constructor(players){
		//init game state
		this.players = players;
		this.items = new Items(players.length);
		const pnum = this.players.length;
		for(let i=0;i<pnum;i++){
			const p = this.players[i];
			p.initFields(this.items);
			p.selfLog(pnum + '人ゲームを開始します');
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
		
		const points = this.players.map((p,idx)=>{
			return {idx:idx, vp:p.calcVP()};
		}).sort((a,b)=>{
			return b.vp - a.vp;
		});
		this.players.forEach((p,idx)=>{
			p.selfLog(
				'ゲームが終了しました\n' + 
				'結果\n' + 
				points.map((d,idx)=>{
					return (idx+1) + '位 :: ' + 'Player ' + d.idx + ' , ' + d.vp + ' pt';
				}).join('\n')
			);
		});
		
		return {finished: true};
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
