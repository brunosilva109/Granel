import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { buildWorld, objectsToUpdate,createSceneryTanks } from './world.js';
import { setupMotors } from './motors.js';
import { createPlayer, updatePlayer } from './player.js';
import { setupMobileControls } from './botoes.js';
import { setupTruckSystem, updateTrucks } from './truck.js';
import { setupValves, updateValves } from './valves.js';
import { setupHoseSystem, updateHoseMesh } from './hose.js';
import { initInteractionSystem, checkInteraction} from './interaction.js';
import { setupRefuelSystem, updateRefueling } from './refuel.js';
import { setupGameState, updateGameTimer,isGameRunning  } from './gameState.js';


setupGameState();
// ---- Cena e Câmera ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export const floatingObjects = []; 
// ---- Renderizador ----
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// ---- Luzes ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// ---- Mundo da Física ----
const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
});

// ---- Construção do Mundo e do Jogador ----

buildWorld(scene, physicsWorld);
createPlayer(camera, physicsWorld);
setupHoseSystem(scene, physicsWorld);
setupRefuelSystem();
setupTruckSystem(scene, physicsWorld);
setupMotors(scene, physicsWorld); 
setupValves(scene, physicsWorld);  
createSceneryTanks(scene);

// ---- INICIALIZA O SISTEMA DE INTERAÇÃO (COM O PARÂMETRO CORRETO) ----
initInteractionSystem(scene, physicsWorld, objectsToUpdate);

// ---- Lógica de Detecção de Celular ----
function isMobile() {
    return 'ontouchstart' in window || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.getElementById('mobile-controls').classList.add('active');
    setupMobileControls();
}

// ---- Loop Principal do Jogo (Animate) ----
const clock = new THREE.Clock();

function animate() {
    // 1. Pede o próximo quadro. Isso garante que a animação continue fluida.
    requestAnimationFrame(animate);

    if (!isGameRunning()) {
        return;
    }
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    physicsWorld.step(1 / 60, deltaTime, 3);

    for (const obj of objectsToUpdate) {
        if(obj.mesh && obj.body) {
          obj.mesh.position.copy(obj.body.position);
          obj.mesh.quaternion.copy(obj.body.quaternion);
        }
    }
    
    updatePlayer(deltaTime);
    updateTrucks();
    updateValves();
    updateHoseMesh();
    updateGameTimer();
    updateFloatingObjects(elapsedTime);
    updateRefueling(deltaTime);
    checkInteraction(camera);

    renderer.render(scene, camera);


}
export function updateFloatingObjects(time) {
    for (const object of floatingObjects) {
        // 1. Animação de ROTAÇÃO
        object.rotation.y += 0.005; // Gira lentamente no eixo Y

        // 2. Animação de FLUTUAÇÃO (movimento de sobe e desce)
        // Usamos a posição Y inicial para que ele flutue em torno do seu lugar original
        const initialY = object.userData.initialY || object.position.y;
        object.position.y = initialY + Math.sin(time * 2) * 0.1; // (velocidade) * amplitude

        // 3. Animação de BRILHO (pulsante)
        object.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                // O brilho vai de 0 a 1 e volta, em um ciclo suave
                child.material.emissiveIntensity = (Math.sin(time * 3) + 1) / 2;
            }
        });
    }
}
// Lidar com redimensionamento da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicia o jogo
animate();