import Game from './game.js'
class Piece {
	constructor(board, x, y, color) {
		this.board = board
		this.x = x
		this.y = y
		this.color = color
		this.pixX = this.gridToPixel(x, y).x
		this.pixY = this.gridToPixel(x, y).y
		this.piece = board.scene.add.circle(this.pixX, this.pixY, 0.35 * board.cellWidth, this.color);
	}
	pixelToGrid(x, y) {
		return {
			x: Phaser.Math.Snap.To(x, this.board.cellWidth, this.board.cellWidth / 2, true) - 0.5,
			y: Phaser.Math.Snap.To(y, this.board.cellHeight, this.board.cellHeight / 2, true) - 0.5
		}
	}
	gridToPixel(x, y) {
		return {
			x: (x + 0.5) * this.board.cellWidth,
			y: (y + 0.5) * this.board.cellHeight
		}
	}
	async move(x, y) {
		this.board.setInteractivePieces(false)
		let promise = new Promise(resolve => {
			let toX = this.gridToPixel(x, y).x
			let toY = this.gridToPixel(x, y).y
			this.board.scene.tweens.add({
				targets: this.piece,
				x: toX,
				y: toY,
				ease: 'Quad.easeInOut',
				duration: 250,
				onStart: () => {
					this.piece.setDepth(1)
				},
				onComplete: () => {
					this.x = this.pixelToGrid(this.piece.x, 0).x
					this.y = this.pixelToGrid(0, this.piece.y).y
					this.pixX = this.piece.x
					this.pixY = this.piece.y
					this.piece.setDepth(0)
					resolve()
				}
			})
		})
		return promise
	}
	selfDestruct() {
		this.board.scene.add.particles(this.constructor.name).createEmitter({
			alpha: { start: 1, end: 0 },
			speed: { min: 25, max: 125 },
			lifespan: 800,
			accelerationY: { min: -50, max: 50 },
			accelerationX: { min: -50, max: 50 }
		}).explode(100, this.pixX, this.pixY)
		this.piece.destroy()
		delete this
	}
}
class HumanPiece extends Piece {
	constructor(board, x, y, color) {
		super(board, x, y, color);
		this.piece.setInteractive()
		board.scene.input.setDraggable(this.piece)
		// console.log('i', this.board.position)
		this.piece.on('dragstart', () => {
			this.oldX = this.x
			this.oldY = this.y
			this.piece.setDepth(1)
		})
		this.piece.on('drag', (pointer, x, y) => {
			this.piece.x = x
			this.piece.y = y
		});

		this.piece.on('dragend', (pointer, x, y) => {
			// console.log(1)
			// this.board.printBoard();
			// console.log(1, this.board.position) //‽‽‽‽‽‽‽
			// this.piece.setDepth(1)
			let newPixX = Phaser.Math.Clamp(Phaser.Math.Snap.To(pointer.x - x, this.board.cellWidth, this.board.cellWidth / 2), this.board.cellWidth / 2, (this.board.width - 0.5) * this.board.cellWidth)
			let newPixY = Phaser.Math.Clamp(Phaser.Math.Snap.To(pointer.y - y, this.board.cellHeight, this.board.cellHeight / 2), this.board.cellHeight / 2, (this.board.height - 0.5) * this.board.cellHeight)
			let newX = this.pixelToGrid(newPixX, 0).x
			let newY = this.pixelToGrid(0, newPixY).y
			// this.oldX = this.x
			// this.oldY = this.y
			// Skynet.prototype.printBoard(this.board.position)
			// console.log(Game.validMove({ x1: 0, x2: 1, y1: 1, y2: 0 }, this.board.position))
			// console.log(2, this.board.position)
			if (Game.validMove({ x1: this.x, x2: newX, y1: this.y, y2: newY }, this.board.position)) {
				// console.log(this.board.pieces)
				// let outerPromise = new Promise(resolve => {
				// console.log(3, this.board.position)
				// this.move(newX, newY).then(() => {
				// console.log(4)
				//console.log(this.oldX, this.oldY, newX, newY)
				this.board.movePiece(this.oldX, this.oldY, newX, newY)
				// console.log(5)
				// })

				// 	resolve(5.5)
				// })
				// console.log(6)

			} else {
				this.move(this.oldX, this.oldY).then(() => {this.board.setInteractivePieces(true)})
			}
		})
		// console.log(-1, this.board.position)
	}
}
class ComputerPiece extends Piece {
	constructor(board, x, y, color) {
		super(board, x, y, color)
	}

}
export {
	HumanPiece,
	ComputerPiece
}