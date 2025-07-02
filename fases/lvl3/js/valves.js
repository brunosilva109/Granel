import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameColors } from './config.js';
import { playerState } from './player.js'; // Importa o estado do jogador para saber se ele tem a alavanca

let scene, world;
const valves = []; // Array para guardar todas as válvulas

/**
 * Função principal para inicializar e criar todas as válvulas na cena.
 */
export function setupValves(mainScene, mainWorld) {
    scene = mainScene;
    world = mainWorld;

    // Layout das 12 válvulas, associadas aos motores
    const valveLayout = [
        // Válvulas do lado direito
        { motorId: 1, pos: { x: 12, z: 14 } }, { motorId: 1, pos: { x: 12, z: 16 } },
        { motorId: 2, pos: { x: 12, z: -1 } }, { motorId: 2, pos: { x: 12, z: 1 } },
        { motorId: 3, pos: { x: 12, z: -16 } }, { motorId: 3, pos: { x: 12, z: -14 } },
        // Válvulas do lado esquerdo
        { motorId: 4, pos: { x: -12, z: 14 } }, { motorId: 4, pos: { x: -12, z: 16 } },
        { motorId: 5, pos: { x: -12, z: -1 } }, { motorId: 5, pos: { x: -12, z: 1 } },
        { motorId: 6, pos: { x: -12, z: -16 } }, { motorId: 6, pos: { x: -12, z: -14 } },
    ];

    valveLayout.forEach(config => {
        createValve(config.pos.x, 0, config.pos.z, config.motorId);
    });
}

/**
 * Cria uma única válvula completa (visual, física e interativa).
 */
function createValve(baseX, baseY, baseZ, motorId) {
    const valveGroup = new THREE.Group();
    scene.add(valveGroup);

    const valveMaterial = new THREE.MeshStandardMaterial({
        color: GameColors.VALVE_INACTIVE,
        roughness: 0.3,
        metalness: 0.7
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.7, 16), valveMaterial);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), valveMaterial);
    handle.position.y = 0.45;
    
    // O handle (a alavanca vermelha/verde) é o objeto com o qual interagimos
    handle.userData = {
        isInteractable: true,
        interactionType: 'valve_handle',
        // A função a ser chamada quando interagimos com este handle específico
        onInteract: () => toggleValve(valveObject) 
    };
    
    valveGroup.add(base, handle);
    
    // Corpo físico para a base da válvula
    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Cylinder(0.4, 0.4, 0.7, 16),
        position: new CANNON.Vec3(baseX, baseY + 0.35, baseZ)
    });
    world.addBody(body);

    // Objeto que armazena todas as informações e estado da válvula
    const valveObject = {
        motorId: motorId,
        mesh: valveGroup,
        body: body,
        handle: handle,
        material: valveMaterial,
        activated: false,
        isAnimating: false,
        targetRotation: 0
    };

    valves.push(valveObject);
}

/**
 * Lógica para ativar ou desativar uma válvula.
 */
function toggleValve(valve) {
    // ✅ VERIFICAÇÃO PRINCIPAL: O jogador tem a alavanca?
    if (!playerState.hasLever) {
        console.log("Você precisa da alavanca para operar esta válvula!");
        // Futuramente, podemos mostrar uma mensagem na tela aqui.
        return;
    }

    valve.activated = !valve.activated; // Inverte o estado (aberta/fechada)
    valve.isAnimating = true; // Inicia a animação de rotação

    if (valve.activated) {
        valve.material.color.set(GameColors.VALVE_ACTIVE);
        valve.targetRotation = Math.PI / 2; // Gira 90 graus
        console.log(`Válvula do motor ${valve.motorId} ABERTA.`);
    } else {
        valve.material.color.set(GameColors.VALVE_INACTIVE);
        valve.targetRotation = 0; // Volta à posição original
        console.log(`Válvula do motor ${valve.motorId} FECHADA.`);
    }
}

/**
 * Anima a rotação das válvulas. Deve ser chamada no loop principal.
 */
export function updateValves() {
    for (const valve of valves) {
        // Sincroniza a parte visual com a física (importante para objetos estáticos também)
        valve.mesh.position.copy(valve.body.position);
        valve.mesh.quaternion.copy(valve.body.quaternion);
        
        // Anima a rotação da haste
        if (valve.isAnimating) {
            const currentRotation = valve.handle.rotation.y;
            const targetRotation = valve.targetRotation;
            
            // Interpola suavemente para a rotação alvo
            const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.1);
            valve.handle.rotation.y = newRotation;

            // Se a animação estiver perto de terminar, para ela
            if (Math.abs(newRotation - targetRotation) < 0.01) {
                valve.handle.rotation.y = targetRotation;
                valve.isAnimating = false;
            }
        }
    }
}
export function areValvesClosedForMotor(motorId) {
    const motorValves = valves.filter(v => v.motorId === motorId);
    // .every() retorna true apenas se a condição for verdadeira para TODOS os elementos
    return motorValves.every(v => v.activated === false);
}