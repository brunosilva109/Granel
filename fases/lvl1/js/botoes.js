//botoes.js
import { moveState, attemptJump, rotateCamera } from './player.js';
import { triggerInteraction } from './interaction.js';

export function setupMobileControls() {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');
    const jumpButton = document.getElementById('jump-button');
    const interactButton = document.getElementById('interact-button');

    // ---- Lógica do Botão de Pulo (sem alterações) ----
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        attemptJump();
    }, { passive: false });


    // ---- Lógica do Joystick (sem alterações) ----
    let joystickActive = false;
    const joystickRect = joystickArea.getBoundingClientRect();
    const joystickCenter = {
        x: joystickRect.left + joystickRect.width / 2,
        y: joystickRect.top + joystickRect.height / 2
    };

    function handleJoystickMove(touchX, touchY) {
        const deltaX = touchX - joystickCenter.x;
        const deltaY = touchY - joystickCenter.y;
        
        const knobMaxDistance = joystickRect.width / 4;
        const distance = Math.min(Math.sqrt(deltaX*deltaX + deltaY*deltaY), knobMaxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        joystickKnob.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

        const threshold = 0.3; 
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaY > absDeltaX) {
            moveState.left = false;
            moveState.right = false;
            if (deltaY < -joystickRect.height * threshold) {
                moveState.forward = true;
                moveState.backward = false;
            } else if (deltaY > joystickRect.height * threshold) {
                moveState.forward = false;
                moveState.backward = true;
            } else {
                 moveState.forward = false;
                 moveState.backward = false;
            }
        } else {
            moveState.forward = false;
            moveState.backward = false;
            if (deltaX < -joystickRect.width * threshold) {
                moveState.left = true;
                moveState.right = false;
            } else if (deltaX > joystickRect.width * threshold) {
                moveState.left = false;
                moveState.right = true;
            } else {
                 moveState.left = false;
                 moveState.right = false;
            }
        }
    }
     // ---- Lógica do Botão de Interagir ----
    interactButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerInteraction();
    }, { passive: false });

    joystickArea.addEventListener('touchstart', (e) => { e.preventDefault(); joystickActive = true; handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    joystickArea.addEventListener('touchmove', (e) => { e.preventDefault(); if (joystickActive) { handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
    joystickArea.addEventListener('touchend', (e) => { e.preventDefault(); joystickActive = false; moveState.forward = false; moveState.backward = false; moveState.left = false; moveState.right = false; joystickKnob.style.transform = `translate(-50%, -50%)`; });

    // ---- LÓGICA ATUALIZADA: Câmera em dispositivos móveis ----
    let lastTouch = { x: 0, y: 0 };
    
    document.body.addEventListener('touchstart', (e) => {

        if (e.target.closest('#mobile-controls')) return;
        
        lastTouch.x = e.touches[0].clientX;
        lastTouch.y = e.touches[0].clientY;
    }, { passive: false });

    document.body.addEventListener('touchmove', (e) => {

        if (e.target.closest('#mobile-controls')) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouch.x;
        const deltaY = touch.clientY - lastTouch.y;

        rotateCamera(deltaX, deltaY);

        lastTouch.x = touch.clientX;
        lastTouch.y = touch.clientY;
    }, { passive: false });
}