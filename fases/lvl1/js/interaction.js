//interaction.js
import * as THREE from 'three';
import { playerState } from './player.js';
import { createLever } from './world.js'; 
import { showInfoToast} from './ui.js';
import { completeTask, isTaskCompleted } from './quest.js';
import { markAsCollected } from './collectibles.js';

const raycaster = new THREE.Raycaster();
const interactionDistance = 4;

let sceneRef, worldRef, objectsToUpdateRef;
let targetedObject = null;

export function initInteractionSystem(scene, world, objectsToUpdate) {
    sceneRef = scene;
    worldRef = world;
    objectsToUpdateRef = objectsToUpdate;
}

export function checkInteraction(camera) {
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

    if (targetedObject.userData.interactionType === 'collect_hose') {
        if (targetedObject.userData.onInteract) {
            targetedObject.userData.onInteract();
            sceneRef.remove(targetedObject); 
            targetedObject = null;
        }
        return;
    }
    if (targetedObject.userData.interactionType === 'collect') {
        playerState.hasLever = true; 
        showInfoToast(`Altorizações coletadas! `, 3000, '');
        markAsCollected('lever');
        completeTask('collect_lever');
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
        return; 
    }
    if (targetedObject.userData.onInteract) {
        targetedObject.userData.onInteract();
    }
}



export function handleDrop(camera) {
    if (!playerState.hasLever) {
        showInfoToast(`Você não tem nada para soltar.`, 3000, '');
        return;
    }
    const dropOffset = new THREE.Vector3(0, -0.5, -2.5); 
    dropOffset.applyQuaternion(camera.quaternion);
    const dropPosition = new THREE.Vector3().copy(camera.position).add(dropOffset);
    createLever(sceneRef, worldRef, dropPosition);
    playerState.hasLever = false;
    showInfoToast(`Alavanca solta!`, 3000, '');
}