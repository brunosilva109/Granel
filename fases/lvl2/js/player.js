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
