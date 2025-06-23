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

                function onDocumentClick() {
            if (!controls) return;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

            // Check for lever interaction
            if (!hasLever && lever && !lever.picked) {
                const distance = camera.position.distanceTo(lever.position);
                if (distance < 5) {
                    const intersects = raycaster.intersectObject(lever.handle);
                    if (intersects.length > 0) {
                        pickLever();
                    }
                }
            }

            // Check for valve interaction
            if (hasLever) {
                for (const valve of valves) {
                    const distance = camera.position.distanceTo(valve.position);
                    if (distance < 5) {
                        const intersects = raycaster.intersectObject(valve.handle);
                        if (intersects.length > 0) {

                            toggleValve(valve);
                        }
                    }
                }
            }
            


            // Check for hose pickup
            const hosePickupIntersects = raycaster.intersectObjects(
                objects.filter(obj => obj.userData.isHosePickup)
            );
            if (hosePickupIntersects.length > 0 && !hasHose && !hoseConnected) {
                pickUpHose();
            }

            // Check for hose connector interaction
            if (hasHose || hoseConnected) {
                const connectorIntersects = raycaster.intersectObjects(
                    objects.filter(obj => obj.userData.isHoseConnector)
                );
                if (connectorIntersects.length > 0) {
                    const connector = connectorIntersects[0].object;
                    connectHose(connector);
                }
                
                // Check for disconnecting hose
                if (hoseConnected && raycaster.intersectObject(hoseMesh).length > 0) {
                    disconnectHose();
                }
            }
        }
        function verificar() {
            // 1. Verificar se algum motor está ativo
            const motorAtivo = motors.some(motor => motor.running); // Retorna true se algum motor estiver ligado
            console.log("motor ativo :", motorAtivo);
            // 2. Verificar se alguma válvula está aberta
            const valvulaAberta = valves.some(valve => valve.activated); // Retorna true se alguma válvula estiver aberta

            // 3. Verificar se algum mangote está conectado
            const mangoteConectado = hoseConnected; // Retorna true se algum mangote estiver conectado

            // Exibir mensagem ou retornar se algo estiver ativo
            if (motorAtivo || valvulaAberta || mangoteConectado) {
                //console.log('Algum motor está ligado, válvula aberta ou mangote conectado.');
                return false; // Retorna verdadeiro se alguma condição for atendida
            } else {
                //console.log('Nenhum motor está ligado, nenhuma válvula aberta, e nenhum mangote conectado.');
                return true; // Retorna falso se nada estiver ativo
            }
        }
        function toggleValve(valve) {

            if (valve.animating) {
                return; // previne toggle durante animação
            }

            if (valve.activated) {
                deactivateValve(valve);
            } else {
                activateValve(valve);
            }
            console.log('Toggle valve:', valve);    
        }
        function updateSystemState() {
            tanks.forEach(tank => {
                const valvesOpen = tank.valves.every(v => v.activated);
                const motor = tank.motor;
                const connector = tank.hoseConnector;

                const hoseConnected = connector.userData.connectedTo === 'truck';

                // Motor só pode ser ligado se válvulas abertas + mangote conectado
                motor.canRun = valvesOpen && hoseConnected;

                // Caminhão só pode ir embora se motor desligado e mangote desconectado
                if (motor.running && !motor.canRun) {
                    motor.running = false; // segurança automática
                }
            });
        }
        function checkSystemStatus() {
                let anyTankReady = false;

                tanks.forEach(tank => {
                    const valvesOpen = tank.valves.every(v => v.activated);
                    const hoseConnectedToTruck = tank.hoseConnector?.userData.connectedTo === 'truck';

                    const isReady = valvesOpen && hoseConnectedToTruck;
                    if (isReady) anyTankReady = true;
                });

                return anyTankReady;
            }

