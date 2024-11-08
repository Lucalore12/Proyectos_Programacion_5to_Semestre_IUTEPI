let gameInterval; // Variable para el intervalo del juego
let gameRunning = true; // Variable para controlar el estado del juego

function startGame() {
    gameInterval = setInterval(() => {
        if (gameRunning) {
            keyPressed();
        }
    }, 80); // Iniciar el intervalo
}

const playerElement = document.querySelector('.player');

let username = prompt("Por favor, introduce tu nombre de usuario:");

function saveScore(username, score) {
    // Obtener las puntuaciones existentes del local storage
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Agregar la nueva puntuación
    scores.push({ username: username, score: score });

    // Ordenar las puntuaciones de mayor a menor
    scores.sort((a, b) => b.score - a.score);

    // Limitar a las 10 mejores puntuaciones
    scores = scores.slice(0, 10);

    // Guardar nuevamente en el local storage
    localStorage.setItem('highScores', JSON.stringify(scores));
}

const tetris = new Tetris(playerElement);

// Mostrar el nombre del jugador en la puntuación
const scoreElement = playerElement.querySelector('.score');
scoreElement.innerText = `Jugador: ${username} | Nivel: 1 | Puntuación: 0`;

var keys = [];

document.body.addEventListener("keydown", function (event) {
    if (gameRunning) {
        keys[event.keyCode] = event;
    }
});

document.body.addEventListener("keyup", function (event) {
    if (gameRunning) {
        keys[event.keyCode] = false;
    }
});

let keyPressed = function() {
    const player = tetris.player;

    // A
    if(keys[65]) player.moveLeft();
    
    // D
    if(keys[68]) player.moveRight();

    // S
    if(keys[83]) player.drop();

    // W
    if(keys[87] && !keys[87].repeat) {
        player.rotateClockWise();
        keys[87] = false;
    }

    // Q
    if(keys[81] && !keys[81].repeat) {
        player.rotateAntiClockWise();
        keys[81] = false;
    }
};

// Iniciar el juego
startGame();

// Manejo de Game Over
tetris.player.gameOver = function() {
    // Mostrar el menú de Game Over
    document.getElementById('gameOverMenu').style.display = 'block';
    document.getElementById('finalScore').innerText = `Puntuación final: ${this.score}`;

    // Guardar la puntuación y el nombre de usuario
    saveScore(username, this.score);

    // Detener el juego
    gameRunning = false; // Cambiar el estado del juego a detenido
    clearInterval(gameInterval); // Detener el intervalo
    disableKeyboardInput(); // Deshabilitar la entrada del teclado
}

// Función para deshabilitar la entrada del teclado
function disableKeyboardInput() {
    document.body.removeEventListener("keydown", keyDownHandler);
    document.body.removeEventListener("keyup", keyUpHandler);
}

// Funciones para manejar la entrada del teclado
function keyDownHandler(event) {
    keys[event.keyCode] = event;
}

function keyUpHandler(event) {
    keys[event.keyCode] = false;
}

// Botón para regresar al menú
document.getElementById('restartButton').addEventListener('click', function() {
    window.location.href = '../menu/menu.html'; // Redirige a otra página
});
