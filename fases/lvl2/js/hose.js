// Hose (mangote) system
let hose = null;
let hasHose = false;
let hoseConnectors = [];
let hoseConnected = false;
let firstConnector = null;
let secondConnector = null;
let hoseMesh = null;
let hosePoints = [];
let hoseSegments = 20;

// Refueling system
let refueling = false;
let refuelProgress = 0;
let refuelInterval = null;
let truckConnector = null;


        function createHosePickup(x,y,z) {
            const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.7,
                metalness: 0.3
            });
            const hosePickup = new THREE.Mesh(geometry, material);
            hosePickup.position.set(x,y,z);
            hosePickup.userData = {
                isHosePickup: true
            };
            scene.add(hosePickup);
            objects.push(hosePickup);
        }

        function createHoseConnectors(posX = 0,  posZ = 0) {
            // Create two hose connectors in the scene
            const connectorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
            const connectorMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00,
                roughness: 0.5,
                metalness: 0.5
            });

            // First connector (fixed position)
            const connector1 = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector1.position.set(posX, .6, posZ);
            connector1.rotation.z = Math.PI/2;
            connector1.userData = {
                isHoseConnector: true,
                connectorId: 1
            };

            scene.add(connector1);
            objects.push(connector1);
            hoseConnectors.push(connector1);

            // Second connector will be attached to the truck
        }

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

        function createHoseMesh(startPoint, endPoint) {
            // Create a flexible hose between two points
            const points = [];
            const segmentLength = startPoint.distanceTo(endPoint) / hoseSegments;
            
            // Create a smooth curve between points
            for (let i = 0; i <= hoseSegments; i++) {
                const t = i / hoseSegments;
                const x = startPoint.x + (endPoint.x - startPoint.x) * t;
                const y = startPoint.y + (endPoint.y - startPoint.y) * t;
                const z = startPoint.z + (endPoint.z - startPoint.z) * t;
                
                // Add some natural curve to the hose
                const curveFactor = -100;
                const curveY = Math.sin(t * Math.PI) * curveFactor;
                
                points.push(new THREE.Vector3(x, y + curveY, z));
            }
            
            hosePoints = points;
            
            // Create the hose geometry
            const hoseGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(points),
                hoseSegments,
                0.2,
                8,
                false
            );
            
            const hoseMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.7,
                metalness: 0.1
            });
            
            hoseMesh = new THREE.Mesh(hoseGeometry, hoseMaterial);
            scene.add(hoseMesh);
        }

        function updateHoseMesh() {
            if (!hoseMesh || !firstConnector || !secondConnector) return;
            
            // Update the hose position based on connectors
            const startPoint = firstConnector.getWorldPosition(new THREE.Vector3());
            const endPoint = secondConnector.getWorldPosition(new THREE.Vector3());
            
            // Update points array
            for (let i = 0; i <= hoseSegments; i++) {
                const t = i / hoseSegments;
                const x = startPoint.x + (endPoint.x - startPoint.x) * t;
                const y = startPoint.y + (endPoint.y - startPoint.y) * t;
                const z = startPoint.z + (endPoint.z - startPoint.z) * t;
                
                // Add some natural curve to the hose
                const curveFactor = 0.2;
                const curveY = Math.sin(t * Math.PI) * curveFactor;
                
                hosePoints[i].set(x, y - curveY, z);
            }
            
            // Remove old hose mesh
            //scene.remove(hoseMesh);
            
            // Create new hose geometry with updated points
            const hoseGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(hosePoints),
                hoseSegments,
                0.2,
                8,
                false
            );
            scene.remove(hoseMesh);
            
            const hoseMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.7,
                metalness: 0.1
            });
            
            hoseMesh = new THREE.Mesh(hoseGeometry, hoseMaterial);
            scene.add(hoseMesh);
        }

        function pickUpHose() {
            hasHose = true;
            document.getElementById('hose-info').style.display = 'block';
            document.getElementById('hose-info').innerHTML = 'Hose: Pick up the hose and connect it to the truck and the valve';
            
            // Slow down player when carrying hose
            speed = normalSpeed * 2;
        }

        function dropHose() {
            hasHose = false;
            document.getElementById('hose-info').innerHTML = 'Hose: Connected (you can move freely)';
            
            // Reset player speed
            speed = normalSpeed;
        }

        function connectHose(connector) {
            if (!hasHose && !hoseConnected) return;
            
            if (!firstConnector) {
                firstConnector = connector;
                document.getElementById('hose-info').innerHTML = 'Hose: Connected to first point (click on second connector)';
                connector.material.color.set(0x00ff00); // Change color to green
            } else if (!secondConnector && firstConnector !== connector) {
                secondConnector = connector;
                hoseConnected = true;
                connector.material.color.set(0x00ff00); // Change color to green
                document.getElementById('hose-info').innerHTML = 'Hose: Connected between points!';
                
                // Create hose mesh between connectors
                const startPoint = firstConnector.getWorldPosition(new THREE.Vector3());
                const endPoint = secondConnector.getWorldPosition(new THREE.Vector3());
                createHoseMesh(startPoint, endPoint);
                
                // Player drops the hose but it remains connected
                dropHose();
                
                // If connected to truck, start refueling
                if (connector.userData.isTruckConnector || firstConnector.userData.isTruckConnector) {
                    startRefueling();
                }
            }
        }

        function disconnectHose() {
            if (!hoseConnected) return;
            
            // Reset connector colors
            if (firstConnector) {
                firstConnector.material.color.set(0xffff00);
                firstConnector = null;
            }
            if (secondConnector) {
                secondConnector.material.color.set(0xffff00);
                secondConnector = null;
            }
            
            // Remove hose mesh
            if (hoseMesh) {
                scene.remove(hoseMesh);
                hoseMesh = null;
            }
            
            hoseConnected = false;
            document.getElementById('hose-info').style.display = 'none';
            
            // If truck was refueled, allow it to leave
            if (truckMovement.refueled) {
                truckMovement.state = 'going';
                truckMovement.refueled = false;
                document.getElementById('objective').innerHTML = 'Truck is leaving!';
            }
        }
        function startRefueling() {
            if (refueling) return;
            
            refueling = true;
            refuelProgress = 0;
            document.getElementById('refuel-progress').style.display = 'block';
            updateRefuelProgress();
            
            refuelInterval = setInterval(() => {
                refuelProgress += 1;
                updateRefuelProgress();
                
                if (refuelProgress >= 100) {
                    completeRefueling();
                }
            }, 100);
        }

        function updateRefuelProgress() {
            document.getElementById('refuel-bar').style.width = refuelProgress + '%';
            document.getElementById('refuel-text').innerText = refuelProgress + '%';
        }

        function completeRefueling() {
            clearInterval(refuelInterval);
            refueling = false;
            
            truckMovement.refueled = true;
            
            
            document.getElementById('objective').innerHTML = 'Refueling complete! Disconnect the hose to let the truck leave.';
            
            // Hide progress bar after delay
            setTimeout(() => {
                document.getElementById('refuel-progress').style.display = 'none';
            }, 3000);
        }
