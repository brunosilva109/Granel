const config = {
    type: Phaser.AUTO,
    width: '100%', // Usa porcentagem para largura responsiva
    height: '100vh', // Usa porcentagem para altura responsiva
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
let boat2;
let baia1Livre = true;
let baia2Livre = true;
let pararPersonagem = false;
let boatPosition = { x: 800, y: 700 };
let boatSpeed = 1;
let boatSpeed2 = 1;
let canInteract = false;
let timerText;
let spawnBarco = 5;
let podePerguntarDois = false;
let podePerguntarUm = false;
let timer; // Variável para armazenar o temporizador
let countdownTime = 300; // Tempo em segundos para a contagem regressiva
let isMovingLeft = false;
let isMovingRight = false;
let isMovingUp = false;
let isMovingDown = false;

const questions = [
    { question: 'Pode misturar dois produtos?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Não' },
    { question: 'Pode andar sem EPI na área?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Não' },
    { question: 'O uso de mangote para descarga de caminhão é correto?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'Referente ao uso de cinto de segurança em trabalhos acima de 3 metros:', options: ['Não deve ser usado', 'Somente acima de 8 metros', 'Somente abaixo de 3 metros', 'Sempre usar'], answer: 'Sempre usar' },
    { question: 'É obrigatório o uso de capacete em obras?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'É permitido trabalhar com fones de ouvido em ambientes de risco?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Não' },
    { question: 'Os trabalhadores devem conhecer os procedimentos de emergência?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'É seguro usar ferramentas danificadas?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Não' },
    { question: 'Todos os funcionários devem ser treinados em segurança?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'O uso de protetores auriculares é necessário em ambientes ruidosos?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'É importante sinalizar áreas de risco?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'É permitido fumar em áreas de armazenamento de produtos inflamáveis?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Não' },
    { question: 'Deve-se relatar qualquer acidente de trabalho?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' },
    { question: 'A manutenção regular dos equipamentos de proteção é necessária?', options: ['Sim', 'Não', 'Sempre', 'Às vezes'], answer: 'Sim' }

];

let availableQuestions = [...questions];
let contador = availableQuestions.length;

function preload() {
    this.load.image('item', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/valvula.png');
    this.load.image('sky', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/MAPA.png');
    this.load.image('boat', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/NAVIO.png');
    this.load.spritesheet('esquerda', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/esquerda.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('direita', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/direita.png', { frameWidth: 59, frameHeight: 65 });
    this.load.spritesheet('cima', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/costas.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('baixo', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/frente.png', { frameWidth: 58, frameHeight: 65 });
}

function create() {
    let background = this.add.image(0, 0, 'sky').setScale(this.sys.game.device.pixelRatio);
   background.setOrigin(0, 0);
   background.setScale(this.cameras.main.width*0.00052,this.cameras.main.height * 0.001112 );
    

    // valvulas
    let valvulaDireitaCima = this.physics.add.sprite(this.cameras.main.width * 0.2, this.cameras.main.height * 0.55, 'item');
    let valvulaDireitaBaixo = this.physics.add.sprite(this.cameras.main.width * 0.2, this.cameras.main.height * 0.9, 'item');
    let valvulaEsquerdaCima = this.physics.add.sprite(this.cameras.main.width * 0.8, this.cameras.main.height * 0.55, 'item');
    let valvulaEsquerdaBaixo = this.physics.add.sprite(this.cameras.main.width * 0.8, this.cameras.main.height * 0.9, 'item');
    let escalaValvula;
    if(this.cameras.main.width>=1000){
        escalaValvula = 1;
    }
    else{
        escalaValvula = 0.5
    }
        
        valvulaDireitaBaixo.setScale(escalaValvula);
        valvulaDireitaCima.setScale(escalaValvula);
        valvulaEsquerdaBaixo.setScale(escalaValvula);
        valvulaEsquerdaCima.setScale(escalaValvula);

    //player
    player = this.physics.add.sprite(this.cameras.main.width * 0.4, this.cameras.main.height *0.4, 'baixo');
    player.setBounce(0.2);
    let escalaPlayer;
    if(this.cameras.main.width>=1000){
        escalaPlayer = 0.035;
    }
    else{
        escalaPlayer = 0.05
    }
        const escalaXPlayer = this.cameras.main.width * escalaPlayer/ player.width; 
    player.setScale(escalaXPlayer);
    player.setCollideWorldBounds(true);

    //barco
    boat = this.physics.add.image(0, 0, 'boat');
    boat.setCollideWorldBounds(true);
    boat.setScale(escalaValvula);
    boat.body.immovable = true;
    boat2 = this.physics.add.image(0, 0, 'boat');
    boat2.setCollideWorldBounds(true);
    boat2.setScale(escalaValvula);
    boat2.body.immovable = true;

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('esquerda', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('baixo', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('cima', { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('direita', { start: 0, end: 20 }), frameRate: 10, repeat: -1 });



    this.physics.add.overlap(player, valvulaDireitaCima, useValvulaum, null, this);
    this.physics.add.overlap(player, valvulaDireitaBaixo, useValvuladois, null, this);
    this.physics.add.overlap(player, valvulaEsquerdaBaixo, useValvulatres, null, this);
    this.physics.add.overlap(player, valvulaEsquerdaCima, useValvulaquatro, null, this);
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
    if (this.cameras.main.width < 1000) {
        const leftButton = this.add.rectangle((this.cameras.main.width/2)-50, this.cameras.main.height - 75, 50, 50, 0x0000ff).setOrigin(0.5, 0.5).setInteractive();
        const rightButton = this.add.rectangle((this.cameras.main.width/2)+50, this.cameras.main.height - 75, 50, 50, 0x00ff00).setOrigin(0.5, 0.5).setInteractive();
        const upButton = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height - 125, 50, 50, 0xff0000).setOrigin(0.5, 0.5).setInteractive();
        const downButton = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height - 25, 50, 50, 0xffff00).setOrigin(0.5, 0.5).setInteractive();

        leftButton.on('pointerdown', () => isMovingLeft = true);
        rightButton.on('pointerdown', () => isMovingRight = true);
        upButton.on('pointerdown', () => isMovingUp = true);
        downButton.on('pointerdown', () => isMovingDown = true);

        leftButton.on('pointerup', () => isMovingLeft = false);
        rightButton.on('pointerup', () => isMovingRight = false);
        upButton.on('pointerup', () => isMovingUp = false);
        downButton.on('pointerup', () => isMovingDown = false);
    }
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
    const completionPanel = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width*0.8, this.cameras.main.height*0.8, 0x000fff).setOrigin(0.5, 0.5);
    const completionText = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, `Tempo Esgotado - Total de Acertos: ${score}`, { fontSize: '4vw', fill: '#fff', wordWrap: { width:  this.cameras.main.width* 0.75, useAdvancedWrap: true }}).setOrigin(0.5, 0.5);
    pararPersonagem = true;
    this.time.delayedCall(3000, () => {
        completionPanel.destroy();
        completionText.destroy();
        window.location.href = '../../fase.html'; 
    });
}
function showCompletionMessage() {
    const completionPanel = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width*0.8, this.cameras.main.height*0.8, 0x000fff).setOrigin(0.5, 0.5);
    const completionText = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, `Fase Concluída - Total de Acertos: ${score}`, { fontSize: '4vw', fill: '#fff', wordWrap: { width:  this.cameras.main.width* 0.75, useAdvancedWrap: true }}).setOrigin(0.5, 0.5);
   
    // Redireciona após 3 segundos
    this.time.delayedCall(3000, () => {
        completionPanel.destroy();
        completionText.destroy();

        window.location.href = '../../fase.html'; 
    });
}

function useValvulaum() {
    if (podePerguntarUm && !questionPanel) {
        pararPersonagem = true;
        timer.paused = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1);
            showQuestions1.call(this, question);
        } 
    }
}
function useValvuladois() {
    if (podePerguntarUm && !questionPanel) {
        pararPersonagem = true;
        timer.paused = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1);
            showQuestions1.call(this, question);
        } 
    }
}
function useValvulatres() {
    if (podePerguntarDois && !questionPanel) {
        pararPersonagem = true;
        timer.paused = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1);
            showQuestionsdois.call(this, question);
        } 
    }
}
function useValvulaquatro() {
    if (podePerguntarDois && !questionPanel) {
        pararPersonagem = true;
        timer.paused = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1);
            showQuestionsdois.call(this, question);
        } 
    }
}

function showQuestions1(question) {
    
    questionPanel = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width*0.8, this.cameras.main.height*0.8, 0x000fff).setOrigin(0.5, 0.5);
    questionText = this.add.text(this.cameras.main.width/2, this.cameras.main.height*0.2, question.question, { fontSize: '3vw', fill: '#fff', wordWrap: { width:  this.cameras.main.width* 0.75, useAdvancedWrap: true }}).setOrigin(0.5, 0.5);
    
    optionTexts = question.options.map((option, index) => {
        const text = this.add.text(this.cameras.main.width/2, this.cameras.main.height*0.5 + index * 50, option, { fontSize: '3vw', fill: '#fff'}).setOrigin(0.5, 0.5);
        
        text.setInteractive();
        text.on('pointerdown', () => {
            checkAnswer.call(this, option, question.answer);
            hideQuestions.call(this);
            boatSpeed = 1;
            boat.x += boatSpeed;
            timer.paused = false;
            contador = contador-1;
        });

        return text;
    });
} 
function showQuestionsdois(question) {
    
    questionPanel = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width*0.8, this.cameras.main.height*0.8, 0x000fff).setOrigin(0.5, 0.5);
    questionText = this.add.text(this.cameras.main.width/2, this.cameras.main.height*0.2, question.question, { fontSize: '3vw', fill: '#fff', wordWrap: { width:  this.cameras.main.width* 0.75, useAdvancedWrap: true }}).setOrigin(0.5, 0.5);
    
    optionTexts = question.options.map((option, index) => {
        const text = this.add.text(this.cameras.main.width/2, this.cameras.main.height*0.5 + index * 50, option, { fontSize: '3vw', fill: '#fff'}).setOrigin(0.5, 0.5);
        
        text.setInteractive();
        text.on('pointerdown', () => {
            checkAnswer.call(this, option, question.answer);
            hideQuestionsdois.call(this);
            boatSpeed2 = 1;
            boat2.x += boatSpeed2;
            timer.paused = false;
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
    boatSpeed = 1;
    pararPersonagem = false;
    boat.x += boatSpeed;
    podePerguntarUm = false;
}
function hideQuestionsdois() {
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
    boatSpeed2 = 1;
    pararPersonagem = false;
    boat2.x += boatSpeed2;
    podePerguntarDois = false;
}
function checkAnswer(selected, correctAnswer) {
    if (selected === correctAnswer) {
        score++;
        console.log('Acertou! Total de acertos:', score);
    } else {
        console.log('Errou! Total de acertos:', score);
    }
}


function createNewBoat() {
    boat = this.physics.add.image(0, 0, 'boat');
    boat.setCollideWorldBounds(true);
    boat.body.immovable = true;
    let escalaBarco;
    if(this.cameras.main.width>=1000){
        escalaBarco = 1;
    }
    else{
        escalaBarco= 0.5
    }
    boat.setScale(escalaBarco);
    canInteract = false;
}
function createNewBoat2() {
    boat2 = this.physics.add.image(0, 0, 'boat');
    boat2.setCollideWorldBounds(true);
    boat2.body.immovable = true;
    let escalaBarco;
    if(this.cameras.main.width>=1000){
        escalaBarco = 1;
    }
    else{
        escalaBarco= 0.5
    }
    boat2.setScale(escalaBarco);
    canInteract = false;
}

function update() {
    if(contador == 0){
        showCompletionMessage.call(this);
    }
    if (boat) {
        boat.x += boatSpeed;
        boat2.x += boatSpeed2;
        if (boat.x == Math.floor(this.cameras.main.width*0.25) ) {
            boatSpeed = 0;
            boat.x += boatSpeed;
            baia1Livre == false;
            podePerguntarUm = true;
        }
        
        if (boat2.x == Math.floor(this.cameras.main.width*0.75) ) {
            boatSpeed2 = 0;
            boat2.x += boatSpeed;
            podePerguntarDois = true;
        }
        
        if (boat.x == Math.floor(this.cameras.main.width*0.9)) {
            boat.destroy(); 
            if (availableQuestions.length > 0) {
                createNewBoat.call(this); 
            }
        }
        if (boat2.x == Math.floor(this.cameras.main.width*0.9)) {
            boat2.destroy(); 
            if (availableQuestions.length > 0) {
                createNewBoat2.call(this); 
            }
        }
        
    }

    if ((cursors.left.isDown ||isMovingLeft) && !pararPersonagem && player.x > this.cameras.main.width*0.22) {
        player.setVelocityX(-100);
        player.setVelocityY(0);
        player.anims.play('left', true);
    } else if ((cursors.right.isDown || isMovingRight)&& !pararPersonagem && player.x < this.cameras.main.width*0.78 ) {
        player.setVelocityX(100);
        player.setVelocityY(0);
        player.anims.play('right', true);
    } else if ((cursors.up.isDown || isMovingUp ) && !pararPersonagem && player.y>this.cameras.main.height*0.28) {
        player.anims.play('up', true);
        player.setVelocityX(0);
        player.setVelocityY(-100);
    } else if ((cursors.down.isDown || isMovingDown) && !pararPersonagem) {
        player.anims.play('down', true);
        player.setVelocityX(0);
        player.setVelocityY(100);
    } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('down');
    }
    
    
}
