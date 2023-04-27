import { HumanPiece, ComputerPiece } from './piece.js'
import Game from './game.js'
export default class Board {
	// side = 'B' //side making current move
	// oppSide = 'T'
	// badBoards = []
	// playing = true
	// lastBoard = this.board;
	//x,y are top left coordinates of board
	//width and height are board dimensions in cells
	constructor(scene, x, y, width, height, cellWidth, cellHeight, color) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.cellWidth = cellWidth;
		this.cellHeight = cellHeight;
		this.color = color;
		this.grid = scene.add.grid(x, y, width * cellWidth, height * cellHeight, cellWidth, cellHeight, color).setOrigin(0, 0);
		//contains piece objects
		console.log('from board',Array(this.height))
		this.pieces = Array(this.height).fill(Array(this.width).fill('+')).map(x => x.map(x => x));
		console.log(this.pieces)
		//board representation
		this.position = Array(this.height).fill(Array(this.width).fill('+')).map(x => x.map(x => x));
		//console.log(this.gridToPixel(2,1))
		Game.setup(this);
		// console.log(-0.5, this.position)
	}
	placePieceAt(x, y, type) {
		console.log(...arguments)
		console.log(this.pieces)
		this.pieces[y][x] = type == 'human' ? new HumanPiece(this, x, y, 0xff0000) : new ComputerPiece(this, x, y, 0xffff00)
		this.position[y][x] = (type == 'human' ? 'B' : 'T')
	}
	movePiece(x1, y1, x2, y2) {
		// console.log(5)
		// console.log('before: ', this.position)
		//piece is captured
		this.pieces[y1][x1].move(x2, y2).then(() => {
			let origSide = this.position[y1][x1]
			if (this.pieces[y2][x2] !== '+') this.pieces[y2][x2].selfDestruct();
			this.pieces[y2][x2] = this.pieces[y1][x1]
			this.pieces[y1][x1] = '+'
			this.position[y2][x2] = this.position[y1][x1]
			this.position[y1][x1] = '+'
			// console.log('after: ', this.position)
			// this.printBoard()
			if (origSide == 'B') this.scene.events.emit('HumanMove')
			// console.log(4)
		});
	}
	printBoard(pos = this.position) {
		// console.log('pos ', pos)
		console.log(pos.map(arr => arr.join(' ')).join('\n'))
	}
	selfDestruct() {
		this.pieces.forEach(x => {
			x.forEach(y => {
				//todo
				if (y !== '+') {
					y.piece.destroy()
					y.selfDestruct()
				}
			})
		})
		this.grid.destroy()
		delete this
	}
	setInteractivePieces(value) {
		this.pieces.forEach((x) => {
			x.forEach((y) => {
				//todo
				if (y.piece?.input) {
					this.scene.input.setDraggable(y.piece, value)
				}
			})
		})
	}
}