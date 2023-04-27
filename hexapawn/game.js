import Skynet from './new_skynet.js'
export default class Game {
	constructor() { } //not meant to be used
	static checkStalemate(pos = board) {
		return Skynet.prototype.allValidMoves(pos).length === 0;
	};
	static setup(board) {
		for (let i = 0; i < board.width; i++) {
			board.placePieceAt(i, board.height-1, 'human') //botton pieces
		}
		for (let i = 0; i < board.width; i++) {
			board.placePieceAt(i, 0, 'computer') //top pieces
		}
	}

	static isGameOver(pos) {
		return ((!pos.some(x=>x.some(y=>y=='B'))) || pos[0].includes('B')) || (pos[pos.length - 1].includes('T')) || this.checkStalemate(pos)
	}

	//eg move is {x1: 0, y1: 0, x2: 0, y2: 1}
	static validMove(move, pos, side = 'B', doStalemateCheck = true) {
		let oppSide = side == 'B' ? 'T' : 'B'
		// check if move is out of bounds
		//if (doStalemateCheck) console.log("validating " + move);
		//printBoard()
		if ([move.y1, move.y2].some(y => y >= pos.length)) return false
		//if ([move.y1, move.y2].some(y => y >= pos.length)) return false
		if ([move.x1, move.x2].some(x => x >= pos[0].length)) return false
		if ([move.y1, move.y2, move.x1, move.x2].some(i => i < 0)) return false
		// check if move can be done
		if (doStalemateCheck ? this.isGameOver(pos) : false) return false
		// make sure piece to move belongs to current side
		if (pos[move.y1][move.x1] !== side) return false
		// // if capturing, make sure target piece is opposing side
		// console.log(move)
		if (move.x1 !== move.x2 && pos[move.y2][move.x2] !== oppSide) return false
		//console.log(6, move)// if moving forward, make sure target square is empty
		if (move.x1 == move.x2 && pos[move.y2][move.x2] !== '+') return false
		//console.log(7)// make sure move is one rank forward
		if (move.y2 - move.y1 !== (side == 'B' ? -1 : 1)) return false
		// no diagonal moves ≥ 2 horizontal
		if (Math.abs(move.x2 - move.x1) > 1) return false
		//if (doStalemateCheck) console.log(move + ' is valid');
		return true
	}
}