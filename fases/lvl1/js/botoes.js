//botoes.js
import { moveState, attemptJump, rotateCamera } from './player.js';
import { triggerInteraction } from './interaction.js';

// Variáveis para rastrear os IDs únicos de cada toque
let joystickTouchId = null;
let cameraTouchId = null;
let lastCameraTouch = { x: 0, y: 0 };

export function setupMobileControls() {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');
    const jumpButton = document.getElementById('jump-button');
    const interactButton = document.getElementById('interact-button');

    // Funções de Ação (Pulo e Interação) - sem alterações, mas centralizadas
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        attemptJump();
    }, { passive: false });

    interactButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerInteraction();
    }, { passive: false });

    // --- Lógica do Joystick (agora apenas a função de cálculo) ---
    function handleJoystickMove(touchX, touchY) {
        const joystickRect = joystickArea.getBoundingClientRect();
        const joystickCenter = {
            x: joystickRect.left + joystickRect.width / 2,
            y: joystickRect.top + joystickRect.height / 2
        };

        const deltaX = touchX - joystickCenter.x;
        const deltaY = touchY - joystickCenter.y;
        
        const knobMaxDistance = joystickRect.width / 4;
        const distance = Math.min(Math.sqrt(deltaX*deltaX + deltaY*deltaY), knobMaxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        joystickKnob.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

        const threshold = 0.3;
        moveState.forward = deltaY < -joystickRect.height * threshold;
        moveState.backward = deltaY > joystickRect.height * threshold;
        moveState.left = deltaX < -joystickRect.width * threshold;
        moveState.right = deltaX > joystickRect.width * threshold;
    }

    function resetJoystick() {
        joystickKnob.style.transform = `translate(-50%, -50%)`;
        moveState.forward = false;
        moveState.backward = false;
        moveState.left = false;
        moveState.right = false;
    }

    // --- NOVOS GERENCIADORES DE EVENTOS GLOBAIS (A MÁGICA ACONTECE AQUI) ---

    window.addEventListener('touchstart', (e) => {
        // Itera sobre todos os novos toques que acabaram de acontecer
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Verifica se o toque começou dentro da área do joystick
            const joystickRect = joystickArea.getBoundingClientRect();
            if (touchX >= joystickRect.left && touchX <= joystickRect.right &&
                touchY >= joystickRect.top && touchY <= joystickRect.bottom) {
                
                // Se não houver um dedo no joystick ainda, este se torna o dedo do joystick
                if (joystickTouchId === null) {
                    joystickTouchId = touch.identifier;
                    handleJoystickMove(touchX, touchY);
                }
            } else if (cameraTouchId === null && !touch.target.closest('#action-buttons')) {
                // Se o toque foi fora do joystick e dos botões, ele se torna o toque da câmera
                cameraTouchId = touch.identifier;
                lastCameraTouch.x = touchX;
                lastCameraTouch.y = touchY;
            }
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Previne o scroll da página
        // Itera sobre todos os toques que se moveram
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Se for o dedo do joystick, move o jogador
            if (touch.identifier === joystickTouchId) {
                handleJoystickMove(touch.clientX, touch.clientY);
            } 
            // Se for o dedo da câmera, move a câmera
            else if (touch.identifier === cameraTouchId) {
                const deltaX = touch.clientX - lastCameraTouch.x;
                const deltaY = touch.clientY - lastCameraTouch.y;
                rotateCamera(deltaX, deltaY);
                lastCameraTouch.x = touch.clientX;
                lastCameraTouch.y = touch.clientY;
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        // Itera sobre todos os toques que terminaram
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Se o dedo que saiu era o do joystick, reseta o joystick
            if (touch.identifier === joystickTouchId) {
                joystickTouchId = null;
                resetJoystick();
            } 
            // Se o dedo que saiu era o da câmera, libera o controle da câmera
            else if (touch.identifier === cameraTouchId) {
                cameraTouchId = null;
            }
        }
    });
}
