import Game from './game.js'

import bb_3x3 from './bb_3x3.js'
import bb_4x4 from './bb_4x4.js'
import bb_5x5 from './bb_5x5.js'
import bb_4x3 from './bb_4x3.js'
import bb_3x4 from './bb_4x4.js'
export default class Skynet {
	constructor(board, badBoards = [], computerMode = 'train') {
		this.board = board
		this.bbs = [, , , [[], [], [], bb_3x3, bb_3x4], [[], [], [], bb_4x3, bb_4x4], [[], [], [], [], [], bb_5x5, [], []], [[], [], [], [], [], , , , , ,], [, , , , , , , ,], , , , , ,] //sorry
		this.position = this.board.position
		this.badBoards = badBoards
		this.lastBoard = this.position.map(x => [...x]);
		this.computerMode = computerMode;
		this.bb = this.bbs[this.board.width][this.board.height]
	}
	txtToArr(txt) {
		let arr = Array(this.board.height).fill([]).map(x => [...x])
		let flatArr = txt.split(",")
		for (let i = 0; i < this.board.height; i++) {
			for (let j = 0; j < this.board.width; j++) {
				arr[i][j] = flatArr[this.board.height * i + j]
			}
		}
		return arr
	}
	makeMove(move, pos = this.position.map(x => [...x])) {
		// if (!Game.validMove(move, pos, side)) {
		// return pos
		// }
		let tempBoard = pos.map(x => [...x])
		tempBoard[move.y2][move.x2] = pos[move.y1][move.x1]
		tempBoard[move.y1][move.x1] = '+'
		return tempBoard
	}
	isBadMove(move, pos = this.position.map(x => [...x])) {
		if (this.computerMode == 'pretrained') {
			return this.bb.includes(this.makeMove(move, pos).toString());
		} else { return this.badBoards.includes(this.makeMove(move, pos).toString()); }
		//if mode was minimax we wouldn't be in this function, so else means train-as-you-play
	}
	allValidMoves(pos = this.position, side) {
		let validMoves = [];
		for (let i = 0; i < pos.length; i++) {
			for (let j = 0; j < pos[0].length; j++) {
				if (pos[i][j] == '+') continue;
				for (let k = 0; k < pos.length; k++) {
					for (let l = 0; l < pos[0].length; l++) {
						if (Game.validMove({
							x1: j, y1: i, x2: l, y2: k
						}, pos, side, false)) validMoves.push({
							x1: j, y1: i, x2: l, y2: k
						} /*[[i, j], [k, l]]*/)
					}
				}
			}
		}
		return validMoves;
	}
	evalPosForMinimax(pos, side) {
		let piecesSum = 0;
		for (let i = 0; i < pos.length; i++) {
			piecesSum -= pos[i].filter(x=>x==='T').length * i
			piecesSum += pos[i].filter(x=>x==='B').length * (pos.length - i)
		}
		return piecesSum
	}
	minimax(pos = this.board.position, side, depth = 20, a = -Infinity, b = Infinity) {
		pos = pos.map(x => [...x])
		// console.log('depth', depth, 'side', side)
		// this.board.printBoard(pos)
		if (Game.isGameOver(pos, side)) {
			return { value: (side == 'T' ? Infinity : -Infinity), move: null };
		}
		if (depth === 0) {
			return { value: this.evalPosForMinimax(pos,side), move: null };
		}
		let validMoves = this.allValidMoves(pos, side)
		let possiblePos = validMoves.map(move => this.makeMove(move, pos));
		// console.log(pos, side, possiblePos)
		let currentBest = validMoves[0]
		if (side == 'B') { //maxi
			let currentMax = -Infinity;
			for (let i = 0; i < possiblePos.length; i++) {
				let value = this.minimax(possiblePos[i], 'T', depth - 1, a, b).value;
				if (value > currentMax) currentBest = validMoves[i];
				currentMax = Math.max(currentMax, value);
				a = Math.max(value, a);
				if (a >= b) { break; }
			}
			// console.log({side:side, pos:pos, value: currentMax, move: currentBest })
			return { value: currentMax, move: currentBest };
		} else { //mini
			let currentMin = Infinity;
			for (let i = 0; i < possiblePos.length; i++) {
				let value = this.minimax(possiblePos[i], 'B', depth - 1, a, b).value;
				if (value < currentMin) currentBest = validMoves[i];
				currentMin = Math.min(currentMin, value);
				b = Math.min(value, b);
				if (a >= b) { break; }
			}
			// console.log({side:side, pos:pos, value: currentMin, move: currentBest })
			return { value: currentMin, move: currentBest };
		}
	}
	computerMove() {
		// console.log('mode', this.computerMode)
		if (this.computerMode !== 'minimax') {
			// console.log(this.computerMode)
			let availableMoves = this.allValidMoves(this.position, 'T').filter(x => !this.isBadMove(x))
			if (availableMoves.length == 0) {
				this.badBoards.push(this.lastBoard.toString());
				availableMoves.push(this.allValidMoves(this.position, 'T')[Math.floor(Math.random() * this.allValidMoves(this.position, 'T').length)])
			}
			let computersMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
			if (computersMove) return computersMove
			return
		} else {
			let result = this.minimax(this.board.position, 'T',10)
			// console.log(result)
			return result.move
		}
	}
	handleLoss() {
		if (this.computerMode !== 'minimax') {
			this.badBoards.push(this.lastBoard.toString())
			this.badBoards.forEach(b => this.board.printBoard(this.txtToArr(b)))
		}
	}
}