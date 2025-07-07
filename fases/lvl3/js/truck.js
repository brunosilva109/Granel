import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// ✅ 1. IMPORTAR O GLTFLoader
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TruckSettings, GameColors } from './config.js';
import { getRandomMotorIdForSide } from './motors.js';
import { hoseConnectors, handleConnection, isHoseSystemIdle } from './hose.js';
import { resetRefuelSystem } from './refuel.js';
import { showInfoToast, updateObjectiveText } from './ui.js';
import { truckCompletedSuccess } from './gameState.js';
import { importarModelo3D } from './utils.js';

let scene, world;
let trucks = [];

const collisionOffset = {
    x: 0,
    y: 1.75,
    z: -1.5
};



// A função do conector permanece a mesma
function createTruckConnector(truckGroup, truckX) {
    const connectorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: GameColors.CONNECTOR_DEFAULT, roughness: 0.5, metalness: 0.5 });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    
    let connectorXPosition = (truckX < 0) ? -1.3 : 1.3;
    // 💡 ATENÇÃO: Talvez você precise ajustar a posição Y e Z para encaixar no seu novo modelo
    connector.position.set(connectorXPosition, 1.5, 3); 
    connector.rotation.z = Math.PI / 2;
    connector.name = "truck_connector";
    
    connector.userData = {
        isInteractable: true,
        interactionType: 'hose_connector',
        onInteract: () => handleConnection(connector)
    };

    truckGroup.add(connector);
    hoseConnectors.push(connector);
    return connector;
}
export async function setupTruckSystem(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;
    // Chama a função para adicionar o primeiro caminhão na cena
    await addTruck(Math.random() > 0.5 ? 5 : -5, 0, TruckSettings.START_Z);
}
// ✅ 4. A função createTruck agora é ASYNC
async function createTruck(posX, posY, posZ) {
    const tankTruckGroup = new THREE.Group();
    scene.add(tankTruckGroup);

    const { TANK_RADIUS, TANK_LENGTH, WHEEL_RADIUS, WHEEL_WIDTH } = TruckSettings;

    const tankMaterial = new THREE.MeshStandardMaterial({ color: GameColors.TRUCK_TANK, roughness: 0.5, metalness: 0.5 });
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: GameColors.TRUCK_WHEEL, roughness: 0.9, metalness: 0.1 });
    const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.1, metalness: 0.9 });
    
    // ✅ CORREÇÃO PRINCIPAL APLICADA AQUI
    await importarModelo3D({
        caminho: 'truck.glb',
        cena: scene,
        pai: tankTruckGroup, // Dizendo para o modelo ser filho do grupo do caminhão
        escala: new THREE.Vector3(0.6, .6, .6),
        rotacao: new THREE.Euler(0, -Math.PI / 2, 0),
        // Adicionei uma posição para ajudar a alinhar o modelo .glb com o centro do grupo.
        // Você VAI PRECISAR ajustar esses valores para o seu modelo específico.
        posicao: new THREE.Vector3(0, 0, -2.5) 
    });

    // As outras partes são adicionadas normalmente ao grupo
    // 💡 Você precisará ajustar a posição delas para alinhar com o modelo .glb
    
    // Tanque
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(TANK_RADIUS, TANK_RADIUS, TANK_LENGTH, 32), tankMaterial);
    tank.position.set(0, 2, 0); // Posição ajustada
    tank.rotation.x = Math.PI / 2;
    tank.castShadow = true;
    tankTruckGroup.add(tank);
   
    createTruckConnector(tankTruckGroup, posX);

    // A física continua exatamente a mesma, movendo o tankTruckGroup
    const collisionSize = { width: 3, height: 3.5, depth: 10.5 };
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

// ✅ 5. A função addTruck também precisa ser async
async function addTruck(posX, posY, posZ) {
    // E precisa 'esperar' (await) a criação
    const newTruck = await createTruck(posX, posY, posZ);
    trucks.push({
        ...newTruck,
        state: 'going',
        speed: TruckSettings.SPEED,
        selectedMotorId: null,
        refueled: false 
    });
    resetRefuelSystem();
}


// O resto do seu arquivo (updateTrucks, etc.) pode continuar exatamente igual.
// =========================================================================

export function updateTrucks() {
    // Usamos um loop reverso para poder remover caminhões do array sem problemas
    for (let i = trucks.length - 1; i >= 0; i--) {
        const truck = trucks[i];
        const { body, mesh, state, speed } = truck;

        switch (truck.state) {
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
                body.velocity.set(0, 0, 0); // Garante que o caminhão fique parado

                if (truck.refueled && isHoseSystemIdle()) {
                    updateObjectiveText('Caminhão partindo!');
                    truck.state = 'leaving';
                } else {
                    if (truck.selectedMotorId === null) {
                        const side = body.position.x > 0 ? 'right' : 'left';
                        truck.selectedMotorId = getRandomMotorIdForSide(side);
                        updateObjectiveText(`Sistema precisa ser conectado ao Motor ${truck.selectedMotorId}.`);
                    }
                }
                break;
            
            case 'leaving':
                body.velocity.z = -speed * 60;
                if (mesh.userData.wheelGroups) {
                    mesh.userData.wheelGroups.forEach(wheel => wheel.rotation.x += speed * 2);
                }
                
                if (body.position.z < TruckSettings.END_Z) {
                    scene.remove(mesh);
                    truckCompletedSuccess();
                    world.removeBody(body);
                    trucks.splice(i, 1);
                    console.log("Caminhão antigo removido.");
                    
                    setTimeout(() => {
                        console.log("Adicionando novo caminhão.");
                        addTruck(Math.random() > 0.5 ? 5 : -5, 0, TruckSettings.START_Z);
                    }, 3000);
                }
                break;
        }

        if (truck && truck.mesh && truck.body) {
            truck.mesh.position.copy(truck.body.position);
            truck.mesh.quaternion.copy(truck.body.quaternion);
        }
    }
}
export function getSelectedMotorId() {
    const currentTruck = trucks[0]; 
    return currentTruck ? currentTruck.selectedMotorId : null;
}

export function getCurrentTruckConnector() {
    const currentTruck = trucks[0];
    if (!currentTruck) return null;
    return currentTruck.mesh.getObjectByName("truck_connector");
}
export function setTruckAsRefueled(status) {
    const currentTruck = trucks[0];
    if (currentTruck) {
        currentTruck.refueled = status;
    }
}

// Função para criar um "desenho" da caixa de colisão
function criarVisualizadorDeColisao(size, offset) {
    const visualizerGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const visualizerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // Amarelo bem visível
        wireframe: true  // Mostra apenas as linhas
    });
    const visualizerMesh = new THREE.Mesh(visualizerGeometry, visualizerMaterial);
    visualizerMesh.position.set(offset.x, offset.y, offset.z);
    return visualizerMesh;
}