//hose.js
import * as THREE from 'three';
import { GameColors } from './config.js';
import { playerState} from './player.js';
import { isMotorRunning } from './motors.js';
import {areValvesOpenForMotor,areValvesClosedForMotor } from './valves.js';
import { showInfoToast } from './ui.js';
import { addError } from './gameState.js';
import { importarModelo3D } from './utils.js';
import { floatingObjects } from './main.js';
import { completeTask, isTaskCompleted } from './quest.js';
import { getTargetMotorId, getCurrentTruckConnector } from './truck.js';
import { travanolugar} from './trava.js';
import { markAsCollected } from './collectibles.js';



const HOSE_RADIUS = 0.3; 
const HOSE_CURVE_FACTOR = 0.5; 


let scene, world;
const hoseState = { isConnected: false, firstConnector: null, secondConnector: null, mesh: null, points: [], segments: 20, };
export const hoseConnectors = [];

export function setupHoseSystem(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;
    createHosePickup(-25, 0, 35, scene);
}

export async function createHosePickup(x, y, z, scene) {
    const hoseModel = await importarModelo3D({
        caminho: 'assets/mangote.glb',
        cena: scene,
        posicao: new THREE.Vector3(x, y, z),
        isGlowing: true,
        escala: new THREE.Vector3(0.2, 0.2, 0.2)
    });

    if (hoseModel) {
        hoseModel.name = "HosePickup";
        
        hoseModel.userData = {
            isInteractable: true,
            interactionType: 'collect_hose',
            onInteract: () => pickupHose(hoseModel), // Passa o modelo para ser removido
            initialY: 1,
            floatAmplitude:1,
            floatSpeed: 0.1
        };
        
        floatingObjects.push(hoseModel);
    }
}
export function createHoseConnector(position, motorId, parentGroup) {
    const connector = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), new THREE.MeshStandardMaterial({ color: GameColors.CONNECTOR_DEFAULT, roughness: 0.5, metalness: 0.5 }));
    connector.position.copy(position);
    connector.rotation.z = Math.PI / 2;
    connector.name = `motor_connector_${motorId}`;
    connector.userData = { isInteractable: true, interactionType: 'hose_connector', motorId: motorId, onInteract: () => handleConnection(connector) };

    if (parentGroup) {
        parentGroup.add(connector);
    } else {
        scene.add(connector);
    }
    
    hoseConnectors.push(connector);
    return connector;
}

export function handleConnection(clickedConnector) {
    if (hoseState.isConnected) {
        showInfoToast("Clique na mangueira para desconectar.", 3000, 'info');
        return;
    }
    if (!playerState.hasHose) {
        showInfoToast("Você precisa pegar o mangote primeiro!", 3000, 'error');
        addError();
        return;
    }
     if (!travanolugar()) {
        showInfoToast("Posicione a trava de segurança primeiro!", 3000, 'error');
        addError(); // Penaliza o jogador pelo erro
        return;
    }
    // Primeiro clique: seleciona o primeiro conector
    if (!hoseState.firstConnector) {
        hoseState.firstConnector = clickedConnector;
        clickedConnector.material.color.set(GameColors.VALVE_ACTIVE);
        return;
    }

    // Segundo clique: tenta fazer a conexão
    if (hoseState.firstConnector !== clickedConnector && !hoseState.secondConnector) {
        hoseState.secondConnector = clickedConnector;

        const targetMotorId = getTargetMotorId();
        const truckConnector = getCurrentTruckConnector();

        // VALIDAÇÃO PRIMEIRO
        if (targetMotorId === null) {
            showInfoToast("Aguarde um caminhão definir uma tarefa.", 3000, 'info');
            resetFailedConnection();
            return;
        }

        const isConnectionCorrect = 
            (hoseState.firstConnector === truckConnector && hoseState.secondConnector.userData.motorId === targetMotorId) ||
            (hoseState.secondConnector === truckConnector && hoseState.firstConnector.userData.motorId === targetMotorId);

        // AÇÃO DEPOIS
        if (isConnectionCorrect) {
            // --- Conexão CORRETA ---
            hoseState.secondConnector.material.color.set(GameColors.VALVE_ACTIVE);
            hoseState.isConnected = true;
            playerState.hasHose = false;
            
            const start = hoseState.firstConnector.getWorldPosition(new THREE.Vector3());
            const end = hoseState.secondConnector.getWorldPosition(new THREE.Vector3());
            createHoseMesh(start, end);

            showInfoToast("Mangote conectado ao sistema correto!", 3000, 'success');
            completeTask('connect_hose');
        } else {
            // --- Conexão INCORRETA ---
            showInfoToast(`Conexão incorreta! Conecte ao Motor ${targetMotorId}.`, 3000, 'error');
            addError();
            resetFailedConnection();
        }
    }
}


function resetFailedConnection() {
    if (hoseState.firstConnector) {
        hoseState.firstConnector.material.color.set(GameColors.CONNECTOR_DEFAULT);
    }
    hoseState.firstConnector = null;
    hoseState.secondConnector = null;
}

function pickupHose(hoseModel) {
    playerState.hasHose = true;
    showInfoToast("Mangote coletado!", 3000, 'info');
    markAsCollected('hose'); 
    completeTask('collect_hose');
    // Remove da lista de animação
    const index = floatingObjects.indexOf(hoseModel);
    if (index > -1) {
        floatingObjects.splice(index, 1);
    }
    
    // Remove da cena
    scene.remove(hoseModel);
}

function createHoseMesh(startPoint, endPoint) {
    hoseState.points = [];
    for (let i = 0; i <= hoseState.segments; i++) {
        const t = i / hoseState.segments;
        const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);

        midPoint.y -= Math.sin(t * Math.PI) * HOSE_CURVE_FACTOR; 
        hoseState.points.push(midPoint);
    }
    const curve = new THREE.CatmullRomCurve3(hoseState.points);

    const geometry = new THREE.TubeGeometry(curve, hoseState.segments, HOSE_RADIUS, 8, false);
    const material = new THREE.MeshStandardMaterial({ color: GameColors.HOSE });
    hoseState.mesh = new THREE.Mesh(geometry, material);
    
    hoseState.mesh.name = "HoseMesh";
    hoseState.mesh.userData = {
        isInteractable: true,
        interactionType: 'disconnect_hose',
        onInteract: () => disconnectHose()
    };
    
    scene.add(hoseState.mesh);
}

export function updateHoseMesh() {
    if (!hoseState.isConnected || !hoseState.mesh) return;
    
    const startPoint = hoseState.firstConnector.getWorldPosition(new THREE.Vector3());
    const endPoint = hoseState.secondConnector.getWorldPosition(new THREE.Vector3());

    for (let i = 0; i <= hoseState.segments; i++) {
        const t = i / hoseState.segments;
        const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);

        midPoint.y -= Math.sin(t * Math.PI) * HOSE_CURVE_FACTOR;
        hoseState.points[i].copy(midPoint);
    }
    
    hoseState.mesh.geometry.dispose(); 

    hoseState.mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoseState.points), hoseState.segments, HOSE_RADIUS, 8, false);
}

export function disconnectHose() {
    if (!hoseState.isConnected) return;
    const motorConnector = hoseState.firstConnector.userData.motorId ? hoseState.firstConnector : hoseState.secondConnector;
    const motorId = motorConnector.userData.motorId;

    if (isMotorRunning(motorId)) {
        showInfoToast(`PERIGO: Desligue o motor ${motorId}!`, 3000, 'error');
        addError();
        return;
    }
    if (areValvesOpenForMotor(motorId)) {
        showInfoToast(`PERIGO: Feche as válvulas do motor ${motorId} primeiro!`, 3000, 'error');
        addError();
        return;
    }
    if (!areValvesClosedForMotor(motorId)) {
        showInfoToast(`PERIGO: Feche as válvulas do motor ${motorId} primeiro!`, 3000, 'error');
        addError();
        // Aqui você pode mostrar uma mensagem na tela para o jogador
        return;
    }

    showInfoToast("Mangote desconectado com segurança!", 2000, 'info');
    
    if (isTaskCompleted('refuel')) {
        completeTask('disconnect_hose');
    }


    hoseState.firstConnector.material.color.set(GameColors.CONNECTOR_DEFAULT);
    if(hoseState.secondConnector) hoseState.secondConnector.material.color.set(GameColors.CONNECTOR_DEFAULT);
    
    hoseState.firstConnector = null;
    hoseState.secondConnector = null;
    
    scene.remove(hoseState.mesh);
    hoseState.mesh.geometry.dispose();
    hoseState.mesh.material.dispose();
    hoseState.mesh = null;
    
    hoseState.isConnected = false;
    playerState.hasHose = true;
}
export function isHoseConnectedTo(motorId, truckConnector) {
    if (!hoseState.isConnected) return false;

    const c1 = hoseState.firstConnector;
    const c2 = hoseState.secondConnector;
    const isMotorConnected = (c1.userData.motorId === motorId && c2 === truckConnector) || (c2.userData.motorId === motorId && c1 === truckConnector);
    
    return isMotorConnected;
}
export function isHoseSystemIdle() {
    return !hoseState.isConnected;
}