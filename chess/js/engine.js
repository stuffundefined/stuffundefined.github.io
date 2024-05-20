import { Chess } from './chess.js'

// if there are this number of pieces or less,
//we're in the endgame
const endgameCutoff = 7;
const files = 'abcdefgh'

let killerMoves = [];

//chess.js stores locations as numbers.
//The first nibble is the rank of the square, counting from the top. (rank 8 = 0000)
//The second nibble is the file, from the left (file a = 0000)
function internalNumToSquare(num, chessObj) {
	return files[chessObj.file(num)]+(8-chessObj.rank(num))
}
function squareDistance(a, b) {//squares in chess.js internal format
	return Math.abs((a>>4)-(b>>4))+Math.abs((a&0xf)-(b&0xf))
}

//from Black's perspective
const psTables = {
	   //  a    b    c    d    e    f    g    h
	b: [[-50, -50, -50, -50, -50, -50, -50, -50], //8
		[-50, -25, -25, -25, -25, -25, -25, -50], //7
		[-50, -25,  25,   0,   0,  25, -25, -50], //6
		[-50, -25,  25,  50,  50,  25, -25, -50], //5
		[-50, -25,  25,  50,  50,  25, -25, -50], //4
		[-50, -25,   0,   0,   0,   0, -25, -50], //3
		[-50, -25, -25, -25, -25, -25, -25, -50], //2
		[-50, -50, -50, -50, -50, -50, -50, -50]],//1
	   //  a    b    c    d    e    f    g    h
	n: [[-50, -25, -25, -25, -25, -25, -25, -50], //8
		[-25,   0,   0,   0,   0,   0,   0, -25], //7
		[-25,   0,  25,  25,  25,  25,   0, -25], //6
		[-25,   0,  25,  50,  50,  25,   0, -25], //5
		[-25,   0,  25,  50,  50,  25,   0, -25], //4
		[-25,   0,  25,  25,  25,  25,   0, -25], //3
		[-25,   0,   0,   0,   0,   0,   0, -25], //2
		[-50, -25, -25, -25, -25, -25, -25, -50]],//1
	   //  a    b    c    d    e    f    g    h
	p: [[999, 999, 999, 999, 999, 999, 999, 999], //8 - black pawns dont go here
		[  0,   0,   0,   0,   0,   0,   0,   0], //7
		[  0,  15,  20,  25,  25,  20,  15,   0], //6
		[  0,  10,  35,  40,  40,  35,  10,   0], //5
		[  0,  20,  40,  40,  40,  40,  20,   0], //4
		[ 25,  50,  50,  50,  50,  50,  50,  25], //3
		[ 50,  75,  75,  75,  75,  75,  75,  50], //2
		[  0,   0,   0,   0,   0,   0,   0,   0]],//1
	   //  a    b    c    d    e    f    g    h
	r: [[  0,   5,   5,   5,   5,   5,   5,   0], //8
		[ -5,  -5,   0,   0,   0,   0,  -5,  -5], //7
		[  0,   0,   0,   0,   0,   0,   0,   0], //6
		[  0,   0,   0,   0,   0,   0,   0,   0], //5
		[  0,   0,   0,   0,   0,   0,   0,   0], //4
		[ 15,  15,  15,  15,  15,  15,  15,  15], //3
		[ 25,  25,  25,  25,  25,  25,  25,  25], //2
		[ 25,  25,  25,  25,  25,  25,  25,  25]],//1
	   //  a    b    c    d    e    f    g    h
	k: [[  3,   3,   5,   3,   3,   3,   5,   3], //8
		[  0,   0,   0,   0,   0,   0,   0,   0], //7
		[  0,   0,   0,   0,   0,   0,   0,   0], //6
		[  0,   0,   0,   0,   0,   0,   0,   0], //5
		[  0,   0,   0,   0,   0,   0,   0,   0], //4
		[  0,   0,   0,   0,   0,   0,   0,   0], //3
		[  0,   0,   0,   0,   0,   0,   0,   0], //2
		[  0,   0,   0,   0,   0,   0,   0,   0]],//1
	   //  a    b    c    d    e    f    g    h
	q: [[ -5,  -5,  -5,  -5,  -5,  -5,  -5,  -5], //8
		[  0,   0,   5,   0,   0,   5,   0,   0], //7
		[  0,   0,   0,   0,   0,   0,   0,   0], //6
		[  0,   0,   0,   0,   0,   0,   0,   0], //5
		[  5,   5,   5,   5,   5,   5,   5,   5], //4
		[  5,   5,   5,   5,   5,   5,   5,   5], //3
		[  5,   5,   5,   5,   5,   5,   5,   5], //2
		[  5,   5,   5,   5,   5,   5,   5,   5]]//1
}
export let count = 0
export let pruned = 0
let adjLetters = {
	a:'bb',
	b:'ac',
	c:'bd',
	d:'ce',
	e:'df',
	f:'eg',
	g:'fh',
	h:'gg'
}

let pieceValues = {
	p: 100,
	b: 300,
	n: 300,
	r: 500,
	q: 900,
	k: Infinity
}

function sortMoves(moves, chessObj) {
	let scoreMove = move => {
		let score = 0
		// squares one rank ahead of and in the file adjacent to the destination square
		// i.e. if the piece being moved was a pawn, these would be where it can attack
		let square1 = chessObj.get(
			adjLetters[move.to[0]][0] +
			(parseInt(move.to[1]) + (chessObj.turn() == 'w'?1:-1))
		)
		let square2 = chessObj.get(
			adjLetters[move.to[0]][1] +
			(parseInt(move.to[1]) + (chessObj.turn() == 'w'?1:-1))
		)
		if (move.promotion) {
			score += pieceValues[move.promotion]
		}
		if (move.captured) {
			score += 10*pieceValues[move.captured] - pieceValues[move.piece];
		}
		if((square1.type == 'p' && square1.color != chessObj.turn()) || (square2.type == 'p' && square2.color != chessObj.turn())) {
		// hanging a piece in front of a pawn?
			score -= pieceValues[move.piece]
		}

		if(killerMoves[chessObj._halfMoves]?.has(move.san)) {
			score += 300;
		}
		return score
	}
	let sorted = moves.toSorted((a,b)=>{
		return scoreMove(b)-scoreMove(a)
	})
	return sorted
}

function evalPos(chessObj, depth/*for debug*/) { //evaluate a position without recursion, for presorting and when we're at the depth limit
	count++
	if (chessObj.isGameOver()) {
		if (chessObj.isCheckmate()) {
			return chessObj.turn() == 'b' ? 9999999999999 : -9999999999999
		} else {
			return 0
		}
	}
	let board = chessObj.board()
	let wScore = 0
	let bScore = 0
	for (let x = 0; x < board.length; x++) {
		for (let y = 0; y < board[x].length; y++) {
			if (board[x][y] == null) {
				continue
			}
			if (board[x][y].color == 'w') {
				switch (board[x][y].type) {
					case 'k':
						wScore += psTables.k[7-x][7-y]
						break;
					case 'q':
						wScore += psTables.q[7-x][7-y]
						wScore += pieceValues.q;
						break;
					case 'r':
						wScore += psTables.r[7-x][7-y]
						wScore += pieceValues.r;
						break;
					case 'n':
						wScore += pieceValues.n;
						wScore += psTables.n[7-x][7-y]
						break;
					case 'b':
						wScore += pieceValues.b;
						wScore += psTables.b[7-x][7-y]
						break;
					case 'p':
						wScore += pieceValues.p;
						wScore += psTables.p[7-x][7-y]
						break;
				}
			} else {
				switch (board[x][y].type) {
					case 'k':
						bScore += psTables.k[x][y]
						break;
					case 'q':
						bScore += psTables.q[x][y]
						bScore += pieceValues.q;
						break;
					case 'r':
						bScore += psTables.r[x][y]
						bScore += pieceValues.r;
						break;
					case 'n':
						bScore += pieceValues.n;
						bScore += psTables.n[x][y]
						break;
					case 'b':
						bScore += pieceValues.b;
						bScore += psTables.b[x][y]
						break;
					case 'p':
						bScore += pieceValues.p;
						bScore += psTables.p[x][y]
						break;
				}
			}
		}
	}
	if (chessObj.inCheck()) {
		if (chessObj.turn == 'w') {
			wScore -= 4
		} else {
			bScore -= 4
		}
	}
	if(chessObj.pieceCount <= endgameCutoff) {
		let currentKing = chessObj._kings[chessObj.turn()]
		let opposingKing = chessObj._kings[chessObj.turn()=='w'?'b':'w']
		if(chessObj.turn() == 'w') {
			wScore += 35-5*(squareDistance(currentKing,opposingKing));//distance between kings
			//distance from opposing king to corner
			wScore += 10*Math.min(squareDistance(51,opposingKing),squareDistance(52,opposingKing),squareDistance(67,opposingKing),squareDistance(68,opposingKing))
		} else {
			bScore += 35-5*(squareDistance(currentKing,opposingKing));//distance between kings
			bScore += 10*Math.min(squareDistance(51,opposingKing),squareDistance(52,opposingKing),squareDistance(67,opposingKing),squareDistance(68,opposingKing))
		}
	}
	return wScore - bScore
}

export function minimax(chessObj, depth, a = -Infinity, b = Infinity, resetCount = false) {
	if(resetCount) {count=0;pruned=0}
	if (chessObj.isGameOver()) {
		if (chessObj.isCheckmate()) {
			return {score: chessObj.turn() == 'b' ? 9999999999999 : -9999999999999, move: 'AAAA'}
		} else {
			return {score: 0, move: 'AAAA'}
		}
	}
	if (depth === 0) {
		return {score: evalPos(chessObj, 0), move: 'AAAA'}
	}
	let possibleMoves = chessObj.moves({verbose:true})
	possibleMoves=sortMoves(possibleMoves, chessObj)
	let currentBestMove;
	if (chessObj.turn() == 'w') { //maxi
		let currentMax = -Infinity;
		for (let i = 0; i < possibleMoves.length; i++) {
			let move = possibleMoves[i]
			// e = en passant capture; c = non en passant capture (n for non capture does not show up reliably)
			if(move.flags.includes('e') || move.flags.includes('c')) {
				chessObj.pieceCount--
			}
			chessObj.move(move)
			let value = minimax(chessObj, depth - 1, a, b).score
			if (value > currentMax) {
				currentMax = value
				currentBestMove = move
			}
			a = Math.max(value, a)
			let undoneMove = chessObj.undo()
			if(undoneMove.flags.includes('e') || undoneMove.flags.includes('c')) {
				chessObj.pieceCount++
			}
			if (a >= b) {
				pruned++;
				if (!move.captured && !move.promotion) {
					let ply = chessObj.history().length;
					if(!killerMoves[ply]) {killerMoves[ply] = new Set()}
					killerMoves[ply].add(move.san);
				}
				break;
			}
		}
		//solves the problem of the engine procrastinating and not delivering mate in 1
		//when opponent has no way to evade mate
		if(currentMax > 1000000) {//this could only happen if we have a mate in n
			currentMax--;
		}
		return {score: currentMax, move: currentBestMove};
	} else { //mini
		let currentMin = Infinity;
		for (let i = 0; i < possibleMoves.length; i++) {
			let move = possibleMoves[i]
			// e = en passant capture; c = non en passant capture (n for non capture does not show up reliably)
			if(move.flags.includes('e') || move.flags.includes('c')) {
				chessObj.pieceCount--
			}
			chessObj.move(move)
			let value = minimax(chessObj, depth - 1, a, b).score
			if (value < currentMin) {
				currentMin = value
				currentBestMove = move
			}
			b = Math.min(value, b)
			// e = en passant capture; c = non en passant capture (n for non capture does not show up reliably)
			let undoneMove = chessObj.undo()
			if(undoneMove.flags.includes('e') || undoneMove.flags.includes('c')) {
				chessObj.pieceCount++
			}
			if (a >= b) {
				pruned++;
				if (!move.captured && !move.promotion) {
					let ply = chessObj.history().length;
					if(!killerMoves[ply]) {killerMoves[ply] = new Set()}
					killerMoves[ply].add(move.san);
				}
				break;
			}
		}
		if(currentMin < -1000000) {
			currentMin++;
		}
		return {score: currentMin, move: currentBestMove}
	}
}