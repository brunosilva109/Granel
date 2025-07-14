import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TruckSettings, GameColors } from './config.js';
import { getRandomMotorIdForSide } from './motors.js';
import { hoseConnectors, handleConnection, isHoseSystemIdle } from './hose.js';
import { resetRefuelSystem } from './refuel.js';
import { updateObjectiveText } from './ui.js';
import { truckCompletedSuccess } from './gameState.js';
import { importarModelo3D } from './utils.js';

let scene, world;
let trucks = [];

const collisionOffset = {
    x: 0,
    y: 1.75,
    z: -1.5
};

function createTruckConnector(truckGroup, truckX) {
    const connectorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: GameColors.CONNECTOR_DEFAULT, roughness: 0.5, metalness: 0.5 });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    
    let connectorXPosition = (truckX < 0) ? -1 : 1;
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
    await addTruck(Math.random() > 0.5 ? 5 : -5, 0, TruckSettings.START_Z);
}
async function createTruck(posX, posY, posZ) {
    const tankTruckGroup = new THREE.Group();
    scene.add(tankTruckGroup);

    
    await importarModelo3D({
        caminho: 'assets/truck.glb',
        cena: scene,
        pai: tankTruckGroup,
        escala: new THREE.Vector3(1, 1, 1),
        rotacao: new THREE.Euler(0, 0, 0),
        posicao: new THREE.Vector3(0, -.25, -1) 
    });


   
    createTruckConnector(tankTruckGroup, posX);
    const collisionSize = { width: 2.5, height: 2.5, depth: 12.5 };
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
async function addTruck(posX, posY, posZ) {
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
export function updateTrucks() {
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
                body.velocity.set(0, 0, 0);

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
                    truck.selectedMotorId = null;
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
function criarVisualizadorDeColisao(size, offset) {
    const visualizerGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const visualizerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, 
        wireframe: true 
    });
    const visualizerMesh = new THREE.Mesh(visualizerGeometry, visualizerMaterial);
    visualizerMesh.position.set(offset.x, offset.y, offset.z);
    return visualizerMesh;
}