import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { buildWorld, objectsToUpdate } from './world.js';
import { createPlayer, updatePlayer } from './player.js';

// ---- Cena e Câmera ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cor de céu
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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
    gravity: new CANNON.Vec3(0, -9.82, 0), // Gravidade padrão
});

// ---- Construção do Mundo e do Jogador ----
buildWorld(scene, physicsWorld);
createPlayer(camera, physicsWorld);

// ---- Lógica de Detecção de Celular ----
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.getElementById('mobile-controls').classList.add('active');
    // A lógica dos botões de toque viria aqui, no futuro `botoes.js`
}

// ---- Loop Principal do Jogo (Animate) ----
const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();

    // 1. Atualiza o mundo da física
    physicsWorld.step(1 / 60, deltaTime, 3);

    // 2. Atualiza os objetos dinâmicos (sincroniza visual com físico)
    for (const obj of objectsToUpdate) {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    }
    
    // 3. Atualiza a lógica do jogador (movimento e câmera)
    updatePlayer(deltaTime);

    // 4. Renderiza a cena
    renderer.render(scene, camera);

    // Chama o próximo frame
    requestAnimationFrame(animate);
}

// Lidar com redimensionamento da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicia o jogo
animate();