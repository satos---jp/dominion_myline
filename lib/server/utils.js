
function shuffle(arr){
	for(let i=arr.length-1; i>0; i--){
		const p = Math.floor(Math.random()*(i+1));
		const x = arr[p];
		arr[p] = arr[i];
		arr[i] = x;
	}
}
module.exports.shuffle = shuffle;

function removeidx(arr,idx){
	return arr.slice(0,idx).concat(arr.slice(idx+1));
}
module.exports.removeidx = removeidx;

function getOption(type){
	const x = process.argv.findIndex((x)=>{return x === ('--' + type)});
	if(x<0)return {ison: false,nextstr: ''};
	if(x >= process.argv.length-1)return {ison: true,nextstr: ''};
	return {ison: true,nextstr: process.argv[x+1]};
}

module.exports.getOption = getOption;
