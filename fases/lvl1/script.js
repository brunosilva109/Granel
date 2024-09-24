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
let item;
let questionPanel;
let questionText;
let optionTexts = [];
let score = 0;
let boat;
let pararPersonagem = false;
let podePerguntar = false;
let boatPosition = { x: 800, y: 700 }; // Posição onde o barco deve parar
let boatSpeed = 2; // Velocidade do barco
let canInteract = false; // Controle de interação

// Array de perguntas
const questions = [
    { question: 'pode misturar 2 produtos ?', options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Não' },
    { question: 'Pode Andar sem EPI na Area ?',  options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Não'},
    { question: 'Uso de Mangote para Descarga de Caminhão é Correto ?', options: ['Sim', 'Não', 'Sempre', 'A vezes'], answer: 'Sim' },
    { question: 'Referente ao uso de cinto de seguração em Trabalhos acima de 3 metros', options: ['Não deve ser Usador', 'Somente Acima de 8 Metros', 'Somente Abaixo de 3 Metros', 'Sempre Usar'], answer: 'Sempre Usar' }
];

let availableQuestions = [...questions]; // Array de perguntas disponíveis

function preload() {
    this.load.image('item', 'https://cdn-icons-png.flaticon.com/512/900/900762.png');
    this.load.image('sky', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/MAPA.png');
    this.load.image('ground', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/muroVertical.png');
    this.load.image('topo', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/parede%20topo.png');
    this.load.image('boat', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/NAVIO.png'); // Substitua pela URL da imagem do barco
    this.load.spritesheet('esquerda', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/esquerda.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('direita', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/direita.png', { frameWidth: 59, frameHeight: 65 });
    this.load.spritesheet('cima', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/costas.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('baixo', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/frente.png', { frameWidth: 58, frameHeight: 65 });
}

function create() {
    let background = this.add.image(0, 0, 'sky');
    item = this.physics.add.sprite(400, 300, 'item');
    background.setOrigin(0, 0);
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;

    let platforms = this.physics.add.staticGroup();
    platforms.create(380, 448, 'ground');
    platforms.create(1518, 447, 'ground');
    platforms.create(954, 120, 'topo');

    player = this.physics.add.sprite(800, 450, 'baixo');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Criação do barco
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
    this.physics.add.overlap(player, item, useItem, null, this);
    cursors = this.input.keyboard.createCursorKeys();
}

function useItem() {
    if (podePerguntar == true && !questionPanel) { // Apenas exibe se o barco estiver no local certo
        pararPersonagem = true;
        if (availableQuestions.length > 0) {
            const questionIndex = Math.floor(Math.random() * availableQuestions.length);
            const question = availableQuestions[questionIndex];
            availableQuestions.splice(questionIndex, 1); // Remove a pergunta usada
            showQuestions.call(this, question);
        } else {
            showCompletionMessage.call(this); // Exibe a mensagem de conclusão
        }
    }
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
        window.location.href = '../../fase.html'; // Ajuste o caminho conforme necessário
    });
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
        });

        return text;
    });
}

// Função para esconder a aba de perguntas
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
    podePerguntar= false;
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
    boat.body.immovable = true; // O barco não deve se mover por colisão
    canInteract = false; // Resetar a interação
}

// Função de atualização
function update() {

    if (boat) {
        boat.x += boatSpeed; // Move o barco para a direita
        if(boat.x == 2000){
            boatSpeed = 0;
            boat.x += boatSpeed;
            podePerguntar=true;
        }
        if (boat.x > 3300) { // Se o barco sair da tela
            boat.destroy(); // Remove o barco
            if (availableQuestions.length > 0) {
                createNewBoat.call(this); // Cria um novo barco
            }
        }
    }

    if (cursors.left.isDown && pararPersonagem==false) {
        player.setVelocityX(-160);
        player.setVelocityY(0);
        player.anims.play('left', true);
    } else if (cursors.right.isDown && pararPersonagem==false) {
        player.setVelocityX(160);
        player.setVelocityY(0);
        player.anims.play('right', true);
    } else if (cursors.up.isDown && pararPersonagem==false) {
        player.anims.play('up', true);
        player.setVelocityX(0);
        player.setVelocityY(-160);
    } else if (cursors.down.isDown && pararPersonagem==false) {
        player.anims.play('down', true);
        player.setVelocityX(0);
        player.setVelocityY(160);
    } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('down');
    }
}
