import * as THREE from 'three';
import * as CANNON from 'cannon-es';

let playerBody;
let camera;
const velocity = new THREE.Vector3();
const inputVelocity = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};
let canJump = false;

// Função para criar o jogador
export function createPlayer(cam, world) {
    camera = cam;
    const playerShape = new CANNON.Sphere(1); // Corpo do jogador é uma esfera de raio 1
    playerBody = new CANNON.Body({
        mass: 5, // Massa do jogador
        position: new CANNON.Vec3(0, 10, 0), // Posição inicial no alto para cair
        shape: playerShape,
        material: new CANNON.Material({ friction: 0.1 }) // Pouca fricção
    });
    playerBody.linearDamping = 0.9; // Simula atrito com o ar
    world.addBody(playerBody);

    // Evento de colisão para saber quando o jogador está no chão
    playerBody.addEventListener('collide', (event) => {
        // Verifica se a colisão foi forte o suficiente e na parte de baixo do jogador
        const contactNormal = new CANNON.Vec3();
        if (event.contact.getImpactVelocityAlongNormal() > 1) {
             // O vetor normal do contato aponta para cima? (colisão com o chão)
             event.contact.ni.negate(contactNormal);
             if (contactNormal.y > 0.5) {
                 canJump = true;
             }
        }
    });

    setupControls();
}

// Configura os controles
function setupControls() {
    // Teclado
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW': moveState.forward = true; break;
            case 'KeyA': moveState.left = true; break;
            case 'KeyS': moveState.backward = true; break;
            case 'KeyD': moveState.right = true; break;
            case 'Space': 
                if (canJump) {
                    playerBody.velocity.y = 10; // Força do pulo
                    canJump = false;
                }
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW': moveState.forward = false; break;
            case 'KeyA': moveState.left = false; break;
            case 'KeyS': moveState.backward = false; break;
            case 'KeyD': moveState.right = false; break;
        }
    });

    // Mouse (Câmera)
    document.body.addEventListener('click', () => {
        document.body.requestPointerLock(); // Trava o cursor na tela
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            euler.y -= event.movementX * 0.002;
            euler.x -= event.movementY * 0.002;
            // Limita a rotação vertical para não "quebrar o pescoço"
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
            camera.quaternion.setFromEuler(euler);
        }
    });
}


// Função para ser chamada a cada frame no loop principal
export function updatePlayer(deltaTime) {
    if (!playerBody) return;

    const speed = 200;
    
    // Calcula a velocidade de entrada baseada nas teclas pressionadas
    inputVelocity.set(0, 0, 0);
    if (moveState.forward) inputVelocity.z = -speed * deltaTime;
    if (moveState.backward) inputVelocity.z = speed * deltaTime;
    if (moveState.left) inputVelocity.x = -speed * deltaTime;
    if (moveState.right) inputVelocity.x = speed * deltaTime;

    // Aplica a rotação da câmera ao vetor de velocidade
    // para que "frente" seja sempre para onde a câmera está olhando
    velocity.copy(inputVelocity).applyQuaternion(camera.quaternion);

    // Aplica a velocidade ao corpo físico do jogador
    playerBody.velocity.x = velocity.x;
    playerBody.velocity.z = velocity.z;

    // Atualiza a posição da câmera para ser a mesma do corpo físico
    camera.position.copy(playerBody.position);
    // Ajusta a altura da câmera para parecer que estamos "vendo" de dentro da cabeça
    camera.position.y += 0.8; 
}

// Exporta a referência ao corpo do jogador se necessário em outros arquivos
export { playerBody };