// Arquivo: js/pause.js

// ✅ Importa tanto a função que alterna o estado quanto a que verifica
import { togglePauseGame, isGamePaused } from './gameState.js';

// Pega as referências dos elementos do HTML
const pauseMenuContainer = document.getElementById('pause-menu-container');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const mobilePauseBtn = document.getElementById('mobile-pause-btn');

/**
 * Abre o menu de pause:
 * 1. Adiciona a classe 'active' para torná-lo visível.
 * 2. Chama a função para pausar a lógica do jogo.
 */
function openPauseMenu() {
    document.exitPointerLock();
    pauseMenuContainer.classList.add('active');
    // Só alterna o estado se o jogo não estiver pausado
    if (!isGamePaused()) {
        togglePauseGame();
    }
}

/**
 * Fecha o menu de pause:
 * 1. Remove a classe 'active' para escondê-lo.
 * 2. Chama a função para despausar a lógica do jogo.
 */
function closePauseMenu() {
    pauseMenuContainer.classList.remove('active');
     // Só alterna o estado se o jogo estiver pausado
    if (isGamePaused()) {
        togglePauseGame();
    }
}

/**
 * Função central que decide se abre ou fecha o menu.
 */
function handlePauseToggle() {
    // Pergunta ao 'gameState' qual é o estado atual
    if (isGamePaused()) {
        closePauseMenu();
    } else {
        openPauseMenu();
    }
}

export function setupPauseControls() {
    // Ouvinte para a tecla "P" no desktop
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p') {
            handlePauseToggle();
        }
    });

    // Ouvinte para o clique no botão de pause do celular
    mobilePauseBtn.addEventListener('click', () => {
        console.log("Botão de pause mobile CLICADO!"); // Esta mensagem deve aparecer no console
        handlePauseToggle();
    });
    // Ouvinte para o botão de retornar ao jogo
    resumeBtn.addEventListener('click', closePauseMenu);

    // Ouvintes para os outros botões (sem alterações)
    restartBtn.addEventListener('click', () => { window.location.reload(); });
    mainMenuBtn.addEventListener('click', () => { window.location.href = '../../../fase.html'; });

}

