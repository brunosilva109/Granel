// Player movement and physics
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let speed = 0.1;
let isSprinting = false;
const normalSpeed = 0.1;
const sprintSpeed = 0.2;

// Player characteristics
let playerHeight = 2;
let playerRadius = 2;
let handVisible = false;

       function checkCollision(newPosition) {
            const raycaster = new THREE.Raycaster();
            raycaster.set(camera.position, newPosition.clone().sub(camera.position).normalize());

            const collidableObjects = objects.filter(obj => {
                return obj.userData.isCollidable &&
                    !obj.userData.isTruckCollision;
            });

            scene.children.forEach(child => {
                if (child.userData && child.userData.collisionBox) {
                    collidableObjects.push(child.userData.collisionBox);
                }
            });

            const intersects = raycaster.intersectObjects(collidableObjects, true);

            return intersects.length > 0 && intersects[0].distance < speed * 1.5;
        }

        function onKeyDown(event) {
            if (event.code === 'ShiftLeft' && !hasHose) { // Can't sprint with hose
                isSprinting = true;
                speed = sprintSpeed;
            }
            
            if (event.keyCode === 69) { // E key - drop hose
                if (hasHose || hasLever) {
                    dropHose();
                    dropLever();
                }
            }

            switch (event.keyCode) {
                case 83: // W
                    moveForward = true;
                    break;
                case 87: // S
                    moveBackward = true;
                    break;
                case 65: // A
                    moveLeft = true;
                    break;
                case 68: // D
                    moveRight = true;
                    break;
            }
        }

        function onKeyUp(event) {
            if (event.code === 'ShiftLeft') {
                isSprinting = false;
                speed = normalSpeed;
            }

            switch (event.keyCode) {
                case 83: // W
                    moveForward = false;
                    break;
                case 87: // S
                    moveBackward = false;
                    break;
                case 65: // A
                    moveLeft = false;
                    break;
                case 68: // D
                    moveRight = false;
                    break;
            }
        }

let isTouching = false;
let lastX, lastY;
let minRotation = -Math.PI / 2; // Limite de rotação superior
let maxRotation = Math.PI / 2;  // Limite de rotação inferior
const joystick = document.getElementById("joystick");
const container = document.getElementById("joystick-container");

container.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

container.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    const threshold = 20; // Sensibilidade
    moveForward = dy < -threshold;
    moveBackward = dy > threshold;
    moveLeft = dx < -threshold;
    moveRight = dx > threshold;

    // Move o joystick visual
    joystick.style.left = `${30 + dx * 0.3}px`;
    joystick.style.top = `${30 + dy * 0.3}px`;

    // Movimentação da câmera (rotação horizontal e vertical)
    camera.rotation.y -= dx * 0.002; // Movimento horizontal (esquerda/direita)

    // Limitar a rotação vertical (para cima/baixo)
    let newRotationX = camera.rotation.x - dy * 0.002;
    if (newRotationX > maxRotation) {
        newRotationX = maxRotation;
    } else if (newRotationX < minRotation) {
        newRotationX = minRotation;
    }
    camera.rotation.x = newRotationX;
});

container.addEventListener("touchend", () => {
    moveForward = moveBackward = moveLeft = moveRight = false;
    joystick.style.left = `30px`;
    joystick.style.top = `30px`;
});

// Interações com botões
document.getElementById("interactBtn").addEventListener("touchstart", () => {
    // Simule clique/interação com objeto
    interactWithObject();
});

document.getElementById("dropBtn").addEventListener("touchstart", () => {
    // Simule a tecla 'E' (soltar)
    if (hasHose || hasLever) {
        dropHose();
        dropLever();
    }
});
