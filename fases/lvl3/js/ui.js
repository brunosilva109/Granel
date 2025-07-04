// Arquivo: js/ui.js

const objectiveTextEl = document.getElementById('objective');
const refuelProgressBar = document.getElementById('refuel-progress');
const refuelBar = document.getElementById('refuel-bar');
const refuelTextEl = document.getElementById('refuel-text');
// ✅ NOVAS REFERÊNCIAS DA UI
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const truckCounterEl = document.getElementById('truck-counter');
const gameOverScreenEl = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const finalTimeEl = document.getElementById('final-time');
const restartGameBtn = document.getElementById('restart-game-btn');
// ✅ NOVO ELEMENTO E VARIÁVEL DE CONTROLE
const infoToastEl = document.getElementById('info-toast');
let toastTimeout; // Para controlar o tempo que a mensagem fica na tela

/**
 * Atualiza o texto do objetivo principal na tela.
 */
export function updateObjectiveText(text) {
    if (objectiveTextEl) {
        objectiveTextEl.innerHTML = text;
    }
}

/**
 * ✅ NOVA FUNÇÃO: Mostra uma mensagem temporária na tela.
 * @param {string} message - O texto a ser exibido.
 * @param {number} [duration=3000] - Duração em milissegundos.
 * @param {string} [type='info'] - Tipo da mensagem ('info' ou 'error').
 */
export function showInfoToast(message, duration = 3000, type = 'info') {
    if (!infoToastEl) return;

    // Limpa qualquer mensagem anterior para evitar sobreposição
    clearTimeout(toastTimeout);

    infoToastEl.textContent = message;
    infoToastEl.className = 'show'; // Remove classes antigas e adiciona a 'show'
    if (type === 'error') {
        infoToastEl.classList.add('error');
    } else {
        infoToastEl.classList.add('info');
    }

    // Agenda o desaparecimento da mensagem
    toastTimeout = setTimeout(() => {
        infoToastEl.classList.remove('show');
    }, duration);
}

// Listener para o botão de reiniciar
restartGameBtn.addEventListener('click', () => {
    // Recarrega a página inteira, reiniciando o jogo do zero.
    location.reload(); 
});

// Funções do sistema de abastecimento (sem alterações)
export function showRefuelProgress(show) { if (refuelProgressBar) { refuelProgressBar.style.display = show ? 'block' : 'none'; } }
export function updateRefuelBar(progress) { const progressInt = Math.floor(progress); if (refuelBar) { refuelBar.style.width = progressInt + '%'; } if (refuelTextEl) { refuelTextEl.innerText = `${progressInt}%`; } }
// ✅ NOVAS FUNÇÕES DE UI
export function updateTimer(timeString) { if (timerEl) { timerEl.textContent = `Tempo: ${timeString}`; } }
export function updateScore(score) { if (scoreEl) { scoreEl.textContent = `Pontos: ${score}`; } }
export function updateTruckCounter(completed, total) { if (truckCounterEl) { truckCounterEl.textContent = `Caminhões: ${completed} / ${total}`; } }
export function showGameOverScreen(score, time) { 
    if (gameOverScreenEl) { 
        finalScoreEl.textContent = score; 
        finalTimeEl.textContent = time; 
        gameOverScreenEl.style.display = 'flex'; 
        // Garante que o cursor do mouse seja liberado para clicar no botão
        document.exitPointerLock(); 
    } 
}
// ✅ NOVA FUNÇÃO
export function hideGameOverScreen() {
    if (gameOverScreenEl) {
        gameOverScreenEl.style.display = 'none';
    }
}
