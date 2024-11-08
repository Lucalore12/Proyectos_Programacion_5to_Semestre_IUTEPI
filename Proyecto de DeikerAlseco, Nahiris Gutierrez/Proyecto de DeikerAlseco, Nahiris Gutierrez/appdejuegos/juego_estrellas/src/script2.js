// Variable global para el nivel de dificultad
var nivelDificultad = "fácil";  // Inicialmente en fácil; se actualizará según el selector de dificultad
var game;  // Declaramos `game` fuera para instanciarlo después

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',  // El ID del div donde quieres cargar el juego
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },  // Mantener la misma gravedad en todas las dificultades
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var score = 0;
var scoreText;
var gameOver = false;
var timer;
var timerText;

function startGame() {
    if (game) {
        game.destroy(true);  // Elimina la instancia del juego y libera los recursos
    }
    game = new Phaser.Game(config);
}

function preload(){
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create(){
    this.add.image(400, 300, 'sky');
    
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20,
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);
    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Puntaje: 0', { fontSize: '32px', fill: '#000' });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    // Temporizador solo para el nivel difícil
    if (nivelDificultad === "difícil") {
        timer = 30;  // 30 segundos de límite
        timerText = this.add.text(16, 50, 'Tiempo: ' + timer, { fontSize: '32px', fill: '#000' });
        this.time.addEvent({
            delay: 1000,
            callback: updateTimer,
            callbackScope: this,
            loop: true
        });
    }
}

function update() {
    if (gameOver) return;

    var playerSpeed = 160;
    if (nivelDificultad === "medio") {
        playerSpeed = 200;
    } else if (nivelDificultad === "difícil") {
        playerSpeed = 240;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-playerSpeed);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(playerSpeed);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Puntaje: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        // Reiniciar el temporizador a 30 segundos al recolectar todas las estrellas
        if (nivelDificultad === "difícil") {
            timer = 30;
            timerText.setText('Tiempo: ' + timer);
        }

        // Aumentar el número de bombas en dificultad difícil
        var bombCount = nivelDificultad === "difícil" ? 3 : (nivelDificultad === "medio" ? 2 : 1);
        for (let i = 0; i < bombCount; i++) {
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

// Actualizar el temporizador solo para el nivel difícil
function updateTimer() {
    if (timer > 0) {
        timer--;
        timerText.setText('Tiempo: ' + timer);
    } else {
        this.physics.pause();
        gameOver = true;
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
}
