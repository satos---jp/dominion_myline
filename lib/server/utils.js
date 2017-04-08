
function shuffle(arr){
	for(let i=arr.length-1; i>0; i--){
		const p = Math.floor(Math.random()*(i+1));
		const x = arr[p];
		arr[p] = arr[i];
		arr[i] = x;
	}
}


module.exports.shuffle = shuffle;