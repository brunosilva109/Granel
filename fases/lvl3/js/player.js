import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { triggerInteraction, handleDrop  } from './interaction.js'; // Importa a função de gatilho

let playerBody;
let camera;
const velocity = new THREE.Vector3();
const inputVelocity = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
let canJump = false;

export const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};
export const playerState = {
    hasLever: false,
    hasHose: false,
};

export function attemptJump() {
    if (canJump) {
        playerBody.velocity.y = 10;
        canJump = false;
    }
}

// NOVA FUNÇÃO EXPORTADA: Controla a rotação da câmera
// Recebe o deslocamento do dedo/mouse e aplica à rotação da câmera.
export function rotateCamera(deltaX, deltaY) {
    if (!camera) return; // Garante que a câmera já foi inicializada

    const sensitivity = isMobile() ? 0.004 : 0.002; // Sensibilidade maior para toque

    euler.y -= deltaX * sensitivity;
    euler.x -= deltaY * sensitivity;

    // Limita a rotação vertical para não "quebrar o pescoço"
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    
    camera.quaternion.setFromEuler(euler);
}


export function createPlayer(cam, world) {
    camera = cam; // Armazena a referência da câmera no escopo do módulo
    const playerShape = new CANNON.Sphere(1);
    playerBody = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(0, 10, 0),
        shape: playerShape,
        material: new CANNON.Material({ friction: 0.1 })
    });
    playerBody.linearDamping = 0.9;
    world.addBody(playerBody);

    playerBody.addEventListener('collide', (event) => {
        const contactNormal = new CANNON.Vec3();
        if (event.contact.getImpactVelocityAlongNormal() > 1) {
             event.contact.ni.negate(contactNormal);
             if (contactNormal.y > 0.5) {
                 canJump = true;
             }
        }
    });

    setupControls();
}

// Configura os controles de teclado e mouse
function setupControls() {
    // Teclado
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW': moveState.forward = true; break;
            case 'KeyA': moveState.left = true; break;
            case 'KeyS': moveState.backward = true; break;
            case 'KeyD': moveState.right = true; break;
            case 'KeyE':
            // Se a tecla 'E' for pressionada, chama a função para soltar o item
            handleDrop(camera);
            break;
            case 'Space': attemptJump(); break;
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
        if (!isMobile()) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            // Usa a nova função centralizada para girar a câmera
            rotateCamera(event.movementX, event.movementY);
        }
    });
      // Adiciona um listener para o clique do mouse
    document.addEventListener('mousedown', (event) => {
        // Botão esquerdo do mouse
        if (event.button === 0 && document.pointerLockElement === document.body) {
            triggerInteraction();
        }
    });
}


export function updatePlayer(deltaTime) {
    if (!playerBody) return;

    const speed = 200;
    
    inputVelocity.set(0, 0, 0);
    if (moveState.forward) inputVelocity.z = -speed * deltaTime;
    if (moveState.backward) inputVelocity.z = speed * deltaTime;
    if (moveState.left) inputVelocity.x = -speed * deltaTime;
    if (moveState.right) inputVelocity.x = speed * deltaTime;

    velocity.copy(inputVelocity).applyQuaternion(camera.quaternion);

    playerBody.velocity.x = velocity.x;
    playerBody.velocity.z = velocity.z;

    camera.position.copy(playerBody.position);
    camera.position.y += 0.8; 
}

function isMobile() {
    // Adicionamos 'ontouchstart' in window para uma detecção mais robusta
    return 'ontouchstart' in window || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}