import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createHoseConnector } from './hose.js';
import { GameColors } from './config.js';
import { getTargetMotorId, getCurrentTruckConnector } from './truck.js';
import { isHoseConnectedTo } from './hose.js';
import { areValvesOpenForMotor } from './valves.js';
import { startRefueling, stopRefueling } from './refuel.js';
import { showInfoToast} from './ui.js';
import { addError } from './gameState.js';
import { completeTask, isTaskCompleted } from './quest.js';
let scene, world;
const motors = [];

export function setupMotors(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;

    // Posições e configurações dos 6 motores
    const motorLayout = [
        // Lado Direito   
        { id: 1, pos: { x: 17, z: 8 }, side: 'right' },
        { id: 2, pos: { x: 17, z: 0 }, side: 'right' },
        { id: 3, pos: { x: 17, z: -8 }, side: 'right' },
        // Lado Esquerdo
        { id: 4, pos: { x: -17, z: 8 }, side: 'left' },
        { id: 5, pos: { x: -17    , z: 0 }, side: 'left' },
        { id: 6, pos: { x: -17, z: -8}, side: 'left' },
    ];

    motorLayout.forEach(config => {
        createMotor(config.pos.x, 0, config.pos.z, config.id, config.side);
    });
}
function createMotor(baseX, baseY, baseZ, id, side) {
    const motorGroup = new THREE.Group();
    motorGroup.position.set(baseX, baseY, baseZ);

    // --- Design Visual (replicado do seu código) ---
    const motorParts = [
        { geo: new THREE.BoxGeometry(4, 0.2, 1.5), color: 0x000000, pos: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.75, 0.75, 1.7, 32), color: 0x0000ff, pos: { x: 1, y: 0.5, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
        { geo: new THREE.CylinderGeometry(0.75, 0.75, 0.7, 32), color: 0x0000ff, pos: { x: -1.5, y: 0.5, z: 0 }, rot: { x: 0, y: 0, z: Math.PI / 2 } },
        { geo: new THREE.CylinderGeometry(0.35, 0.15, 0.8, 32), color: 0x0000ff, pos: { x: -1.5, y: 1.1, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
        { geo: new THREE.CylinderGeometry(0.39, 0.38, 0.3, 32), color: 0x000000, pos: { x: -1.5, y: 1.66, z: 0 }, rot: { x: 0, y: 0, z: 0 } },
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
    panel.position.set(1.5, 1.0, 0.7);
    motorGroup.add(panel);

    // --- Plaquinha de Identificação ---
    const idPlate = createIdPlate(id);
    idPlate.position.set(0, 1.5, 0);
    idPlate.rotation.y = -Math.PI/2;
    motorGroup.add(idPlate);
    scene.add(motorGroup);
     let posXC;
     if(baseX>=0) posXC =baseX-5.25;
     else posXC =baseX+5.25;
    const motorConnectorPosition = new THREE.Vector3(posXC, 0.7, baseZ); 
    createHoseConnector(motorConnectorPosition, id);

    // --- Corpo Físico para Colisão ---
    const collisionShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.75));
    const motorBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(baseX, baseY , baseZ),
        shape: collisionShape
    });
    if (id > 3) {
        motorBody.quaternion.setFromEuler(0, Math.PI, 0); 
    }
    
    world.addBody(motorBody);
    
    motorGroup.position.copy(motorBody.position);
    motorGroup.quaternion.copy(motorBody.quaternion);
    const motorObject = {
        id: id,
        side: side,
        mesh: motorGroup,
        body: motorBody,
        panel: panel,
        running: false
    };
    panel.userData.motorInstance = motorObject;
    
    motors.push(motorObject);
}



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
    if (motor.running) {
        motor.running = false;
        
        const lights = motor.panel.userData.lights;
        lights.on.material.emissive.setHex(0x000000);
        lights.off.material.emissive.setHex(0xff0000);
        console.log(`Motor ${motor.id} DESLIGADO.`);
        if (isTaskCompleted('refuel')) {
            completeTask('turn_off_motor');
        }
         stopRefueling();
        return;
    }

    // --- VERIFICAÇÕES PARA LIGAR O MOTOR ---
    const targetMotorId = getTargetMotorId();
    const truckConnector = getCurrentTruckConnector();


    if (motor.id !== targetMotorId ) {
        showInfoToast(`AÇÃO BLOQUEADA: Este não é o motor correto. O caminhão selecionou o motor ${selectedMotorId}.`, 3000, 'error');
        addError();
        return;
    }

    if (!isHoseConnectedTo(motor.id, truckConnector)) {
        showInfoToast(`AÇÃO BLOQUEADA: Conecte a mangueira entre o motor ${motor.id} e o caminhão.`, 3000, 'error');
        addError();
        return;
    }

    if (!areValvesOpenForMotor(motor.id)) {
        showInfoToast(`AÇÃO BLOQUEADA: Abra as duas válvulas do motor ${motor.id} primeiro.`, 3000, 'error');
        addError();
        return;
    }

    showInfoToast(`Sistema OK! Ligando o motor e iniciando abastecimento...`, 3000, 'info');
    
    motor.running = true;
    const lights = motor.panel.userData.lights;
    lights.on.material.emissive.setHex(0x00ff00);
    lights.off.material.emissive.setHex(0x000000);
    
     startRefueling(); 
}

export function getRandomMotorIdForSide(side) {
    const sideMotors = motors.filter(m => m.side === side);
    if (sideMotors.length === 0) return null;
    
    let randomIndex = Math.floor(Math.random() * sideMotors.length);
    return sideMotors[randomIndex].id;
}
export function isMotorRunning(motorId) {
    const motor = motors.find(m => m.id === motorId);
    return motor ? motor.running : false;
}