import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameColors } from './config.js';
import { playerState } from './player.js';
import { isMotorRunning } from './motors.js';
import { showInfoToast } from './ui.js';
import { addError } from './gameState.js';
import { importarModelo3D } from './utils.js';

let scene, world;
const valves = [];

export async function setupValves(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;

    const valveLayout = [
        { motorId: 1, pos: { x: 13.3, z: 8.1 } }, { motorId: 1, pos: { x: 23, z: 12.7 } },
        { motorId: 2, pos: { x: 11.7, z: -.9 } }, { motorId: 2, pos: { x: 22.5, z: -.9 } },
        { motorId: 3, pos: { x: 13.4, z: -9.7 } }, { motorId: 3, pos: { x: 23, z: -14.3 } },
        { motorId: 4, pos: { x: -16, z: 8.2 } }, { motorId: 4, pos: { x: -23, z: 12.7 } },
        { motorId: 5, pos: { x: -14.6, z: -.9 } }, { motorId: 5, pos: { x: -22.8, z: -.9 } },
        { motorId: 6, pos: { x: -16, z: -9.7 } }, { motorId: 6, pos: { x: -23, z: -14.4 } },
    ];


    for (const config of valveLayout) {
        await createValve(config.pos.x, 0.3, config.pos.z, config.motorId);
    }
}
async function createValve(baseX, baseY, baseZ, motorId) {
    const valveGroup = new THREE.Group();
    scene.add(valveGroup);
    const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 24); 
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: GameColors.VALVE_BASE_INACTIVE, 
        metalness: 0.5,
        roughness: 0.6
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 0.3; 
    baseMesh.receiveShadow = true;
    valveGroup.add(baseMesh);


    const valveModel = await importarModelo3D({
        caminho: 'assets/valvula.glb',
        cena: scene,
        pai: valveGroup,
        escala: new THREE.Vector3(0.2, 0.2, 0.2),
        posicao: new THREE.Vector3(0, 0, 0)
    });

    if (!valveModel) return;
    
    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Cylinder(0.4, 0.4, 0.7, 16),
        position: new CANNON.Vec3(baseX, baseY + .9, baseZ)
    });
    world.addBody(body);

    const valveObject = {
        motorId: motorId,
        mesh: valveGroup,
        body: body,
        valveModel: valveModel,
        baseMaterial: baseMaterial, 
        activated: false,
        isAnimating: false,
        targetRotation: 0
    };
    
    valveModel.userData = {
        isInteractable: true,
        interactionType: 'valve_handle',
        onInteract: () => toggleValve(valveObject) 
    };

    valves.push(valveObject);
}
function toggleValve(valve) {
    if (!playerState.hasLever) {
        showInfoToast("Você precisa da alavanca para operar esta válvula!", 3000, 'error');
        addError();
        return;
    }
    if (valve.activated && isMotorRunning(valve.motorId)) {
        showInfoToast(`Desligue o motor ${valve.motorId} antes de fechar a válvula!`, 3000, 'error');
        addError();
        return;
    }

    valve.activated = !valve.activated;
    valve.isAnimating = true;

    if (valve.activated) {
        valve.baseMaterial.color.set(GameColors.VALVE_BASE_ACTIVE);
        valve.targetRotation = Math.PI / 2;
        showInfoToast(`Válvula do motor ${valve.motorId} ABERTA.`, 3000, ' ');
    } else {
        valve.baseMaterial.color.set(GameColors.VALVE_BASE_INACTIVE);
        valve.targetRotation = 0;
        showInfoToast(`Válvula do motor ${valve.motorId} FECHADA.`, 3000, ' ');
    }
}


export function updateValves() {
    for (const valve of valves) {
        valve.mesh.position.copy(valve.body.position);
        valve.mesh.quaternion.copy(valve.body.quaternion);
        if (valve.isAnimating && valve.valveModel) {
            const currentRotation = valve.valveModel.rotation.y;
            const targetRotation = valve.targetRotation;
            
            const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.1);
            valve.valveModel.rotation.y = newRotation;
            if (Math.abs(newRotation - targetRotation) < 0.01) {
                valve.valveModel.rotation.y = targetRotation;
                valve.isAnimating = false;
            }
        }
    }
}

export function areValvesClosedForMotor(motorId) {
    return valves.filter(v => v.motorId === motorId).every(v => !v.activated);
}

export function areValvesOpenForMotor(motorId) {
    const motorValves = valves.filter(v => v.motorId === motorId);
    return motorValves.length >= 2 && motorValves.every(v => v.activated);
}