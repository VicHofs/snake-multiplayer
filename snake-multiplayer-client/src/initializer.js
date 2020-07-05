const mapSize = [800, 800];
const mapScale = 25;
const snakeSpawnPos = [
	[
		Math.floor((Math.random() * mapSize[0]) / mapScale),
		Math.floor((Math.random() * mapSize[1]) / mapScale),
	],
];
snakeSpawnPos.push(snakeSpawnPos[0].map((pos, i) => (i === 1 ? pos + 1 : pos)));
let apple = [
	Math.floor((Math.random() * mapSize[0]) / mapScale),
	Math.floor((Math.random() * mapSize[1]) / mapScale),
];
while (apple in snakeSpawnPos)
	apple = [
		Math.floor((Math.random() * mapSize[0]) / mapScale),
		Math.floor((Math.random() * mapSize[1]) / mapScale),
	];
const appleSpawnPos = apple;
const speed = 100;
const compass = {
	38: [0, -1], // up arrow
	40: [0, 1], // down arrow
	37: [-1, 0], // left arrow
	39: [1, 0], // right arrow
	87: [0, -1], // up (W)
	65: [-1, 0], // left (A)
	83: [0, 1], // down (S)
	68: [1, 0], // right (D)
};

export { mapSize, snakeSpawnPos, appleSpawnPos, mapScale, speed, compass };
