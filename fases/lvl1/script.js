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

// Função de pré-carregamento (Carrega os assets)
function preload() {
    // Carregando a imagem do personagem
    this.load.image('sky', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/MAPA.png',);
    this.load.image('ground', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/muroVertical.png');
    this.load.image('topo', 'https://raw.githubusercontent.com/brunosilva109/Granel/refs/heads/main/img/parede%20topo.png');
    this.load.spritesheet('esquerda', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/esquerda.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('direita', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/direita.png', { frameWidth: 59, frameHeight: 65 });
    this.load.spritesheet('cima', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/costas.png', { frameWidth: 58, frameHeight: 65 });
    this.load.spritesheet('baixo', 'https://raw.githubusercontent.com/brunosilva109/Granel/main/img/personagem/frente.png', { frameWidth: 58, frameHeight: 65 });

}

// Função de criação dos objetos do jogo
function create() {
    // Adiciona o fundo

    let background = this.add.image(0, 0, 'sky');

    // Define a origem da imagem no canto superior esquerdo
    background.setOrigin(0, 0);

    // Ajusta o tamanho da imagem de fundo para cobrir toda a tela
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;



    // Adiciona plataformas
    let platforms = this.physics.add.staticGroup();

    platforms.create(380,448, 'ground');
    platforms.create(1518, 447, 'ground');
    platforms.create(954, 120, 'topo');

    // Adiciona o jogador
    player = this.physics.add.sprite(800, 450, 'baixo');

    // Definindo física do jogador
    player.setBounce(0.2); // Faz o jogador quicar
    player.setCollideWorldBounds(true); // Limita o jogador aos limites da tela

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('esquerda', { start: 0, end: 20 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('baixo', { start: 0, end: 20 }),
        frameRate: 6,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('cima', { start: 0, end: 20 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('direita', { start: 0, end: 20 }),
        frameRate: 10,
        repeat: -1
    });

    // Adiciona colisão entre jogador e plataformas
    this.physics.add.collider(player, platforms);

    // Captura input do teclado
    cursors = this.input.keyboard.createCursorKeys();
}

// Função de atualização (a cada frame)
function update() {
    // Verifica as teclas pressionadas para mover o jogador
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setVelocityY(0);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setVelocityY(0);
        player.anims.play('right', true);
    } else if (cursors.up.isDown) {
        player.anims.play('up', true);
        player.setVelocityX(0);
        player.setVelocityY(-160);
    }
    else if (cursors.down.isDown) {
        player.anims.play('down', true);
        player.setVelocityX(0);
        player.setVelocityY(160);
    }  
    else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('dude');
    }
    
}