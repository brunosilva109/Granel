const config = {
    type: Phaser.AUTO,
    width: 1900,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Inicializando o jogo
const game = new Phaser.Game(config);

let player;
let cursors;

let questionPanel;
let questionText;
let optionTexts = [];
let score = 0;
let boat;
let pararPersonagem = false;
let podePerguntar = false;
let boatPosition = { x: 800, y: 700 };
let boatSpeed = 2;
let canInteract = false;
let timerText;
let timer; // Variável para armazenar o temporizador
let countdownTime = 120; // Tempo em segundos para a contagem regressiva

const questions = [
    { question: 'pode misturar 2 produtos ?', options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Não' },
    { question: 'Pode Andar sem EPI na Area ?',  options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Não'},
    { question: 'Uso de Mangote para Descarga de Caminhão é Correto ?', options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Sim' },
    { question: 'Referente ao uso de cinto de seguração em Trabalhos acima de 3 metros', options: ['Não deve ser Usador', 'Somente Acima de 8 Metros', 'Somente Abaixo de 3 Metros', 'Sempre Usar'], answer: 'Sempre Usar' }
  
];

let availableQuestions = [...questions];
let contador = availableQuestions.length;

function preload() {
    this.load.image('item', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/valvula.png');
    this.load.image('sky', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/MAPA.png');
    this.load.image('ground', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/muroVertical.png');
    this.load.image('topo', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/parede%20topo.png');
    this.load.image('boat', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/NAVIO.png');
    this.load.spritesheet('esquerda', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/esquerda.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('direita', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/direita.png', { frameWidth: 59, frameHeight: 65 });
    this.load.spritesheet('cima', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/costas.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('baixo', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/frente.png', { frameWidth: 58, frameHeight: 65 });
}

function create() {
    let background = this.add.image(0, 0, 'sky');
    let itens = this.physics.add.staticGroup();
    itens.create(380, 820, 'item');
    itens.create(380, 520, 'item');
    itens.create(1518, 820, 'item');
    itens.create(1518, 520, 'item');
    background.setOrigin(0, 0);
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;

    let platforms = this.physics.add.staticGroup();
    platforms.create(380, 448, 'ground');
    platforms.create(1520, 447, 'ground');
    platforms.create(951, 120, 'topo');

    player = this.physics.add.sprite(800, 450, 'baixo');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    boat = this.physics.add.image(boatPosition.x, boatPosition.y, 'boat').setOrigin(10, 10);
    boat.setCollideWorldBounds(true);
    boat.body.immovable = true;

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('esquerda', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('baixo', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('cima', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('direita', { start: 0, end: 20 }), frameRate: 10, repeat: -1 });

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, boat, () => {
        canInteract = true;
    });
    this.physics.add.overlap(player, itens, useItem, null, this);
    cursors = this.input.keyboard.createCursorKeys();

    // Configurando o texto do temporizador
    timerText = this.add.text(16, 16, `Tempo: ${countdownTime}`, { fontSize: '32px', fill: '#fff' });

    // Iniciando o temporizador
    timer = this.time.addEvent({
        delay: 1000, // 1 segundo
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function updateTimer() {
    countdownTime--;
    timerText.setText(`Tempo: ${countdownTime}`);

    if (countdownTime <= 0) {
        timer.paused = true; // Pausa o temporizador
        showTimeExpiredMessage.call(this);
    }
}

function showTimeExpiredMessage() {
    const completionPanel = this.add.rectangle(950, 450, 600, 200, 0x000000).setOrigin(0.5, 0.5);
    const completionText = this.add.text(950, 370, 'Tempo Esgotado!', {
        fontSize: '32px',
        fill: '#fff'
    }).setOrigin(0.5, 0.5);
    pararPersonagem = true;
    this.time.delayedCall(3000, () => {
        completionPanel.destroy();
        completionText.destroy();
        window.location.href = '../../fase.html'; 
    });
}
function showCompletionMessage() {
    const completionPanel = this.add.rectangle(950, 450, 600, 200, 0x000000).setOrigin(0.5, 0.5);
    const completionText = this.add.text(950, 370, 'Fase Concluída!', {
        fontSize: '32px',
        fill: '#fff'
    }).setOrigin(0.5, 0.5);

    // Redireciona após 3 segundos
    this.time.delayedCall(3000, () => {
        completionPanel.destroy();
        completionText.destroy();

        window.location.href = '../../fase.html'; 
    });
}

function useItem() {
    if (podePerguntar && !questionPanel) {
        pararPersonagem = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1);
            showQuestions.call(this, question);
        } 
    }
}

function showQuestions(question) {
    questionPanel = this.add.rectangle(950, 450, 2000, 400, 0x000fff).setOrigin(0.5, 0.5);
    questionText = this.add.text(950, 370, question.question, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5, 0.5);
    
    optionTexts = question.options.map((option, index) => {
        const text = this.add.text(950, 420 + index * 50, option, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0.5);
        
        text.setInteractive();
        text.on('pointerdown', () => {
            checkAnswer.call(this, option, question.answer);
            hideQuestions.call(this);
            boatSpeed = 2;
            boat.x += boatSpeed;
            contador = contador-1;
        });

        return text;
    });
}

function hideQuestions() {
    if (questionPanel) {
        questionPanel.destroy();
        questionPanel = null;
    }
    if (questionText) {
        questionText.destroy();
        questionText = null;
    }
    optionTexts.forEach(text => text.destroy());
    optionTexts = [];
    boatSpeed = 2;
    pararPersonagem = false;
    boat.x += boatSpeed;
    podePerguntar = false;
}

function checkAnswer(selected, correctAnswer) {
    if (selected === correctAnswer) {
        score++;
        console.log('Acertou! Total de acertos:', score);
    } else {
        console.log('Errou! Total de acertos:', score);
    }
}

function moveBoat() {
    this.tweens.add({
        targets: boat,
        x: 2000,
        duration: 2000,
        onComplete: () => {
            boat.destroy(); 
            if (availableQuestions.length > 0) {
                createNewBoat.call(this); 
            }
        }
    });
}

function createNewBoat() {
    boat = this.physics.add.image(boatPosition.x, boatPosition.y, 'boat').setOrigin(10, 10);
    boat.setCollideWorldBounds(true);
    boat.body.immovable = true;
    canInteract = false;
}

function update() {
    if(contador == 0){
        showCompletionMessage.call(this);
    }
    if (boat) {
        boat.x += boatSpeed;
        if (boat.x == 2000) {
            boatSpeed = 0;
            boat.x += boatSpeed;
            podePerguntar = true;
        }
        if (boat.x > 3300) {
            boat.destroy(); 
            if (availableQuestions.length > 0) {
                createNewBoat.call(this); 
            }
        }
    }

    if (cursors.left.isDown && !pararPersonagem) {
        player.setVelocityX(-160);
        player.setVelocityY(0);
        player.anims.play('left', true);
    } else if (cursors.right.isDown && !pararPersonagem) {
        player.setVelocityX(160);
        player.setVelocityY(0);
        player.anims.play('right', true);
    } else if (cursors.up.isDown && !pararPersonagem) {
        player.anims.play('up', true);
        player.setVelocityX(0);
        player.setVelocityY(-160);
    } else if (cursors.down.isDown && !pararPersonagem) {
        player.anims.play('down', true);
        player.setVelocityX(0);
        player.setVelocityY(160);
    } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('down');
    }
}
