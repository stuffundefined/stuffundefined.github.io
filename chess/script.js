import { Chess } from './js/chess.js'
import { minimax, count, pruned } from './js/engine.js'
import { getMove } from './js/alphamove.js'
const chess = new Chess()
chess.pieceCount = 32;
let depth = 4;
const potato = new Audio('potato.wav')
const otatop = new Audio('otatop.wav')

function handleGameOver() {
	if (chess.isStalemate()) {
		document.getElementById('status').innerText = 'game drawn by stalemate'
	} else if (chess.isThreefoldRepetition()) {
		document.getElementById('status').innerText = 'game drawn by threefold repetition'
	} else if (chess.isInsufficientMaterial()) {
		document.getElementById('status').innerText = 'game drawn by insufficient material'
	} else if (chess.isDraw()) { // 50 move rule
		document.getElementById('status').innerText = 'game drawn by fifty move rule'
	} else {
		document.getElementById('status').innerText = `${chess.turn() == 'w' ? 'black' : 'white'} won by checkmate`
	}
}

function computerMove() {
	let startTime = Date.now()
	let choice = document.getElementById('alphamove').checked ? getMove(chess) : minimax(chess, depth, -Infinity, Infinity, true)
	let endTime = Date.now()
	console.log(choice.move)
	chess.move(choice.move)
	otatop.load()
	otatop.play()
	if(!document.getElementById('alphamove').checked && (choice.move.flags.includes('e') || choice.move.flags.includes('c'))) {
		chess.pieceCount--;
	}
	document.getElementById('status').innerText = 'your move'
	if (chess.isGameOver()) {
		handleGameOver()
	}
	console.log(choice)
	if (document.getElementById('alphamove').checked) {
		console.log(`move: ${choice.move}\ntime: ${(endTime - startTime) / 1000}sec`)
	} else{ 
		console.log(`move: ${choice.move.san}\nscore: ${choice.score}\npositions: ${count}\npruned: ${pruned}\ntime: ${(endTime - startTime) / 1000}sec\nrate: ${Math.round(100000 * count / (endTime - startTime)) / 100}/sec\npieces: ${chess.pieceCount}`)
	}
	document.getElementById('eval').innerText = choice.score
	board.position(chess.fen(), false)
	document.getElementById('pgn').innerText = chess.pgn()
}
function onDrop(source, target, piece, newPos, oldPos, orientation) {
	window.setTimeout(onChange, 250) // things look weird if we run it immediately
	try {
		chess.move({ from: source, to: target })
		document.getElementById('pgn').innerText = chess.pgn()
		potato.load()
		potato.play()
		board.position(chess.fen(), false)
		document.getElementById('status').innerText = 'engine is thinking...'
		document.getElementById('eval').innerText = 'engine is thinking...'
	} catch (e) {
		if (chess.moves({ verbose: true }).some(x => x.from == source && x.to == target)) {
			// if the source-target pair is in the move list,
			// but threw an invalid move error,
			// that move is a promotion
			let newPiece = prompt('Promote to Queen, Rook, Bishop, or kNight.\nAnything else cancels move', 'Q').toLowerCase()
			if (['q', 'r', 'b', 'n'].includes(newPiece)) {
				document.getElementById('status').innerText = 'engine is thinking...'
				document.getElementById('eval').innerText = 'engine is thinking...'
				chess.move({ from: source, to: target, promotion: newPiece })
				document.getElementById('pgn').innerText = chess.pgn()
				board.position(chess.fen(), false)
				return 'trash'
			}
		}
		return 'snapback'
	}

}
function onChange() {
	// e = en passant capture; c = non en passant capture (n for non capture does not show up reliably)
	if (chess.history({ verbose: true })[chess.history({ verbose: true }).length - 1].color == board.orientation()[0]) {
		console.log('got move', chess.history()[chess.history().length-1])
		if (chess.isGameOver()) {
			handleGameOver()
		} else {
			if(chess.history({verbose:true})[chess.history().length-1].flags.includes('e') || chess.history({verbose:true})[chess.history().length-1].flags.includes('c')) {
				chess.pieceCount--;
			}
			computerMove()
		}
	}
}
function handleLoadButton() {
	let fen = document.getElementById('fen').value
	chess.load(fen)
	chess.pieceCount = chess.board().flat().filter(x=>!!x).length;
	board.position(fen,false)
	board.orientation(fen.split(' ')[1]=='w'?'white':'black')
	document.getElementById('pgn').innerText = chess.pgn()
	document.getElementById('status').innerText = 'your move'
	document.getElementById('eval').innerText = 'make a move...'
	document.getElementById('fen').value = '';
}

var board = Chessboard('myBoard', {
	draggable: true,
	position: 'start',
	onDrop
})
document.getElementById('fen').value = '';
document.getElementById('loadbutton').addEventListener('click',()=>{
	handleLoadButton()
})
document.getElementById('fen').addEventListener('change',()=>{
	handleLoadButton()
})
document.getElementById('reset').addEventListener('click',()=>{
	chess.reset()
	chess.pieceCount = 32;
	board.orientation('white')
	board.start(false)
	document.getElementById('status').innerText = 'your move'
	document.getElementById('eval').innerText = 'engine is thinking...'
	document.getElementById('pgn').innerText = chess.pgn()
})
document.getElementById('switch').addEventListener('click',()=>{
	board.flip()
	if(!chess.isGameOver()) {
		document.getElementById('status').innerText = 'engine is calculating...'
		document.getElementById('eval').innerText = 'engine is thinking...'
		computerMove()
	}
})
document.getElementById('depth').addEventListener('input',e=>{
	depth = e.target.value
	document.getElementById('depth-reading').innerText = e.target.value;
})
document.getElementById('alphamove').addEventListener('change',e=>{
	console.log(e.target)
	document.getElementById('depth').disabled = e.target.checked;
})