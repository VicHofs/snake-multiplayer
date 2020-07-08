import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UIfx from 'uifx';
import GameOver from './assets/gameOver.mp3';
import Point from './assets/point.wav';
import Hit from './assets/hit.wav';
import Modal from 'react-modal';
import { useInterval } from './useInterval.js';
import { compass } from './constants.js';
import './InGame.css';

import api from '../../services/api';

const InGame = () => {
	const data = useLocation().state;

	const map = data.map;
	const myColor = data.myColor;
	const gameOverSound = new UIfx(GameOver);
	const pointSound = new UIfx(Point);
	const hitSound = new UIfx(Hit);
	const canvasRef = useRef();
	const [modalOpen, setModalOpen] = useState(true);
	const [gameOverModal, setGameOverModal] = useState(false);
	const [snakes, setSnakes] = useState([]);
	const [snake, setSnake] = useState(data.myPosition);
	const [apple, setApple] = useState([-1, -1]);
	const [momentum, setMomentum] = useState(
		compass[Object.keys(compass)[(8 * Math.random()) << 0]]
	);
	const [syncMomentum, setSyncMomentum] = useState(momentum);
	const [snakeSpeed, setSnakeSpeed] = useState(null);
	const [gameOver, setGameOver] = useState(false);
	const [searching, setSearching] = useState(true);
	const [running, setRunning] = useState(false);

	useEffect(() => {
		api.get('apple').then((response) => setApple(response.data));
	});

	useEffect(() => {
		api.get('snakes').then((response) => {
			setSnakes(response.data);
			for (const player of snakes) {
				if (player.color === myColor) setSnake(player);
				break;
			}
		});
	});

	useEffect(() => {
		const context = canvasRef.current.getContext('2d');
		context.setTransform(map.scale, 0, 0, map.scale, 0, 0);
	});

	const startGame = () => {
		setGameOver(false);
		setRunning(false);
		setSearching(10000000);
		setSnakeSpeed(100);
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
		setSearching(1000);
		setSnakeSpeed(null);
		setGameOver(true);
	};

	const wrapAdjust = (value, index) => {
		if (value >= map.size[index] / map.scale) return 0;
		else if (value < 0) return map.size[index] / map.scale - 1;
		else return value;
	};

	// const spawnApple = () =>
	// 	apple.map((_, i) => Math.floor((Math.random() * map.size[i]) / map.scale));

	const checkCollision = (head, snek = snake) => {
		for (const segment of snek) {
			if (head[0] === segment[0] && head[1] === segment[1]) return true;
		}
		return false;
	};

	const checkAppleCollision = (snek, index) => {
		if (snek[0][0] === apple[0] && snek[0][1] === apple[1]) {
			pointSound.play();
			api.put(`snakes/points/${index}`, 1);
			api.put('apple').then((response) => setApple(response.data));
			return true;
		}
		return false;
	};

	const gameOn = () => {
		setSyncMomentum(momentum);
		let i = 0;
		for (const player of snakes) {
			if (player.color === myColor) {
				const snakeCopy = JSON.parse(JSON.stringify(player.position));
				const newSnakeHead = [
					wrapAdjust(snakeCopy[0][0] + syncMomentum[0], 0),
					wrapAdjust(snakeCopy[0][1] + syncMomentum[1], 1),
				];
				snakeCopy.unshift(newSnakeHead);
				if (checkCollision(newSnakeHead)) endGame();
				if (!checkAppleCollision(snakeCopy, i)) snakeCopy.pop();
				setSnake(snakeCopy);
				api.put(`snakes/position/${i}`, snakeCopy);
				break;
			}
			i++;
		}
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
		context.clearRect(0, 0, map.size[0], map.size[1]);
		context.fillStyle = '#ff353a';
		context.fillRect(apple[0], apple[1], 1, 1);
		api.get('snakes').then((response) => {
			for (const player of response.data) {
				context.fillStyle = player.color;
				player.position.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
			}
		});
	}, [snake, apple, gameOver, map, myColor, snakes]);

	useInterval(() => {
		if (searching) {
			api.get('running').then((response) => setRunning(response.data));
			if (running === true) {
				startGame();
				setSearching(false);
			}
		}
	}, searching);

	useInterval(() => {
		if (running) {
			api.get('snakes').then((response) => {
				setSnakes(response.data);
				gameOn();
			});
		}
	}, snakeSpeed);

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
			<h1 className="mainTitle">Snake Multiplayer</h1>
			<div>
				<canvas
					className="map"
					ref={canvasRef}
					width={`${map.size[0]}px`}
					height={`${map.size[1]}px`}
				/>
				<ul className="pointList">
					{snakes.map((snake) => (
						<li className="pointItem" style={{ color: snake.color }}>
							{snake.points}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default InGame;
