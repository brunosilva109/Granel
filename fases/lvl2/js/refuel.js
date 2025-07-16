import { setTruckAsRefueled } from './truck.js';
import { showInfoToast } from './ui.js';
import { updateTaskText, completeTask } from './quest.js';
let progressBar, bar, text;

const refuelState = {
    isActive: false,
    progress: 0,
    rate: 10, 
};

export function setupRefuelSystem() {
    progressBar = document.getElementById('refuel-progress');
    bar = document.getElementById('refuel-bar');
    text = document.getElementById('refuel-text');
}

export function startRefueling() {
    if (refuelState.isActive) return;
    showInfoToast(`Abastecendo!!`, 3000, 'error');
    
    refuelState.isActive = true;

    progressBar.style.display = 'block';
}


export function stopRefueling() {
    if (!refuelState.isActive) return;
    showInfoToast(`Abastecimento interrompido.!!`, 3000, 'error');
    refuelState.isActive = false;

}


export function resetRefuelSystem() {
    refuelState.progress = 0;
    refuelState.isActive = false;
    progressBar.style.display = 'none';
}


function completeRefueling() {

    refuelState.isActive = false;
    setTruckAsRefueled(true);

    setTimeout(() => {
        progressBar.style.display = 'none';
    }, 3000);
}

export function updateRefueling(deltaTime) {
    if (!refuelState.isActive) return;

    refuelState.progress += refuelState.rate * deltaTime;
    refuelState.progress = Math.min(refuelState.progress, 100);
    const progressInt = Math.floor(refuelState.progress);
    updateTaskText('refuel', `Ligue o motor para descarregar (${progressInt}%)`);
    bar.style.width = progressInt + '%';
    text.innerText = `${progressInt}%`;

    if (refuelState.progress >= 100) {
        completeTask('refuel');
        completeRefueling();
    }
}