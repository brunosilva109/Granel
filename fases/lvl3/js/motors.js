import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createHoseConnector } from './hose.js';
import { GameColors } from './config.js';

let scene, world;
const motors = []; // Array para guardar todos os objetos de motor

/**
 * Função principal para inicializar e criar todos os motores na cena.
 */
export function setupMotors(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;

    // Posições e configurações dos 6 motores
    const motorLayout = [
        // Lado Direito
        { id: 1, pos: { x: 15, z: 5 }, side: 'right' },
        { id: 2, pos: { x: 15, z: 0 }, side: 'right' },
        { id: 3, pos: { x: 15, z: -5 }, side: 'right' },
        // Lado Esquerdo
        { id: 4, pos: { x: -15, z: 5 }, side: 'left' },
        { id: 5, pos: { x: -15, z: 0 }, side: 'left' },
        { id: 6, pos: { x: -15, z: -5 }, side: 'left' },
    ];

    motorLayout.forEach(config => {
        createMotor(config.pos.x, 0, config.pos.z, config.id, config.side);
    });
}

/**
 * Cria um único motor completo (visual, físico e interativo).
 */
function createMotor(baseX, baseY, baseZ, id, side) {
    const motorGroup = new THREE.Group();
    motorGroup.position.set(baseX, baseY, baseZ);

    // --- Design Visual (replicado do seu código) ---
    const motorParts = [
        { geo: new THREE.BoxGeometry(4, 0.2, 1.5), color: 0x000000, pos: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.55, 0.55, 1.5, 32), color: 0x0000ff, pos: { x: 1, y: 0.5, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
        { geo: new THREE.CylinderGeometry(0.55, 0.55, 0.3, 32), color: 0x0000ff, pos: { x: -1.5, y: 0.5, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
        { geo: new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32), color: 0x0000ff, pos: { x: -1.5, y: 1.1, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.19, 0.18, 0.1, 32), color: 0x000000, pos: { x: -1.5, y: 1.3, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32), color: GameColors.LEVER, pos: { x: 0, y: 0.7, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
        { geo: new THREE.BoxGeometry(0.3, 0.7, 0.7), color: GameColors.LEVER, pos: { x: 0, y: 0.4, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.2, 0.2, 3, 32), color: GameColors.PIPE, pos: { x: 0, y: 0.5, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
    ];
    
    motorParts.forEach(p => {
        const material = new THREE.MeshStandardMaterial({ color: p.color });
        const mesh = new THREE.Mesh(p.geo, material);
        mesh.position.set(p.pos.x, p.pos.y, p.pos.z);
        mesh.rotation.set(p.rot.x, p.rot.y, p.rot.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        motorGroup.add(mesh);
    });

    // --- Painel Interativo ---
    const panel = createMotorPanel();
    panel.position.set(1.5, 1.0, 0.5); // Posição relativa ao motor
    motorGroup.add(panel);

    // --- Plaquinha de Identificação ---
    const idPlate = createIdPlate(id);
    idPlate.position.set(0, 1.5, -0.8);
    motorGroup.add(idPlate);
    scene.add(motorGroup);
     // ✅ ADICIONA O CONECTOR DO MOTOR
    const motorConnectorPosition = new THREE.Vector3(baseX, 1, baseZ - 2); // Posição do conector
    createHoseConnector(motorConnectorPosition, id);

    // --- Corpo Físico para Colisão ---
    const collisionShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.75));
    const motorBody = new CANNON.Body({
        mass: 0, // Estático
        position: new CANNON.Vec3(baseX, baseY , baseZ),
        shape: collisionShape
    });
    // Aplica a rotação desejada no corpo físico
    if (id > 3) {
        motorBody.quaternion.setFromEuler(0, Math.PI, 0); 
    }
    
    world.addBody(motorBody);
    
    // Posição
    motorGroup.position.copy(motorBody.position);
    // Rotação
    motorGroup.quaternion.copy(motorBody.quaternion);
    // Armazena todas as informações importantes no objeto do motor
    const motorObject = {
        id: id,
        side: side,
        mesh: motorGroup,
        body: motorBody,
        panel: panel,
        running: false
    };
    
    // Permite que o botão interaja com este motor específico
    panel.userData.motorInstance = motorObject;
    
    motors.push(motorObject);
}

// Em js/motors.js

function createMotorPanel() {
    const panelGroup = new THREE.Group();
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    panelGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), panelMaterial));

    const onLight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x000000 }));
    onLight.position.set(-0.1, 0.15, 0.1);
    panelGroup.add(onLight);

    const offLight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff0000 }));
    offLight.position.set(0.1, 0.15, 0.1);
    panelGroup.add(offLight);
    
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x0088ff }));
    button.rotation.x = Math.PI / 2;
    button.position.set(0, -0.05, 0.1);
    
    // ✅ MUDANÇA: Damos um nome ao botão para ajudar na depuração
    button.name = 'motor_button'; 
    
    button.userData = {
        isInteractable: true,
        interactionType: 'motor_button',
        onInteract: () => toggleMotor(panelGroup.userData.motorInstance)
    };
    panelGroup.add(button);
    
    panelGroup.userData.lights = { on: onLight, off: offLight };

    return panelGroup;
}

function createIdPlate(id) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, 64, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), material);
    return mesh;
}

function toggleMotor(motor) {
    // A lógica de verificação (se o mangote está conectado, etc.) virá depois
    // Por enquanto, apenas liga e desliga
    motor.running = !motor.running;
    
    const lights = motor.panel.userData.lights;
    if (motor.running) {
        lights.on.material.emissive.setHex(0x00ff00);
        lights.off.material.emissive.setHex(0x000000);
        console.log(`Motor ${motor.id} LIGADO`);
    } else {
        lights.on.material.emissive.setHex(0x000000);
        lights.off.material.emissive.setHex(0xff0000);
        console.log(`Motor ${motor.id} DESLIGADO`);
    }
}

/**
 * Pega um ID de motor aleatório do lado especificado ('left' ou 'right').
 */
export function getRandomMotorIdForSide(side) {
    const sideMotors = motors.filter(m => m.side === side);
    if (sideMotors.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * sideMotors.length);
    return sideMotors[randomIndex].id;
}
export function isMotorRunning(motorId) {
    const motor = motors.find(m => m.id === motorId);
    return motor ? motor.running : false;
}