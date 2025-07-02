import * as THREE from 'three';
import { GameColors } from './config.js';
import { playerState } from './player.js';
import { isMotorRunning } from './motors.js';
import { areValvesClosedForMotor } from './valves.js';

// =======================================================
// === PAINEL DE CONTROLE DA MANGUEIRA ===
// Altere estes valores para customizar o visual da mangueira
// =======================================================
const HOSE_RADIUS = 0.2; // <<-- GROSSURA: Aumente este valor para uma mangueira mais grossa (ex: 0.25)
const HOSE_CURVE_FACTOR = 0.5; // <<-- CURVA: Diminua para uma mangueira mais reta (ex: 0.2)
// =======================================================

let scene, world;
const hoseState = { isConnected: false, firstConnector: null, secondConnector: null, mesh: null, points: [], segments: 20, };
export const hoseConnectors = [];

export function setupHoseSystem(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;
    createHosePickup(0, 0.5, 5);
}

function createHosePickup(x, y, z) {
    const pickup = new THREE.Mesh( new THREE.CylinderGeometry(0.5, 0.5, 1, 16), new THREE.MeshStandardMaterial({ color: GameColors.HOSE, roughness: 0.7, metalness: 0.3 }) );
    pickup.position.set(x, y, z);
    pickup.name = "HosePickup";
    pickup.userData = { isInteractable: true, interactionType: 'collect_hose', onInteract: pickupHose, };
    scene.add(pickup);
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
        console.log("Clique na mangueira para desconectar.");
        return;
    }
    if (!playerState.hasHose) {
        console.log("Você precisa pegar o mangote primeiro!");
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
        console.log("Mangote conectado!");
    }
}

function pickupHose() {
    if (playerState.hasLever) {
        playerState.hasLever = false; 
        console.log("Você soltou a alavanca para pegar o mangote.");
    }
    playerState.hasHose = true;
    console.log("Mangote coletado!");
}

function createHoseMesh(startPoint, endPoint) {
    hoseState.points = [];
    for (let i = 0; i <= hoseState.segments; i++) {
        const t = i / hoseState.segments;
        const midPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);
        // ✅ Usa a constante do topo do arquivo
        midPoint.y -= Math.sin(t * Math.PI) * HOSE_CURVE_FACTOR; 
        hoseState.points.push(midPoint);
    }
    const curve = new THREE.CatmullRomCurve3(hoseState.points);
    // ✅ Usa a constante do topo do arquivo
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
        // ✅ Usa a constante do topo do arquivo
        midPoint.y -= Math.sin(t * Math.PI) * HOSE_CURVE_FACTOR;
        hoseState.points[i].copy(midPoint);
    }
    
    hoseState.mesh.geometry.dispose(); 
    // ✅ Usa a constante do topo do arquivo
    hoseState.mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoseState.points), hoseState.segments, HOSE_RADIUS, 8, false);
}

export function disconnectHose() {
    if (!hoseState.isConnected) return;
    const motorConnector = hoseState.firstConnector.userData.motorId ? hoseState.firstConnector : hoseState.secondConnector;
    const motorId = motorConnector.userData.motorId;

    if (isMotorRunning(motorId)) {
        console.log(`PERIGO: Não é possível desconectar. O motor ${motorId} está ligado!`);
        return;
    }
    if (!areValvesClosedForMotor(motorId)) {
        console.log(`PERIGO: Não é possível desconectar. Feche as válvulas do motor ${motorId} primeiro!`);
        return;
    }

    console.log("Sistema seguro. Desconectando o mangote...");
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