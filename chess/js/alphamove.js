import { Chess } from './chess.js'

export function getMove(chessObj) {
	if (chessObj.isGameOver()) {
		return {score: 'AlphaMove doesn\'t care :)', move: 'AAAA'}
	}
	let possibleMoves = chessObj.moves()
    possibleMoves.sort((a,b) => parseInt(a.toLowerCase().padEnd(7,' ').split('').map(x=>x.charCodeAt(0).toString().padStart(3,0)).join('')) - parseInt(b.toLowerCase().padEnd(7,'0').split('').map(x=>x.charCodeAt(0).toString().padStart(3,0)).join('').padEnd(7, ' ')))
	console.log(possibleMoves)
	console.log(possibleMoves[0])
	console.log(possibleMoves[0].toLowerCase().padEnd(7,'0').split('').map(x=>x.charCodeAt(0).toString().padStart(3,0)).join(''))
	return {score: 'AlphaMove doesn\'t care :)', move: possibleMoves[Math.floor(possibleMoves.length/2)]} 
}