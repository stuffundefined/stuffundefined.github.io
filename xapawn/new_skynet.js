import Game from './game.js'

import bb_3x3 from './bb_3x3.js'
import bb_4x4 from './bb_4x4.js'
import bb_5x5 from './bb_5x5.js'
import bb_4x3 from './bb_4x3.js'
import bb_3x4 from './bb_4x4.js'
export default class Skynet {
	constructor(board, badBoards = [], PTBB=false) {
		this.board = board
		this.bbs = [,,,[[],[],[],bb_3x3,bb_3x4],[[],[],[],bb_4x3,bb_4x4],[[],[],[],[],[],bb_5x5,[],[]],[[],[],[],[],[],,,,,,],[,,,,,,,,],,,,,,] //sorry
		this.position = this.board.position
		this.badBoards = badBoards
		this.lastBoard = this.position.map(x => [...x]);
		this.preTrained = PTBB;
		this.bb = this.bbs[this.board.width][this.board.height]
	}
	togglePreTrained() {
		this.preTrained = !this.preTrained
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
		if (!Game.validMove(move, pos, 'T')) {
			return pos
		}
		let tempBoard = pos.map(x => [...x])
		tempBoard[move.y2][move.x2] = pos[move.y1][move.x1]
		tempBoard[move.y1][move.x1] = '+'
		return tempBoard
	}
	isBadMove(move, pos = this.position.map(x => [...x])) {
		if(this.preTrained) {return this.bb.includes(this.makeMove(move, pos).toString());
		} else {return this.badBoards.includes(this.makeMove(move, pos).toString());}
	}
	allValidMoves(pos = this.position) {
		let validMoves = [];
		for (let i = 0; i < pos.length; i++) {
			for (let j = 0; j < pos[0].length; j++) {
				if (pos[i][j] == '+') continue;
				for (let k = 0; k < pos.length; k++) {
					for (let l = 0; l < pos[0].length; l++) {
						if (Game.validMove({
							x1: j, y1: i, x2: l, y2: k
						}, pos, 'T', false)) validMoves.push({
							x1: j, y1: i, x2: l, y2: k
						} /*[[i, j], [k, l]]*/)
					}
				}
			}
		}
		return validMoves;
	}
	computerMove() {
		let availableMoves = this.allValidMoves().filter(x => !this.isBadMove(x))
		if (availableMoves.length == 0) {
			this.badBoards.push(this.lastBoard.toString());
			availableMoves.push(this.allValidMoves()[Math.floor(Math.random()*this.allValidMoves().length)])
		}
		let computersMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
		if (computersMove) return computersMove
		return
	}
	handleLoss() {
		this.badBoards.push(this.lastBoard.toString())
		this.badBoards.forEach(b => this.board.printBoard(this.txtToArr(b)))
	}
}