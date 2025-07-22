import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameColors } from './config.js';
import { playerState } from './player.js';
import { isMotorRunning } from './motors.js';
import { showInfoToast } from './ui.js';
import { addError } from './gameState.js';
import { carregarModeloNoCache, clonarModelo } from './utils.js'
import { getTargetMotorId } from './truck.js';
import { updateTaskText, completeTask } from './quest.js'; // Garanta que estas já estão importadas

let scene, world;
const valves = [];
 const moldeDaValvula= await carregarModeloNoCache({ caminho: 'assets/valvula.glb' });
export async function setupValves(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;

    const valveLayout = [
        { motorId: 1, pos: { x: 12.3, z: 8 } }, { motorId: 1, pos: { x:22.55, z: 11.44  } },
        { motorId: 2, pos: { x: 12.3, z: 0 } }, { motorId: 2, pos: { x: 22.45, z: 0} },
        { motorId: 3, pos: { x: 12.3, z: -8 } }, { motorId: 3, pos: { x: 22.55, z: -11.54  } },
        { motorId: 4, pos: { x: -12.4, z: 8 } }, { motorId: 4, pos: { x: -22.55, z: 11.44 } },
        { motorId: 5, pos: { x: -12.4, z: 0 } }, { motorId: 5, pos: { x: -22.45, z: 0 } },
        { motorId: 6, pos: { x: -12.4, z: -8} }, { motorId: 6, pos: { x: -22.55, z: -11.54 } },
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


   
    const valveModel = await clonarModelo(moldeDaValvula, {
            scene: scene,
            pai: valveGroup,
            position: new THREE.Vector3(baseX, baseY+.9, baseZ),
            scale: new THREE.Vector3(0.2, .2, .2)
        });

    if (!valveModel) return;
    
    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Cylinder(0.1, 0.1, 0.1, 16),
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
    // Primeiro, busca o alvo da missão usando a função de truck.js
    const targetMotorId = getTargetMotorId();

    // --- ✅ VERIFICAÇÕES DE SEGURANÇA PRIMEIRO ---

    // 1. Existe uma missão ativa? (Há um caminhão parado?)
    if (targetMotorId === null) {
        showInfoToast("Aguarde a chegada de um caminhão para iniciar a tarefa.", 3000, 'info');
        return; // Impede a ação se nenhum caminhão estiver esperando
    }

    // 2. A válvula clicada é a correta para a missão atual?
    if (valve.motorId !== targetMotorId) {
        showInfoToast(`Válvula incorreta! A missão é para o Motor ${targetMotorId}.`, 3000, 'error');
        addError();
        return; // Impede a ação se a válvula for do motor errado
    }

    // 3. O jogador tem a ferramenta necessária?
    if (!playerState.hasLever) {
        showInfoToast("Você precisa da alavanca para operar esta válvula!", 3000, 'error');
        addError();
        return;
    }
    
    // 4. Se a válvula já está aberta, o motor correspondente está desligado?
    if (valve.activated && isMotorRunning(valve.motorId)) {
        showInfoToast(`Desligue o motor ${valve.motorId} antes de fechar a válvula!`, 3000, 'error');
        addError();
        return;
    }

    // --- SE PASSOU POR TODAS AS VERIFICAÇÕES, A AÇÃO É VÁLIDA ---

    // Inverte o estado da válvula (abrir/fechar)
    valve.activated = !valve.activated;
    valve.isAnimating = true;

    // Atualiza a cor e a rotação alvo com base no novo estado
    if (valve.activated) {
        valve.baseMaterial.color.set(GameColors.VALVE_BASE_ACTIVE);
        valve.targetRotation = Math.PI / 2;
        showInfoToast(`Válvula do motor ${valve.motorId} ABERTA.`, 3000, ' ');
    } else {
        valve.baseMaterial.color.set(GameColors.VALVE_BASE_INACTIVE);
        valve.targetRotation = 0;
        showInfoToast(`Válvula do motor ${valve.motorId} FECHADA.`, 3000, ' ');
    }
    
    // ✅ LÓGICA DA MISSÃO (Executada no final, com o estado já atualizado)
    const motorValves = valves.filter(v => v.motorId === targetMotorId);
    
    // Atualiza a tarefa de ABRIR
    const openCount = motorValves.filter(v => v.activated).length;
    updateTaskText('open_valves', `Abra as válvulas (${openCount}/2)`);
    if (openCount === 2) {
        completeTask('open_valves');
    }

    // Atualiza a tarefa de FECHAR
    const closedCount = motorValves.filter(v => !v.activated).length;
    updateTaskText('close_valves', `Feche as válvulas (${closedCount}/2)`);
    if (closedCount === 2) {
        completeTask('close_valves');
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