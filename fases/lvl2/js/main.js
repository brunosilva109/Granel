
        // Game variables
        let scene, camera, renderer, controls;
        let objects = [];

        // Initialize the game
        init();

        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x333333);
            scene.fog = new THREE.FogExp2(0x333333, 0.001);

            // Create camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.y = 1;

            // Create renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            document.getElementById('container').appendChild(renderer.domElement);

            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);

            // Create ground
            // Adicione no início com as outras constantes
            const textureLoader = new THREE.TextureLoader();

            // Carregar texturas (substitua as URLs pelas suas texturas)
            const grassTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
            const sidewalkTexture= textureLoader.load('https://st.depositphotos.com/1092019/3699/i/450/depositphotos_36998909-stock-photo-paving-slabs-seamless-tileable-texture.jpg');
            //const roadTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU8rNapKUgOSuMED1g-94ftiFjYMkS6wl1bw&s');
            const roadTexture = textureLoader.load('');

            // Configurar propriedades comuns das texturas
            [grassTexture, roadTexture, sidewalkTexture].forEach(texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            });

            // Função base para criar superfícies
            function createSurface(x, y, z, width, depth, texture, repX, repY, rotation) {
                const geometry = new THREE.PlaneGeometry(width, depth);
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.8,
                    metalness: 0.2
                });

                // Ajustar repetição da textura
                texture.repeat.set(repX, repY);
                texture.offset.set(0, 0);

                const surface = new THREE.Mesh(geometry, material);
                surface.rotation.x = -Math.PI / 2;
                surface.position.set(x, y, z);
                
                if(rotation) {
                    surface.rotation.y = rotation;
                }
                
                surface.receiveShadow = true;
                scene.add(surface);
                return surface;
            }
            function createColoredSurface(x, y, z, width, depth, color, roughness = 0.8, metalness = 0.2) {
                const geometry = new THREE.PlaneGeometry(width, depth);
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: roughness,
                    metalness: metalness
                });

                const surface = new THREE.Mesh(geometry, material);
                surface.rotation.x = -Math.PI / 2;
                surface.position.set(x, y, z);
                surface.receiveShadow = true;
                scene.add(surface);
                return surface;
            }

            // Funções específicas para cada tipo de superfície
            function addGrama(x, y, z, comprimento, largura, repComprimento = 1, repLargura = 1) {
                return createSurface(
                    x, y, z,
                    comprimento, largura,
                    grassTexture,
                    repComprimento, repLargura
                );
            }

            function addRua(x, y, z, comprimento, largura) {
                const rua = createColoredSurface(
                    x, y + 0.01, z, // +0.01 para evitar z-fighting
                    comprimento, largura,
                    0x333333, // Cinza escuro para asfalto
                    2, 0.5
                );
                return rua;
            }

            function addCalcada(x, y, z, comprimento, largura) {
                const calcada = createColoredSurface(
                    x, y + 0.02, z, // +0.02 para evitar z-fighting
                    comprimento, largura,
                    0xa7a7a7 , // Cinza claro para calçada
                    2, 0.1
                );
                return calcada;
            }
             // Criar chão principal de grama
                addGrama(0, 0, 0, 100, 100, 25, 25); // Grama cobrindo toda a área

                // Criar ruas
                addRua(0, 0, 0, 5,100); // Rua principal vertical

                // Calçadas
                addCalcada(-3, 0, 0, 2, 100, 1, 20); // Calçada esquerda
                addCalcada(3, 0, 0, 2, 100, 1, 20); // Calçada direita

                // Estacionamento
                addRua(30, 0, 30, 20, 15, 4, 3); // Área de estacionamento

                // Create walls
                createWalls();

                // Create pipes and valves
                createEnvironment();

                // Create lever
                createLever();

                // Create hose connectors
                createHoseConnectors(-5,5);
                createHoseConnectors(-10,5);

                // Create hose pickup point
                createHosePickup();

                // Add event listeners
                window.addEventListener('resize', onWindowResize);
                document.addEventListener('click', onDocumentClick);
                document.addEventListener('keydown', onKeyDown);
                document.addEventListener('keyup', onKeyUp);

                // Start button
                document.getElementById('start-btn').addEventListener('click', startGame);

                // Start animation loop
                animate();
                createSky();
                createClouds();
            }
        function startGame() {
            document.getElementById('start-screen').style.display = 'none';

            controls = new THREE.PointerLockControls(camera, document.body);

            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement === document.body) {
                    controls.lock();
                }
            });

            document.body.requestPointerLock = document.body.requestPointerLock ||
                document.body.mozRequestPointerLock ||
                document.body.webkitRequestPointerLock;
            document.body.requestPointerLock();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
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
                    if (!valve.activated) {
                        const distance = camera.position.distanceTo(valve.position);
                        if (distance < 5) {
                            const intersects = raycaster.intersectObject(valve.handle);
                            if (intersects.length > 0) {
                                activateValve(valve);
                            }
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
        function animate() {
            requestAnimationFrame(animate);
            
            // Update clouds
            clouds.forEach(cloud => {
                cloud.position.x += Math.sin(cloud.userData.rotation) * cloud.userData.speed;
                cloud.position.z += Math.cos(cloud.userData.rotation) * cloud.userData.speed;

                if (cloud.position.x > 250) cloud.position.x = -250;
                if (cloud.position.x < -250) cloud.position.x = 250;
                if (cloud.position.z > 250) cloud.position.z = -250;
                if (cloud.position.z < -250) cloud.position.z = 250;
            });

            // Update valves
            valves.forEach(valve => {
                if (valve.activated && valve.rotation < Math.PI / 2) {
                    valve.rotation += 0.05;
                    valve.handle.rotation.y = valve.rotation;
                }
            });

            // Update hose if connected
            if (hoseConnected && hoseMesh) {
                updateHoseMesh();
            }

            // Check ground collision
            if (camera.position.y < 1.8) {
                camera.position.y = 1.8;
            }
            
            updateTruckMovement();

            // Player movement
            if (controls && controls.isLocked) {
                direction.set(0, 0, 0);
                if (moveForward) direction.z -= 1;
                if (moveBackward) direction.z += 1;
                if (moveLeft) direction.x += 1;
                if (moveRight) direction.x -= 1;

                direction.normalize();

                const forward = new THREE.Vector3();
                controls.getDirection(forward);
                forward.y = 0;
                forward.normalize();

                const right = new THREE.Vector3();
                right.crossVectors(camera.up, forward).normalize();

                const newPosition = camera.position.clone();
                newPosition.addScaledVector(forward, direction.z * speed);
                newPosition.addScaledVector(right, direction.x * speed);

                if (!checkCollision(newPosition)) {
                    camera.position.x = newPosition.x;
                    camera.position.z = newPosition.z;
                }
            }

            renderer.render(scene, camera);
        }
    