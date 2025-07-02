import * as THREE from 'three';
import { playerState } from './player.js'; // Importa o estado do jogador
import { createLever } from './world.js';   // Importa a função de criar a alavanca

const raycaster = new THREE.Raycaster();
const interactionDistance = 8;

let sceneRef, worldRef, objectsToUpdateRef;
let targetedObject = null;

export function initInteractionSystem(scene, world, objectsToUpdate) {
    sceneRef = scene;
    worldRef = world;
    objectsToUpdateRef = objectsToUpdate;
}

export function checkInteraction(camera) {
    // ... (a função checkInteraction permanece exatamente igual)
    if (!camera || !sceneRef) return;
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.intersectObjects(sceneRef.children, true);
    let currentTarget = null;
    for (const intersect of intersects) {
        if (intersect.distance <= interactionDistance) {
            let object = intersect.object;
            while (object && !object.userData.isInteractable) {
                object = object.parent;
            }
            if (object) {
                currentTarget = object;
                break;
            }
        }
    }
    if (targetedObject !== currentTarget) {
        if (targetedObject && targetedObject.material && targetedObject.material.emissive) {
            targetedObject.material.emissive.setHex(0x000000);
        }
        targetedObject = currentTarget;
        if (targetedObject && targetedObject.material && targetedObject.material.emissive) {
            targetedObject.material.emissive.setHex(0x555555);
        }
    }
}

export function triggerInteraction() {
    if (!targetedObject) return;
    // ✅ LÓGICA ADICIONADA para coletar a mangueira
    if (targetedObject.userData.interactionType === 'collect_hose') {
        if (targetedObject.userData.onInteract) {
            targetedObject.userData.onInteract();
            sceneRef.remove(targetedObject); // Remove o item do chão
            targetedObject = null;
        }
        return;
    }
    // Lógica para coletar a alavanca
    if (targetedObject.userData.interactionType === 'collect') {
        playerState.hasLever = true; // ✅ ATUALIZA O ESTADO DO JOGADOR
        console.log("Alavanca coletada! Estado do jogador:", playerState);
        
        // Remove o objeto do mundo
        const bodyToRemove = targetedObject.userData.physicsBody;
        if (bodyToRemove) {
            const indexToRemove = objectsToUpdateRef.findIndex(obj => obj.body === bodyToRemove);
            if (indexToRemove !== -1) {
                objectsToUpdateRef.splice(indexToRemove, 1);
            }
            worldRef.removeBody(bodyToRemove);
        }
        sceneRef.remove(targetedObject);
        targetedObject = null;
        return; // Para a execução aqui
    }

    // Lógica para outras interações (como o botão do motor)
    if (targetedObject.userData.onInteract) {
        targetedObject.userData.onInteract();
    }
}


// ✅ NOVA FUNÇÃO PARA SOLTAR A ALAVANCA
export function handleDrop(camera) {
    if (!playerState.hasLever) {
        console.log("Você não tem nada para soltar.");
        return;
    }

    // Calcula a posição na frente do jogador para soltar o item
    const dropOffset = new THREE.Vector3(0, -0.5, -2.5); // Um pouco para baixo e à frente
    dropOffset.applyQuaternion(camera.quaternion);
    const dropPosition = new THREE.Vector3().copy(camera.position).add(dropOffset);

    // Cria uma nova alavanca no local calculado
    createLever(sceneRef, worldRef, dropPosition);
    
    // Atualiza o estado do jogador
    playerState.hasLever = false;
    console.log("Alavanca solta! Estado do jogador:", playerState);
}