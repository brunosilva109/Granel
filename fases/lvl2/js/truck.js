// Truck system
let currentTruck = null;
let wheelGroups = [];
let animationRunning = false;
let startTime = 0;

// Truck movement
let truckMovement = {
    state: 'going',
    startTime: 0,
    pauseDuration: 1000,
    speed: 0.1,
    startZ: 60,
    endZ: -50,
    pauseZ: 0,
    refueled: false
};

        function createTruckConnector(truckGroup) {
            const connectorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
            const connectorMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00,
                roughness: 0.5,
                metalness: 0.5
            });

            const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector.position.set(-1.5, 1, 5.5 ); // Position relative to truck
            connector.rotation.z = Math.PI / 2;
            connector.userData = {
                isHoseConnector: true,
                connectorId: 2,
                isTruckConnector: true
            };
            
            truckGroup.add(connector);
            objects.push(connector);
            hoseConnectors.push(connector);
            truckConnector = connector;
            
            return connector;
        }

        function createTruck(posX = 0, posY = 0, posZ = 0) {
            const tankTruck = new THREE.Group();
            tankTruck.position.set(posX, posY, posZ);

            // Dimensões
            const cabinWidth = 3.5;
            const cabinHeight = 3;
            const cabinDepth = 2;
            const tankRadius = 1.5;
            const tankLength = 6;
            const wheelRadius = 0.5;
            const wheelWidth = 0.4;

            // Cabine (posição relativa ao grupo)
            const cabinGeometry = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinDepth);
            const cabinMaterial = new THREE.MeshStandardMaterial({
                color: 0x4682B4,
                roughness: 0.7,
                metalness: 0.3
            });
            const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
            cabin.position.set(0, cabinHeight / 2 + wheelRadius * 1, 0);
            cabin.castShadow = true;
            tankTruck.add(cabin);

            // Tanque (posição relativa)
            const tankGeometry = new THREE.CylinderGeometry(tankRadius, tankRadius, tankLength, 300);
            const tankMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.6,
                metalness: 0.4
            });
            const tank = new THREE.Mesh(tankGeometry, tankMaterial);
            tank.position.set(0, tankRadius + wheelRadius, tankLength / 2 + cabinDepth / 2);
            tank.rotation.x = Math.PI / 2;
            tank.castShadow = true;
            tankTruck.add(tank);

            // Anéis do tanque
            const tankRingGeometry = new THREE.TorusGeometry(tankRadius + 0.1, 0.1, 15, 32);
            const tankRingMaterial = new THREE.MeshStandardMaterial({ color: 0xffff0ff, metalness: 0.8 });

            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(tankRingGeometry, tankRingMaterial);
                ring.position.set(0, tankRadius + wheelRadius, tankLength / 2 + cabinDepth / 2 - 0.5 - (i * 2) + 2);
                ring.rotation.z = Math.PI / 2;
                ring.castShadow = true;
                tankTruck.add(ring);
            }

            // Rodas
            const wheelMaterial = new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.9,
                metalness: 0.1
            });

            const wheelPositions = [
                { x: -cabinWidth / 2 - wheelWidth / 2, z: -cabinDepth / 2 + 0.5 },
                { x: cabinWidth / 2 + wheelWidth / 2, z: -cabinDepth / 2 + 0.5 },
                { x: -cabinWidth / 2 - wheelWidth / 2, z: cabinDepth / 2 - 0.5 + 2 },
                { x: cabinWidth / 2 + wheelWidth / 2, z: cabinDepth / 2 - 0.5 + 2 },
                { x: -cabinWidth / 2 - wheelWidth / 2, z: cabinDepth / 2 - 0.5 + 4 },
                { x: cabinWidth / 2 + wheelWidth / 2, z: cabinDepth / 2 - 0.5 + 4 }
            ];

            const wheelGroups = [];

            wheelPositions.forEach(pos => {
                const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.position.set(0, 0, 0);
                wheel.rotation.z = Math.PI / 2;
                wheel.castShadow = true;

                const wheelGroup = new THREE.Group();
                wheelGroup.position.set(pos.x, wheelRadius, pos.z);
                wheelGroup.add(wheel);
                wheelGroups.push(wheelGroup);
                tankTruck.add(wheelGroup);
            });

            // Faróis
            const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const headlightMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.5
            });

            const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            leftHeadlight.position.set(-cabinWidth / 2 + 0.2, cabinHeight / 2 + wheelRadius * 2, -cabinDepth / 2 + 0.1);
            tankTruck.add(leftHeadlight);

            const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            rightHeadlight.position.set(cabinWidth / 2 - 0.2, cabinHeight / 2 + wheelRadius * 2, -cabinDepth / 2 + 0.1);
            tankTruck.add(rightHeadlight);

            // Luzes
            const leftLight = new THREE.PointLight(0xFFFFFF, 1, 5);
            leftLight.position.set(-cabinWidth / 2 + 0.2, cabinHeight / 2 + wheelRadius * 2, -cabinDepth / 2);
            tankTruck.add(leftLight);

            const rightLight = new THREE.PointLight(0xFFFFFF, 1, 5);
            rightLight.position.set(cabinWidth / 2 - 0.2, cabinHeight / 2 + wheelRadius * 2, -cabinDepth / 2);
            tankTruck.add(rightLight);

            // Armazenar grupos de rodas para animação
            tankTruck.userData.wheelGroups = wheelGroups;

            // Add hose connector to the truck
            createTruckConnector(tankTruck);

            return tankTruck;
        }

        function createTruckCollision(truckGroup, width = 4, height = 3.5, depth = 8.5) {
            const collisionGeometry = new THREE.BoxGeometry(width, height, depth);
            const collisionMaterial = new THREE.MeshBasicMaterial({
                visible: true,
                transparent: true,
                opacity: 0
            });

            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.set(0, height / 2, depth - 5.5);
            truckGroup.add(collisionMesh);
            collisionMesh.userData.isCollidable = true;
            collisionMesh.userData.isTruckCollision = true;

            return collisionMesh;
        }

        function addTruck(posX = 0, posY = 0, posZ = truckMovement.startZ) {
            if (currentTruck) {
                scene.remove(currentTruck);
                objects = objects.filter(obj => !obj.userData.isTruckCollision);
            }

            currentTruck = createTruck(posX, posY, posZ);
            const collisionBox = createTruckCollision(currentTruck);

            currentTruck.userData.collisionBox = collisionBox;
            scene.add(currentTruck);
            objects.push(collisionBox);

            truckMovement.state = 'going';
            truckMovement.startTime = Date.now();
            truckMovement.refueled = false;

            return currentTruck;
        }

        function updateTruckMovement() {
            if (!currentTruck) return;

            const now = Date.now();
            const truck = currentTruck;

            switch (truckMovement.state) {
                case 'going':
                    truck.position.z -= truckMovement.speed;
                    truckMovement.selectedMotor = null;

                    if (truck.userData.wheelGroups) {
                        truck.userData.wheelGroups.forEach(wheel => {
                            wheel.rotation.x += truckMovement.speed * 2;
                        });
                    }

                    if (truck.position.z <= truckMovement.pauseZ && truck.position.z > -0.2) {
                        truckMovement.state = 'pausing';
                        truckMovement.startTime = now;
                        document.getElementById('objective').innerHTML = 'Connect the hose to the truck and the valve to refuel!';
                    }
                    else if (truck.position.z <= -50) {
                        removeTruck();
                        // Gerar um número aleatório entre 1 e 3
                        const numeroAleatorio = Math.floor(Math.random() * 2) + 1;

                        console.log("Número gerado:", numeroAleatorio);

                        // Usar switch case para realizar ações diferentes
                        switch (numeroAleatorio) {
                        case 1:
                            addTruck(5, 0, 60);
                            break;
                        case 2:
                            addTruck(-5, 0, 60);
                            break;
                        default:
                            addTruck(5, 0, 60);
                        }
                    }
                    break;

                case 'pausing':
                    if (now - truckMovement.startTime >= truckMovement.pauseDuration && truckMovement.refueled) {
                        truck.position.z -= 0.2;
                        disconnectHose();
                        truckMovement.state = 'going';
                    } else {
                        // Durante a pausa, mostrar qual motor ativar


                        if (!truckMovement.selectedMotor) {
                            if (truck.position.x >= 0) {
                                truckMovement.selectedMotor = Math.floor(Math.random() * 3) + 1;
                            } else {
                                truckMovement.selectedMotor = Math.floor(Math.random() * 3) + 4;
                            }
                        }
                        document.getElementById('objective').innerHTML = 
                            `Conecte o mangote e ative o motor ${truckMovement.selectedMotor} para reabastecer!`;
                    }
                    break;

            }
        }

        function removeTruck() {
            if (currentTruck) {
                scene.remove(currentTruck);
                currentTruck = null;
                truckConnector = null;
                
                // Disconnect hose if connected
                disconnectHose();
            }
        }
