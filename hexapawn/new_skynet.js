import Game from './game.js'

import bb_3x3 from './bb_3x3.js'
import bb_4x4 from './bb_4x4.js'
export default class Skynet {
	constructor(board, badBoards = [], PTBB=false) {
		this.board = board
		this.bbs = [,,,[,,,bb_3x3],[,,,,bb_4x4],[[],[],[],[],[],[],[],[]],[[],[],[],[],[],,,,,,],[,,,,,,,,],,,,,,] //sorry
		this.position = this.board.position
		this.badBoards = badBoards
		this.lastBoard = this.position.map(x => [...x]);
		this.preTrained = PTBB;
		this.bb = this.bbs[this.board.width][this.board.height]
		// console.log(this.txtToArr('1,2,3,4,5,6,7,8,9'))
	}
	togglePreTrained() {
		this.preTrained = !this.preTrained
		console.log('toggle', 'pretrained: ' + this.preTrained);
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
		//console.log('entered makeMove')
		if (!Game.validMove(move, pos, 'T')) {
			// console.log('invalid move')
			return pos
		}
		//console.log('making move ' + move)
		let tempBoard = pos.map(x => [...x])
		tempBoard[move.y2][move.x2] = pos[move.y1][move.x1]
		tempBoard[move.y1][move.x1] = '+'
		return tempBoard
	}
	isBadMove(move, pos = this.position.map(x => [...x])) {
		// console.log('IBM', move)
		// console.log('pos')
		// this.board.printBoard(pos)
		// console.log('result')
		// this.board.printBoard(this.txtToArr((this.makeMove(move, pos).toString())))
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
		// console.log('valid moves: ', validMoves)
		return validMoves;
	}
	computerMove() {
		let availableMoves = this.allValidMoves().filter(x => !this.isBadMove(x))
		console.log('numValidMoves: ', this.allValidMoves().length)
		console.log('numAvailMoves: ', availableMoves.length)
		if (availableMoves.length == 0) {
			this.badBoards.push(this.lastBoard.toString());
			availableMoves.push(this.allValidMoves()[Math.floor(Math.random()*this.allValidMoves().length)])
		}
		let computersMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
		// this.lastBoard = this.position.map(x => [...x]);
		// console.log('move')
		if (computersMove) return computersMove
		return
	}
	handleLoss() {
		// console.log('lastboard')
		// this.board.printBoard(this.board.printBoard(this.lastBoard))
		console.log('ptbb includes this?', this.bb.includes(this.lastBoard.toString()))
		this.badBoards.push(this.lastBoard.toString())
		console.log('BadBoards')
		this.badBoards.forEach(b => this.board.printBoard(this.txtToArr(b)))
	}
}

/*
+ T T
+ B +
B + +


+ T +
+ B +
+ + +
	*/

/*
T T +
+ B +
+ + B

+ T +
+ B +
+ + +
*/

/*
+ T +
T B B
+ + +

BadBoards
+ T T
T B +
B + B

	*/