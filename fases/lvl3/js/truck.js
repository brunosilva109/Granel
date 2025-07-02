import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TruckSettings, GameColors } from './config.js';
import { getRandomMotorIdForSide } from './motors.js';
import { hoseConnectors, handleConnection } from './hose.js';

let scene, world;
let trucks = []; // Gerencia múltiplos caminhões

// "Painel de Controle" da Colisão
const collisionOffset = {
    x: 0,
    y: 1.75,
    z: 3.0
};

// Função de inicialização
export function setupTruckSystem(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;
    addTruck(5, 0, TruckSettings.START_Z);
}

// Em js/truck.js

function createTruckConnector(truckGroup, truckX) {
    // ... (geometria e material do conector continuam iguais)
    const connectorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: GameColors.CONNECTOR_DEFAULT, roughness: 0.5, metalness: 0.5 });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    
    let connectorXPosition = (truckX < 0) ? -1.5 : 1.5;
    connector.position.set(connectorXPosition, 1, 5.5);
    connector.rotation.z = Math.PI / 2;
    connector.name = "truck_connector";
    
    // ✅ ATUALIZA O USERDATA PARA USAR O NOVO SISTEMA
    connector.userData = {
        isInteractable: true,
        interactionType: 'hose_connector',
        onInteract: () => handleConnection(connector) // Chama a função central do hose.js
    };

    truckGroup.add(connector);
    hoseConnectors.push(connector); // Adiciona ao array global de conectores
    return connector;
}

function createTruck(posX, posY, posZ) {
    const tankTruckGroup = new THREE.Group();
    scene.add(tankTruckGroup);

    const { CABIN_WIDTH, CABIN_HEIGHT, CABIN_DEPTH, TANK_RADIUS, TANK_LENGTH, WHEEL_RADIUS, WHEEL_WIDTH } = TruckSettings;

    // --- Materiais Específicos ---
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: GameColors.TRUCK_CABIN, roughness: 0.6, metalness: 0.4 });
    const tankMaterial = new THREE.MeshStandardMaterial({ color: GameColors.TRUCK_TANK, roughness: 0.5, metalness: 0.5 });
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: GameColors.TRUCK_WHEEL, roughness: 0.9, metalness: 0.1 });
    const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.1, metalness: 0.9 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.8 });
    const chassisMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const taillightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
    // NOVO MATERIAL PARA FARÓIS
    const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 1 });

    // --- Chassi, Cabine, Janelas, etc... (todo o código visual anterior) ---
    const chassisGeometry = new THREE.BoxGeometry(CABIN_WIDTH - 0.5, 0.3, TANK_LENGTH + CABIN_DEPTH);
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassis.position.set(0, WHEEL_RADIUS - 0.15, (TANK_LENGTH + CABIN_DEPTH) / 2 - 1);
    tankTruckGroup.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(CABIN_WIDTH, CABIN_HEIGHT, CABIN_DEPTH), cabinMaterial);
    cabin.position.set(0, CABIN_HEIGHT / 2 + WHEEL_RADIUS, 0);
    cabin.castShadow = true;
    tankTruckGroup.add(cabin);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(CABIN_WIDTH - 0.5, CABIN_HEIGHT - 2, 0.1), windowMaterial);
    windshield.position.set(0, cabin.position.y + 0.5, -CABIN_DEPTH / 2 - 0.05);
    tankTruckGroup.add(windshield);
    const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, CABIN_HEIGHT / 4, CABIN_DEPTH - 0.8), windowMaterial);
    const leftSideWindow = sideWindow.clone();
    leftSideWindow.position.set(-CABIN_WIDTH / 2 + 0.03, cabin.position.y + 0.5, 0);
    tankTruckGroup.add(leftSideWindow);
    const rightSideWindow = sideWindow.clone();
    rightSideWindow.position.set(CABIN_WIDTH / 2 - 0.03, cabin.position.y + 0.5, 0);
    tankTruckGroup.add(rightSideWindow);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(CABIN_WIDTH + 0.1, 0.3, 0.3), chromeMaterial);
    bumper.position.set(0, WHEEL_RADIUS, -CABIN_DEPTH / 2 - 0.1);
    tankTruckGroup.add(bumper);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(TANK_RADIUS, TANK_RADIUS, TANK_LENGTH, 32), tankMaterial);
    tank.position.set(0, TANK_RADIUS + WHEEL_RADIUS, TANK_LENGTH / 2 + CABIN_DEPTH / 2);
    tank.rotation.x = Math.PI / 2;
    tank.castShadow = true;
    tankTruckGroup.add(tank);
    const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, CABIN_HEIGHT + 0.5, 12), chromeMaterial);
    const leftExhaust = exhaustPipe.clone();
    leftExhaust.position.set(-CABIN_WIDTH / 2 + 0.3, cabin.position.y, CABIN_DEPTH / 2 + 0.3);
    tankTruckGroup.add(leftExhaust);
    const rightExhaust = exhaustPipe.clone();
    rightExhaust.position.set(CABIN_WIDTH / 2 - 0.3, cabin.position.y, CABIN_DEPTH / 2 + 0.3);
    tankTruckGroup.add(rightExhaust);
    const wheelPositions = [ { x: -CABIN_WIDTH / 2 - WHEEL_WIDTH / 2, z: -CABIN_DEPTH / 2 + 0.5 }, { x: CABIN_WIDTH / 2 + WHEEL_WIDTH / 2, z: -CABIN_DEPTH / 2 + 0.5 }, { x: -CABIN_WIDTH / 2 - WHEEL_WIDTH / 2, z: CABIN_DEPTH / 2 - 0.5 + 4 }, { x: CABIN_WIDTH / 2 + WHEEL_WIDTH / 2, z: CABIN_DEPTH / 2 - 0.5 + 4 } ];
    const wheelGroups = [];
    wheelPositions.forEach(pos => { const wheelGroup = new THREE.Group(); const wheel = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 32), wheelMaterial); wheel.rotation.z = Math.PI / 2; wheel.castShadow = true; wheelGroup.add(wheel); const rim = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_RADIUS * 0.6, WHEEL_RADIUS * 0.6, WHEEL_WIDTH + 0.05, 16), chromeMaterial); rim.rotation.z = Math.PI / 2; wheelGroup.add(rim); wheelGroup.position.set(pos.x, WHEEL_RADIUS, pos.z); wheelGroups.push(wheelGroup); tankTruckGroup.add(wheelGroup); });
    tankTruckGroup.userData.wheelGroups = wheelGroups;
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), taillightMaterial);
    const leftTaillight = taillight.clone();
    leftTaillight.position.set(-CABIN_WIDTH / 2 + 0.5, WHEEL_RADIUS, TANK_LENGTH + CABIN_DEPTH - 1.2);
    tankTruckGroup.add(leftTaillight);
    const rightTaillight = taillight.clone();
    rightTaillight.position.set(CABIN_WIDTH / 2 - 0.5, WHEEL_RADIUS, TANK_LENGTH + CABIN_DEPTH - 1.2);
    tankTruckGroup.add(rightTaillight);

    // --- Faróis e Luzes ---
    const headlightY = cabin.position.y - 0.5; // Altura dos faróis
    const headlightZ = -CABIN_DEPTH / 2 - 0.05; // Posição frontal
    const headlightGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.15, 16);

    // Farol esquerdo (Mesh visível)
    const leftHeadlightMesh = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlightMesh.position.set(-CABIN_WIDTH / 2 + 0.6, headlightY, headlightZ);
    leftHeadlightMesh.rotation.x = Math.PI / 2;
    tankTruckGroup.add(leftHeadlightMesh);

    // Farol direito (Mesh visível)
    const rightHeadlightMesh = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlightMesh.position.set(CABIN_WIDTH / 2 - 0.6, headlightY, headlightZ);
    rightHeadlightMesh.rotation.x = Math.PI / 2;
    tankTruckGroup.add(rightHeadlightMesh);
    
    // Alvo para onde as luzes apontam (um objeto invisível na frente do caminhão)
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, headlightY, -20); // 20 unidades à frente
    tankTruckGroup.add(lightTarget);

    // Luz esquerda (SpotLight que ilumina a cena)
    const leftSpotLight = new THREE.SpotLight(0xffffff, 50, 40, Math.PI / 6, 0.5, 2);
    leftSpotLight.position.copy(leftHeadlightMesh.position);
    leftSpotLight.target = lightTarget;
    leftSpotLight.castShadow = true; // Pode impactar a performance
    tankTruckGroup.add(leftSpotLight);

    // Luz direita (SpotLight que ilumina a cena)
    const rightSpotLight = new THREE.SpotLight(0xffffff, 50, 40, Math.PI / 6, 0.5, 2);
    rightSpotLight.position.copy(rightHeadlightMesh.position);
    rightSpotLight.target = lightTarget;
    rightSpotLight.castShadow = true; // Pode impactar a performance
    tankTruckGroup.add(rightSpotLight);


    // --- Conector ---
    createTruckConnector(tankTruckGroup, posX);

    // --- PARTE FÍSICA (Lógica de colisão mantida) ---
    const collisionSize = { width: 4, height: 3.5, depth: 8.5 };
    const truckBody = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.KINEMATIC,
        position: new CANNON.Vec3(posX, posY, posZ)
    });
    const collisionBoxShape = new CANNON.Box(new CANNON.Vec3(collisionSize.width / 2, collisionSize.height / 2, collisionSize.depth / 2));
    truckBody.addShape(collisionBoxShape, new CANNON.Vec3(collisionOffset.x, collisionOffset.y, collisionOffset.z));
    world.addBody(truckBody);
    
    tankTruckGroup.position.copy(truckBody.position);
    
    return { mesh: tankTruckGroup, body: truckBody };
}

// O restante do arquivo (addTruck, updateTrucks) permanece exatamente igual.
// ... (copie e cole o resto do seu arquivo aqui se necessário)
function addTruck(posX, posY, posZ) {
    const newTruck = createTruck(posX, posY, posZ);
    trucks.push({
        ...newTruck,
        state: 'going',
        speed: TruckSettings.SPEED,
        selectedMotorId: null
    });
}

export function updateTrucks() {
    const activeTrucks = [];
    for (const truck of trucks) {
        const { body, mesh, state, speed } = truck;
        switch (state) {
            case 'going':
                body.velocity.z = -speed * 60;
                if (mesh.userData.wheelGroups) {
                    mesh.userData.wheelGroups.forEach(wheel => wheel.rotation.x += speed * 2);
                }
                if (body.position.z <= TruckSettings.PAUSE_Z) {
                    body.position.z = TruckSettings.PAUSE_Z;
                    body.velocity.set(0, 0, 0);
                    truck.state = 'pausing';
                }
                break;
            case 'pausing':
                body.velocity.set(0, 0, 0);

                // --- LÓGICA DE SELEÇÃO DE MOTOR ---
                if (truck.selectedMotorId === null) { // Usa uma propriedade do caminhão
                    const side = body.position.x > 0 ? 'right' : 'left';
                    truck.selectedMotorId = getRandomMotorIdForSide(side);
                    console.log(`Caminhão na pista '${side}' selecionou o motor ${truck.selectedMotorId}`);
                }
                
                // Futuramente, a UI mostraria esta informação
                // document.getElementById('objective').innerHTML = `Ligue o motor ${truck.selectedMotorId}`;
                break;
        }
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
        if (body.position.z > TruckSettings.END_Z) {
            activeTrucks.push(truck);
        } else {
            scene.remove(mesh);
            world.removeBody(body);
        }
    }
    trucks = activeTrucks;
    if (trucks.length === 0) {
        setTimeout(() => {
            addTruck(Math.random() > 0.5 ? 5 : -5, 0, TruckSettings.START_Z);
        }, 3000);
    }
}