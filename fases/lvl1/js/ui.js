//ui.js
const objectiveTextEl = document.getElementById('objective');
const refuelProgressBar = document.getElementById('refuel-progress');
const refuelBar = document.getElementById('refuel-bar');
const refuelTextEl = document.getElementById('refuel-text');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const truckCounterEl = document.getElementById('truck-counter');
const gameOverScreenEl = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const finalTimeEl = document.getElementById('final-time');
const restartGameBtn = document.getElementById('restart-game-btn');
const infoToastEl = document.getElementById('info-toast');
let toastTimeout; 


export function updateObjectiveText(text) {
    if (objectiveTextEl) {
        objectiveTextEl.innerHTML = text;
    }
}


export function showInfoToast(message, duration = 3000, type = 'info') {
    if (!infoToastEl) return;
    clearTimeout(toastTimeout);

    infoToastEl.textContent = message;
    infoToastEl.className = 'show';
    if (type === 'error') {
        infoToastEl.classList.add('error');
    } else {
        infoToastEl.classList.add('info');
    }
    toastTimeout = setTimeout(() => {
        infoToastEl.classList.remove('show');
    }, duration);
}
restartGameBtn.addEventListener('click', () => {
    location.reload(); 
});

export function showRefuelProgress(show) { if (refuelProgressBar) { refuelProgressBar.style.display = show ? 'block' : 'none'; } }
export function updateRefuelBar(progress) { const progressInt = Math.floor(progress); if (refuelBar) { refuelBar.style.width = progressInt + '%'; } if (refuelTextEl) { refuelTextEl.innerText = `${progressInt}%`; } }
export function updateTimer(timeString) { if (timerEl) { timerEl.textContent = `Tempo: ${timeString}`; } }
export function updateScore(score) { if (scoreEl) { scoreEl.textContent = `Pontos: ${score}`; } }
export function updateTruckCounter(completed, total) { if (truckCounterEl) { truckCounterEl.textContent = `Caminhões: ${completed} / ${total}`; } }
export function showGameOverScreen(score, time) { 
    if (gameOverScreenEl) { 
        finalScoreEl.textContent = score; 
        finalTimeEl.textContent = time; 
        gameOverScreenEl.style.display = 'flex'; 
        document.exitPointerLock(); 
    } 
}
export function hideGameOverScreen() {
    if (gameOverScreenEl) {
        gameOverScreenEl.style.display = 'none';
    }
}
