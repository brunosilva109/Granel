// Arquivo: js/main.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { buildWorld, objectsToUpdate, createSceneryTanks } from './world.js';
import { setupMotors } from './motors.js';
import { createPlayer, updatePlayer } from './player.js';
import { setupMobileControls } from './botoes.js';
import { setupTruckSystem, updateTrucks } from './truck.js';
import { setupValves, updateValves } from './valves.js';
import { setupHoseSystem, updateHoseMesh } from './hose.js';
import { initInteractionSystem, checkInteraction } from './interaction.js';
import { setupRefuelSystem, updateRefueling } from './refuel.js';
import { setupGameState, updateGameTimer, isGameRunning } from './gameState.js';
import { setupPauseControls } from './pause.js';

// ✅ Exporta o array para que outros arquivos possam usá-lo
export const floatingObjects = [];

// ---- Configurações Iniciais da Cena e do Renderizador ----
setupGameState();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
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
const physicsWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });


// ✅ CORREÇÃO CRÍTICA: Envolvemos a inicialização em uma função 'async'
async function initGame() {
    console.log("Iniciando construção do mundo...");

    // Usamos 'await' para esperar cada parte que carrega modelos ser concluída
    await buildWorld(scene, physicsWorld);
    createPlayer(camera, physicsWorld);
    await setupHoseSystem(scene, physicsWorld); // Carrega o modelo do mangote
    setupRefuelSystem();
    await setupTruckSystem(scene, physicsWorld); // Carrega o modelo do caminhão
    await setupMotors(scene, physicsWorld);
    await setupValves(scene, physicsWorld);      // Carrega o modelo das válvulas
    await createSceneryTanks(scene);             // Carrega as texturas dos tanques

    // Funções que não carregam nada podem ser chamadas normalmente
    initInteractionSystem(scene, physicsWorld, objectsToUpdate);
    setupPauseControls();
    if (isMobile()) {
        document.getElementById('mobile-controls').classList.add('active');
        document.getElementById('mobile-pause-btn').classList.add('active');
        setupMobileControls();
    }
    
    console.log("Jogo inicializado. Começando animação...");
    // Inicia o loop de animação SÓ DEPOIS que tudo foi carregado
    animate();
}

function isMobile() {
    return 'ontouchstart' in window || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ---- Loop Principal do Jogo (Animate) ----
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (!isGameRunning()) {
        return; // Esta é a lógica de pause, que já está correta.
    }
    
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    physicsWorld.step(1 / 60, deltaTime, 3);

    for (const obj of objectsToUpdate) {
        if (obj.mesh && obj.body) {
            obj.mesh.position.copy(obj.body.position);
            obj.mesh.quaternion.copy(obj.body.quaternion);
        }
    }

    updatePlayer(deltaTime);
    updateTrucks();
    updateValves();
    updateHoseMesh();
    updateGameTimer();
    updateRefueling(deltaTime);
    checkInteraction(camera);
    updateFloatingObjects(elapsedTime); // ✅ CORREÇÃO: Chamada aqui apenas UMA VEZ.

    renderer.render(scene, camera);
}

// A sua função de animação está correta com a lógica do brilho
function updateFloatingObjects(time) {
    for (const object of floatingObjects) {
        object.rotation.y += 0.005;
        const initialY = object.userData.initialY || object.position.y;
        object.position.y = initialY + Math.sin(time * 2) * 0.1;
        object.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissiveIntensity = (Math.sin(time * 3) + 1) / 2;
            }
        });
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ Inicia o jogo chamando a nova função de inicialização.
initGame();