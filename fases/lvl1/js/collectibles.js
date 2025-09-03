// Arquivo: js/collectibles.js

// Este objeto guarda o estado de cada item colecionável principal.
const collectibleState = {
    lever: false,
    trava: false,
    hose: false,
};

/**
 * Marca um item como permanentemente coletado.
 * @param {'lever' | 'trava' | 'hose'} itemName - O nome do item.
 */
export function markAsCollected(itemName) {
    if (collectibleState.hasOwnProperty(itemName)) {
        collectibleState[itemName] = true;
    }
}

/**
 * Verifica se um item já foi coletado.
 * @param {'lever' | 'trava' | 'hose'} itemName - O nome do item.
 */
export function hasBeenCollected(itemName) {
    return collectibleState[itemName] || false;
}