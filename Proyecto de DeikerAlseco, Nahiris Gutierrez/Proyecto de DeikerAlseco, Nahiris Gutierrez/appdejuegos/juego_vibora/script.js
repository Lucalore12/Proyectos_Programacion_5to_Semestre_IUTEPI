const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const difficultySelect = document.getElementById('difficulty');

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let snakeBody = [];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;
let gameSpeed;
let obstacles = [];
let obstacleIntervalId;  // Variable para manejar el intervalo de los obstáculos

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerHTML = `High Score: ${highScore}`;

const changFoodPosition = () => {
	foodX = Math.floor(Math.random() * 30) + 1;
	foodY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
	difficultySelect.setAttribute('disabled', 'false');  // Deshabilitar la selección de dificultad
	clearInterval(setIntervalId);
	alert("Has Perdido!");
	location.reload();
}

const changeDirection = (e) => {
	if (e.key === "ArrowUp" && velocityY != 1) {
		velocityX = 0;
		velocityY = -1;
	} else if (e.key === "ArrowDown" && velocityY != -1) {
		velocityX = 0;
		velocityY = 1;
	} else if (e.key === "ArrowLeft" && velocityX != 1) {
		velocityX = -1;
		velocityY = 0;
	} else if (e.key === "ArrowRight" && velocityX != -1) {
		velocityX = 1;
		velocityY = 0;
	}
}

const initGame = () => {
	if (gameOver) return handleGameOver();

	let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

	// Añadir los obstáculos al HTML del tablero
	obstacles.forEach(obstacle => {
		htmlMarkup += `<div class="obstacle" style="grid-area: ${obstacle[1]} / ${obstacle[0]}"></div>`;
	});

	if (snakeX === foodX && snakeY === foodY) {
		changFoodPosition();
		snakeBody.push([foodX, foodY]);
		score++;

		highScore = score >= highScore ? score : highScore;
		localStorage.setItem("high-score", highScore);
		scoreElement.innerHTML = `Score: ${score}`;
		highScoreElement.innerHTML = `High Score: ${highScore}`;
	}

	for (let i = snakeBody.length - 1; i > 0; i--) {
		snakeBody[i] = snakeBody[i - 1];
	}

	snakeBody[0] = [snakeX, snakeY];

	snakeX += velocityX;
	snakeY += velocityY;

	// Verificar colisión con los límites
	if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
		gameOver = true;
	}

	// Verificar colisión con el cuerpo de la serpiente
	for (let i = 0; i < snakeBody.length; i++) {
		htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
		if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
			gameOver = true;
			difficultySelect.setAttribute('disabled', 'false');  // Deshabilitar la selección de dificultad
		}
	}

	// Verificar colisión con obstáculos después de actualizar la posición
	checkCollisionWithObstacles();

	playBoard.innerHTML = htmlMarkup;
};


const setDifficulty = (level) => {
	if (level === "easy") {
		gameSpeed = 200;  // Velocidad más lenta (fácil)
		clearInterval(obstacleIntervalId);  // Detener el movimiento de obstáculos en nivel fácil
	} else if (level === "medium") {
		gameSpeed = 150;  // Velocidad más rápida (medio)
		clearInterval(obstacleIntervalId);  // Detener el movimiento de obstáculos en nivel medio
	} else {
		gameSpeed = 90;  // Velocidad más rápida (difícil)
		generateObstacles();  // Generar obstáculos al iniciar la partida
		startObstacleMovement();  // Iniciar el cambio periódico de obstáculos
	}

	// Reiniciar el juego con la nueva velocidad
	clearInterval(setIntervalId);  // Limpiar el intervalo actual
	setIntervalId = setInterval(initGame, gameSpeed);  // Iniciar con la nueva velocidad
}

// Función para crear obstáculos en nuevas posiciones cada cierto tiempo
const startObstacleMovement = () => {
	obstacleIntervalId = setInterval(() => {
		generateObstacles();  // Genera nuevos obstáculos cada 5 segundos
	}, 5000);  // Cambia las posiciones de los obstáculos cada 5 segundos
};

// Generar los obstáculos inicialmente
const generateObstacles = () => {
	obstacles = [];  // Vaciar los obstáculos anteriores
	for (let i = 0; i < 5; i++) {  // Generar 5 obstáculos
		let obstacleX = Math.floor(Math.random() * 30) + 1;
		let obstacleY = Math.floor(Math.random() * 30) + 1;
		obstacles.push([obstacleX, obstacleY]);
	}
};

// Verificación de colisión con obstáculos
const checkCollisionWithObstacles = () => {
	for (let obstacle of obstacles) {
		if (snakeX === obstacle[0] && snakeY === obstacle[1]) {
			gameOver = true;  // Terminar el juego si la serpiente choca con un obstáculo
			difficultySelect.setAttribute('disabled', 'false');  // Deshabilitar la selección de dificultad
			handleGameOver();
		}
	}
};

// Detectar cuando cambie la dificultad
difficultySelect.addEventListener('change', (event) => {
	setDifficulty(event.target.value);  // Cambia la velocidad según el valor seleccionado
});

setDifficulty(difficultySelect.value);
document.addEventListener("keydown", changeDirection);
changFoodPosition();
