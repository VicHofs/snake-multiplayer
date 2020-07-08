import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CirclePicker } from 'react-color';
import './Home.css';
import { useInterval } from '../InGame/useInterval';

import api from '../../services/api';

const Home = () => {
	const [colors, setColors] = useState();
	const [map, setMap] = useState();
	const [myColor, setMyColor] = useState('lightgrey');

	const history = useHistory();
	// const goBack = () => history.goBack();
	const toGame = (newPos) =>
		history.push({
			pathname: '/in-game',
			state: { map: map, myPosition: newPos, myColor: myColor },
		});

	useInterval(() => {
		api.get('colors').then((response) => {
			setColors(response.data);
		});
	}, 1000);

	useEffect(() => {
		api.get('map').then((response) => {
			setMap(response.data);
		});
	});

	const handleCreateSnake = (data) => {
		api.post('snakes', data).then((response) => {
			if (response.data !== 0) {
				alert('Oh no! looks like someone beat you to that color...');
				return;
			}
			console.log(data.position);
			toGame(data.position);
		});
	};

	const generatePosition = () => [
		[
			Math.floor((Math.random() * map.size[0]) / map.scale),
			Math.floor((Math.random() * map.size[1]) / map.scale),
		],
	];

	return (
		<div className="main">
			<h1>Welcome to Snake Multiplayer!</h1>
			<p>Pick your color:</p>
			<CirclePicker
				colors={colors}
				color={myColor}
				onChange={(pickColor) => setMyColor(pickColor.hex)}
			/>
			<button
				className={myColor === 'lightgrey' ? 'inactive' : 'active'}
				style={{ backgroundColor: myColor }}
				onClick={
					myColor === 'lightgrey'
						? () => null
						: () =>
								handleCreateSnake({
									color: myColor,
									position: generatePosition(),
									points: 0,
								})
				}
			>
				<i
					style={{ color: 'white' }}
					className="fa fa-check fa-2x"
					aria-hidden="true"
				></i>
			</button>
		</div>
	);
};

export default Home;
