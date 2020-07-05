const express = require('express');

const app = express();

app.use(express.json());

let snakes = [];

app.get('/snakes', (request, response) => {
	return response.json(snakes);
});

app.put('/snakes/:index', (request, response) => {
	const index = parseInt(request.params.index);
	const data = request.body;
	snakes[index].position = data.postition;
	snakes[index].points = data.points;

	return response.json(0)
});

app.post('/snakes', (request, response) => {
	const data = request.body;

	const newSnake = {
		color: data.color,
		postion: data.position,
		points: data.points,
	};

	snakes.push(newSnake);

	return response.json(0);
});

app.delete('/snakes', (request, response) => {
	snakes = [];

	console.log('resetting...');

	return response.json('Reset successful.');
});

app.delete('/snakes/:index', (request, response) => {
	snakes.splice(parseInt(request.params.index), 1);

	return response.json(0);
});

app.listen(3333);
