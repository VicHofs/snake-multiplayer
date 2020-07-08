const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const mapSize = [800, 800];
const mapScale = 25;
const speed = 100;

let apple = [
	Math.floor((Math.random() * mapSize[0]) / mapScale),
	Math.floor((Math.random() * mapSize[1]) / mapScale),
];

apple = [8,8];

let snakes = [];

let availableColors = [
	'#e91e63',
	'#9c27b0',
	'#673ab7',
	'#3f51b5',
	'#2196f3',
	'#03a9f4',
	'#00bcd4',
	'#009688',
	'#4caf50',
	'#8bc34a',
	'#00ff40',
	'#cddc39',
	'#ffeb3b',
	'#ffc107',
	'#ff9800',
	'#795548',
	'#a30044',
	'#607d8b',
];

let running = false;

app.get('/running', (request, response) => response.json(snakes.length > 0));

app.get('/speed', (request, response) => response.json(speed));

app.get('/colors', (request, response) => {
	return response.json(availableColors);
});

app.get('/map', (request, response) => {
	return response.json({ size: mapSize, scale: mapScale });
});

app.get('/snakes', (request, response) => {
	return response.json(snakes);
});

app.get('/apple', (request, response) => response.json(apple));

app.put('/snakes/position/:index', (request, response) => {
	const index = parseInt(request.params.index);
	const data = request.body;
	snakes[index].position = data;

	return response.json(0);
});

app.put('/snakes/points/:index', (request, response) => {
	const index = parseInt(request.params.index);
	const data = request.body;
	snakes[index].points += data;

	return response.json(0);
});

app.post('/snakes', (request, response) => {
	const data = request.body;

	const newSnake = {
		color: data.color,
		position: data.position,
		points: data.points,
	};

	if(!(running)) running = true;

	if (!(availableColors.includes(newSnake.color))) return response.json(-1);

	snakes.push(newSnake);

	availableColors.splice(availableColors.indexOf(newSnake.color), 1);

	return response.json(0);
});

app.put('/apple', (request, response) => {
	const outOfBounds = snakes.map((snake) => snake.position);
	do {
		apple = [
			Math.floor((Math.random() * mapSize[0]) / mapScale),
			Math.floor((Math.random() * mapSize[1]) / mapScale),
		];
	} while (outOfBounds.includes(apple));

	return response.json(apple);
});

app.delete('/game', (request, response) => {
	snakes = [];

	availableColors = [
		'#e91e63',
		'#9c27b0',
		'#673ab7',
		'#3f51b5',
		'#2196f3',
		'#03a9f4',
		'#00bcd4',
		'#009688',
		'#4caf50',
		'#8bc34a',
		'#00ff40',
		'#cddc39',
		'#ffeb3b',
		'#ffc107',
		'#ff9800',
		'#795548',
		'#a30044',
		'#607d8b',
	];

	let apple = [
		Math.floor((Math.random() * mapSize[0]) / mapScale),
		Math.floor((Math.random() * mapSize[1]) / mapScale),
	];

	console.log('-resetting...');
	
	running = false;

	return response.json(0);
});

app.delete('/snakes/:index', (request, response) => {
	snakes.splice(parseInt(request.params.index), 1);

	if (snakes.length() < 1) running = false;

	return response.json(0);
});

app.listen(3333);
