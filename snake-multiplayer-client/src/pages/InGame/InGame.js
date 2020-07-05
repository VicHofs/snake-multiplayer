import React, { useState, useRef, useEffect } from 'react';
import UIfx from 'uifx';
import gameOver from './assets/gameOver.mp3';
import point from './assets/point.wav';
import hit from './assets/hit.wav';
import Modal from 'react-modal';
import { useInterval } from './useInterval.js';
import {
	mapSize,
	snakeSpawnPos,
	appleSpawnPos,
	mapScale,
	speed,
	compass,
} from './initializer.js';
import './InGame.css';

const gameOverSound = new UIfx(gameOver);
const pointSound = new UIfx(point);
const hitSound = new UIfx(hit);

const InGame = () => {
	const canvasRef = useRef();
	const [modalOpen, setModalOpen] = useState(true);
	const [gameOverModal, setGameOverModal] = useState(false);
	const [snake, setSnake] = useState(snakeSpawnPos);
	const [apple, setApple] = useState(appleSpawnPos);
	const [momentum, setMomentum] = useState([0, -1]);
	const [syncMomentum, setSyncMomentum] = useState([0, -1]);
	const [snakeSpeed, setSnakeSpeed] = useState(null);
	const [gameOver, setGameOver] = useState(false);

	useEffect(() => {
		const context = canvasRef.current.getContext('2d');
		context.setTransform(mapScale, 0, 0, mapScale, 0, 0);
	});

	const startGame = () => {
		let newSnake = [
			[
				Math.floor((Math.random() * mapSize[0]) / mapScale),
				Math.floor((Math.random() * mapSize[1]) / mapScale),
			],
		];
		newSnake.push(snakeSpawnPos[0].map((pos, i) => (i === 1 ? pos + 1 : pos)));
		setSnake(newSnake);
		let newApple = [
			Math.floor((Math.random() * mapSize[0]) / mapScale),
			Math.floor((Math.random() * mapSize[1]) / mapScale),
		];
		while (newApple in snakeSpawnPos)
			newApple = [
				Math.floor((Math.random() * mapSize[0]) / mapScale),
				Math.floor((Math.random() * mapSize[1]) / mapScale),
			];
		setApple(newApple);
		setMomentum([0, -1]);
		setSnakeSpeed(speed);
		setGameOver(false);
	};

	const move = (keyCode) => {
		if (keyCode in compass) {
			const newMomentum = compass[keyCode];
			if (
				newMomentum.map(Math.abs)[0] !== momentum.map(Math.abs)[0] &&
				newMomentum.map(Math.abs)[1] !== momentum.map(Math.abs)[1]
			)
				setMomentum(newMomentum);
		} else if (keyCode === 13 || keyCode === 32) startGame();
	};

	const endGame = () => {
		setGameOverModal(true);
		hitSound.play();
		gameOverSound.play();
		setSnakeSpeed(null);
		setGameOver(true);
	};

	const wrapAdjust = (value, index) => {
		if (value >= mapSize[index] / mapScale) return 0;
		else if (value < 0) return mapSize[index] / mapScale - 1;
		else return value;
	};

	const spawnApple = () =>
		apple.map((_, i) => Math.floor((Math.random() * mapSize[i]) / mapScale));

	const checkCollision = (head, snek = snake) => {
		for (const segment of snek) {
			if (head[0] === segment[0] && head[1] === segment[1]) return true;
		}
		return false;
	};

	const checkAppleCollision = (snek) => {
		if (snek[0][0] === apple[0] && snek[0][1] === apple[1]) {
			pointSound.play();
			let newApple = spawnApple();
			while (checkCollision(newApple, snek)) spawnApple();
			setApple(newApple);
			return true;
		}
		return false;
	};

	const gameOn = () => {
		setSyncMomentum(momentum);
		const snakeCopy = JSON.parse(JSON.stringify(snake));
		const newSnakeHead = [
			wrapAdjust(snakeCopy[0][0] + syncMomentum[0], 0),
			wrapAdjust(snakeCopy[0][1] + syncMomentum[1], 1),
		];
		snakeCopy.unshift(newSnakeHead);
		if (checkCollision(newSnakeHead)) endGame();
		if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
		setSnake(snakeCopy);
	};

	useEffect(() => {
		const context = canvasRef.current.getContext('2d');
		context.clearRect(0, 0, mapSize[0], mapSize[1]);
		context.fillStyle = '#ff353a';
		context.fillRect(apple[0], apple[1], 1, 1);
		context.fillStyle = '#00ff40';
		snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
	}, [snake, apple, gameOver]);

	useInterval(() => gameOn(), snakeSpeed);

	const element = document.getElementById('root');

	function openFullscreen() {
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}

	return (
		<div
			className="keyCap"
			role="button"
			tabIndex="-1"
			onKeyDown={(event) => move(event.keyCode)}
		>
			<Modal
				className="gameOverModal"
				overlayClassName="modalOverlay"
				isOpen={gameOverModal}
				onRequestClose={() => setGameOverModal(false)}
			>
				<h1 className="mainTitle">Game Over!</h1>
			</Modal>
			<Modal
				className="modal"
				overlayClassName="modalOverlay"
				isOpen={modalOpen}
				onRequestClose={() => setModalOpen(false)}
			>
				<h2>Would you like to enable fullscreen?</h2>
				<p>(Recommended)</p>
				<button
					onClick={() => {
						setModalOpen(false);
						openFullscreen();
					}}
				>
					Ok
				</button>
			</Modal>
			<h1 className="mainTitle">Classic Snake</h1>
			<canvas
				className="map"
				ref={canvasRef}
				width={`${mapSize[0]}px`}
				height={`${mapSize[1]}px`}
			/>
			<button
				className={!snakeSpeed ? 'startButton' : 'restartButton'}
				onClick={startGame}
			>
				<span>{!snakeSpeed ? 'Start Game ' : 'Restart Game '}</span>
			</button>
		</div>
	);
};

export default InGame;
