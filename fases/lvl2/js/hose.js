import * as THREE from 'three';
import { GameColors } from './config.js';
import { playerState} from './player.js';
import { isMotorRunning } from './motors.js';
import {areValvesOpenForMotor,areValvesClosedForMotor } from './valves.js';
import { showInfoToast } from './ui.js';
import { addError } from './gameState.js';
import { importarModelo3D } from './utils.js';
import { floatingObjects } from './main.js';


const HOSE_RADIUS = 0.3; 
const HOSE_CURVE_FACTOR = 0.5; 


let scene, world;
const hoseState = { isConnected: false, firstConnector: null, secondConnector: null, mesh: null, points: [], segments: 20, };
export const hoseConnectors = [];

export function setupHoseSystem(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;
    createHosePickup(0, 0, 5, scene);
}

async function createHosePickup(x, y, z, scene) {
    const hoseModel = await importarModelo3D({
        caminho: 'assets/mangote.glb', // 👈 Coloque o nome do seu modelo aqui
        cena: scene,
        posicao: new THREE.Vector3(x, y, z),
        isGlowing: true,
        // Ajuste a escala conforme o tamanho do seu modelo
        escala: new THREE.Vector3(0.5, 0.5, 0.5) 
    });

    // Se o modelo foi carregado com sucesso, aplicamos as propriedades
    if (hoseModel) {
        hoseModel.name = "HosePickup";
        hoseModel.userData.initialY = y; // Guarda a posição Y inicial
        floatingObjects.push(hoseModel);
        // A lógica de interação é aplicada diretamente no modelo carregado
        hoseModel.userData = {
            isInteractable: true,
            interactionType: 'collect_hose',
            onInteract: pickupHose,
            initialY: 1,             
            floatAmplitude: 0.005,   
            floatSpeed: 1.5           
        };
    }
}

export function createHoseConnector(position, motorId) {
    const connector = new THREE.Mesh( new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), new THREE.MeshStandardMaterial({ color: GameColors.CONNECTOR_DEFAULT, roughness: 0.5, metalness: 0.5 }) );
    connector.position.copy(position);
    connector.rotation.z = Math.PI / 2;
    connector.name = `motor_connector_${motorId}`;
    connector.userData = { isInteractable: true, interactionType: 'hose_connector', motorId: motorId, onInteract: () => handleConnection(connector) };
    scene.add(connector);
    hoseConnectors.push(connector);
    return connector;
}

export function handleConnection(connector) {
    if (hoseState.isConnected) {
        showInfoToast("Clique na mangueira para desconectar.", 3000, 'info');
        
        return;
    }
    if (!playerState.hasHose) {
        showInfoToast("Você precisa pegar o mangote primeiro!", 3000, 'erro');
        addError();
        return;
    }
    if (!hoseState.firstConnector) {
        hoseState.firstConnector = connector;
        connector.material.color.set(GameColors.VALVE_ACTIVE);
    } else if (hoseState.firstConnector !== connector && !hoseState.secondConnector) {
        hoseState.secondConnector = connector;
        connector.material.color.set(GameColors.VALVE_ACTIVE);
        hoseState.isConnected = true;
        playerState.hasHose = false;
        const start = hoseState.firstConnector.getWorldPosition(new THREE.Vector3());
        const end = hoseState.secondConnector.getWorldPosition(new THREE.Vector3());
        createHoseMesh(start, end);
        showInfoToast("Mangote conectado!.", 3000, 'info');
        
    }
}

function pickupHose() {
    
    playerState.hasHose = true;
    showInfoToast("Mangote coletado!", 3000, 'info');
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
    hoseState.firstConnector.material.color.set(GameColors.CONNECTOR_DEFAULT);
    hoseState.secondConnector.material.color.set(GameColors.CONNECTOR_DEFAULT);
    
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