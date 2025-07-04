// Arquivo: js/refuel.js
import { setTruckAsRefueled } from './truck.js';

// ✅ CORREÇÃO: Adicionamos 'showInfoToast' à lista de importações da UI
import { showRefuelProgress, updateRefuelBar, updateObjectiveText, showInfoToast } from './ui.js';

let progressBar, bar, text;

const refuelState = {
    isActive: false,
    progress: 0,
    rate: 10, // Enche 10% por segundo
};

export function setupRefuelSystem() {
    progressBar = document.getElementById('refuel-progress');
    bar = document.getElementById('refuel-bar');
    text = document.getElementById('refuel-text');
}

/**
 * Inicia ou retoma o processo de abastecimento.
 */
export function startRefueling() {
    if (refuelState.isActive) return;
    showInfoToast(`Abastecendo!!`, 3000, 'error');
    
    refuelState.isActive = true;
    // ✅ CORREÇÃO: Não reseta mais o progresso aqui
    progressBar.style.display = 'block';
}

/**
 * Para o abastecimento (pausa), mas MANTÉM o progresso.
 */
export function stopRefueling() {
    if (!refuelState.isActive) return;
    showInfoToast(`Abastecimento interrompido.!!`, 3000, 'error');
    refuelState.isActive = false;
    // Não esconde a barra, para o jogador ver o progresso atual
}

/**
 * ✅ NOVA FUNÇÃO: Reseta o sistema para um novo caminhão.
 */
export function resetRefuelSystem() {
    refuelState.progress = 0;
    refuelState.isActive = false;
    progressBar.style.display = 'none';
}

/**
 * Chamado quando o abastecimento chega a 100%.
 */
function completeRefueling() {

    refuelState.isActive = false;
    setTruckAsRefueled(true); // Avisa o caminhão que ele foi abastecido

    // ✅ CORREÇÃO: A lógica de UI agora está aqui, no lugar certo.
    document.getElementById('objective').innerHTML = `Abastecimento completo! Desligue o Motor, feche as válvulas e desconecte o mangote para liberar o caminhão.`;

    setTimeout(() => {
        // Apenas esconde a barra, não reseta o progresso
        progressBar.style.display = 'none';
    }, 3000);
}

export function updateRefueling(deltaTime) {
    if (!refuelState.isActive) return;

    refuelState.progress += refuelState.rate * deltaTime;
    refuelState.progress = Math.min(refuelState.progress, 100);

    const progressInt = Math.floor(refuelState.progress);
    bar.style.width = progressInt + '%';
    text.innerText = `${progressInt}%`;

    if (refuelState.progress >= 100) {
        completeRefueling();
    }
}