import Board from './board.js'
import Skynet from './new_skynet.js'
import Game from './game.js'

let config = {
	type: Phaser.AUTO,
	width: 1600,
	height: 1600,
	backgroundColor: '#ffffff',
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	dom: {createContainer: true},
	parent: 'game'
};
let humanScore = 0;
let computerScore = 0;
let ourSkynet = '+'
var game = new Phaser.Game(config);
let dims = [3,3]
let gui = {}

function preload() {
	this.load.image('ComputerPiece', './ComputerPiece.png');
	this.load.image('HumanPiece', './HumanPiece.png')
}
function create() {
	let boardSelector = document.getElementById('boardselect')
	boardSelector.addEventListener('change', (event) =>{
		dims = event.target.value.split(',').map(x => Number(x))
		console.log(Phaser.Scale.resize)
		this.events.emit('GameOver')
	})
	let board
	function startGame(scene, w,h) {
		board = new Board(scene, 0, 0, w, h, 100, 100, 0xd4aa80)
		ourSkynet = new Skynet(board, typeof ourSkynet.badBoards == 'undefined' ? [] : ourSkynet.badBoards, ourSkynet.preTrained)
		gui = setupGUI(scene)
	}
	function updateScoreDisplay() {
		gui.scoreDisplay.setText(`human ${humanScore} - ${computerScore} computer`)
	}
	let badBoards = []
	startGame(this, ...dims)
	function setupGUI(scene) {
		let skipMoveButton = scene.add.rectangle(151, board.height * 100 + 55, 150, 45, 0x0082FF)
		skipMoveButton.text = scene.add.text(151, board.height * 100 + 55, 'let computer go first', { color: 'white', fixedWidth: 150, fontSize: 19, align: 'center', wordWrap: { width: 150 } });
		skipMoveButton.setOrigin(0, 0);
		skipMoveButton.setInteractive();
		skipMoveButton.on('pointerup', () => {
			scene.events.emit('HumanMove')
			skipMoveButton.fillColor = 0x888888
			skipMoveButton.disableInteractive()
		})
		skipMoveButton.setInteractive()
		let preTrainedToggle = scene.add.rectangle(0, board.height * 100 + 55, 150, 45, 0x0082FF)
		preTrainedToggle.text = scene.add.text(0, board.height * 100 + 55, 'pre-trained mode: off', { color: 'white', fixedWidth: 150, fontSize: 20, align: 'center', wordWrap: { width: 150 } });
		preTrainedToggle.setOrigin(0, 0);
		preTrainedToggle.setInteractive();
		preTrainedToggle.on('pointerup', () => {
			ourSkynet.togglePreTrained()
			preTrainedToggle.text.setText('pre-trained mode: ' + (ourSkynet.preTrained ? 'on' : 'off'))
		})
		let humanMoveText = scene.add.text(0, board.height * 100 + 24, 'your move!', { color: 'red', align: 'right', fixedWidth: 300, fontSize: 24 });
		let scoreDisplay = scene.add.text(0, board.height * 100, `human ${humanScore} - ${computerScore} computer`, { color: 'black', align: 'right', fixedWidth: 300, fontSize: 24 });
		scoreDisplay.setDepth(1)
		return {skipMoveButton, preTrainedToggle, humanMoveText, scoreDisplay}
	}
	this.events.on('HumanMove', () => {
		gui.skipMoveButton.disableInteractive()
		gui.skipMoveButton.fillColor = 0x888888
		gui.humanMoveText.setVisible(false);
		let move = ourSkynet.computerMove() //aaa
		if (move && !Game.isGameOver(board.position)) {
			board.movePiece(move.x1, move.y1, move.x2, move.y2)
			setTimeout(() => {
				gui.humanMoveText.setVisible(false);
				ourSkynet.lastBoard = board.position.map(x => [...x]);
				if (Game.isGameOver(board.position)) {
					computerScore++
					this.text = this.add.text(0, 142, 'You lose!', { color: 'yellow', align: 'center', fixedWidth: 300, strokeThickness: 2, stroke: 'black' });
					updateScoreDisplay()
					this.events.emit('GameOver')
				} else { gui.humanMoveText.setVisible(true); }
				board.setInteractivePieces(true)
			}, 300)
		} else {
			ourSkynet.handleLoss()
			humanScore++
			this.text = this.add.text(0, 142, 'You win!', { color: 'red', align: 'center', fixedWidth: 300, strokeThickness: 2, stroke: 'black' });
			updateScoreDisplay()
			this.events.emit('GameOver')
			board.setInteractivePieces(true)
		}
	})
	this.events.on('GameOver', () => {
		setTimeout(() => {
			this.text?.destroy()
			this.text = this.add.text(0, 142, 'Restarting game...', { color: 'black', align: 'center', fixedWidth: 300, strokeThickness: 2, stroke: 'black' });
			setTimeout(() => {
				delete globalThis.skynet
				board.selfDestruct()
				this.text.destroy()
				Object.values(gui).forEach(x=>x.destroy())
				startGame(this, ...dims)
			}, 1000)
		}, 1000)
	})
}
function update() {
}