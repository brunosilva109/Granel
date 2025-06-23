// Environment elements
let clouds = [];
const CLOUDS_COUNT = 30;
const gravity = -0.02;
        function creatGround(){
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
                addRua(-5, 0, 0, 5,100); // Rua principal vertical
                addRua(5, 0, 0, 5,100); // Rua principal vertical

                // Calçadas
                addCalcada(0, 0, 0, 5, 100, 1, 20); // Calçada esquerda
                addCalcada(-8.5, 0, 0, 2, 100, 1, 20); // Calçada direita
                addCalcada(8.5, 0, 0, 2, 100, 1, 20); // Calçada direita

                addCalcada(15, 0, 0, 12,20, 1, 20);
                addCalcada(-15, 0, 0, 12,20, 1, 20);


                // Create walls
                createWalls();

                // Create pipes and valves
                createEnvironment();

                // Create lever
                createLever();


                // Create hose pickup point
                createHosePickup(10, 0.5, 10);
                createHosePickup(-10, 0.5, -10);

            

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

        function createSky() {
            const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
            const skyMaterial = new THREE.MeshPhongMaterial({
                color: 0x0384fa,
                emissive: 0x0384fa,
                side: THREE.BackSide
            });
            const sky = new THREE.Mesh(skyGeometry, skyMaterial);
            scene.add(sky);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
        }
        function createClouds() {
            const cloudTexture = new THREE.TextureLoader().load('https://static.vecteezy.com/system/resources/thumbnails/047/309/311/small/ozone-cumulus-puffy-clouds-shapes-on-transparent-backgrounds-3d-render-png.png');

            for (let i = 0; i < CLOUDS_COUNT; i++) {
                const cloudMaterial = new THREE.SpriteMaterial({
                    map: cloudTexture,
                    transparent: true,
                    opacity: 0.8
                });

                const cloud = new THREE.Sprite(cloudMaterial);
                let escalaX =Math.random() * 60;
                let escalay =escalaX/2;
                let escalaz =escalaX/20;
                cloud.scale.set(escalaX, escalay, escalaz);

                cloud.position.x = Math.random() * 400 - 200;
                cloud.position.y = Math.random() * 50 + 50;
                cloud.position.z = Math.random() * 400 - 200;

                cloud.userData = {
                    speed: Math.random() * 0.02 + 0.01,
                    rotation: Math.random() * Math.PI * 2
                };

                clouds.push(cloud);
                scene.add(cloud);
            }
        }
        function createWalls() {
            const wallSettings = {
                width: 100,
                height: 3,
                depth: 0.5,
                showTexture: true,
                textureUrl: 'https://media.istockphoto.com/id/183174438/pt/foto/bloco-de-bet%C3%A3o-parede.jpg?b=1&s=612x612&w=0&k=20&c=hbtfX93Tcdgdikw7ULT7GFIsmsbYMXs-6IcpLNPyJpM=',
                textureSize: { width: 800, height: 530 }
            };

            function createFixedSizeTexture(textureURL, targetWidth, targetHeight, callback) {
                const image = new Image();
                image.crossOrigin = 'Anonymous';

                image.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    const ratio = Math.min(
                        targetWidth / image.width,
                        targetHeight / image.height
                    );
                    const width = image.width * ratio;
                    const height = image.height * ratio;

                    ctx.drawImage(
                        image,
                        (targetWidth - width),
                        (targetHeight - height) / 2,
                        width,
                        height
                    );

                    const texture = new THREE.CanvasTexture(canvas);
                    callback(texture);
                };

                image.onerror = function () {
                    console.warn('Erro ao carregar textura, usando colisão invisível');
                    callback(null);
                };

                image.src = textureURL;
            }

            function createWallWithCollision(position, rotation) {
                const wallGeometry = new THREE.BoxGeometry(
                    wallSettings.width,
                    wallSettings.height,
                    wallSettings.depth
                );

                const collisionMaterial = new THREE.MeshBasicMaterial({
                    visible: false,
                    transparent: true,
                    opacity: 0
                });

                const wall = new THREE.Mesh(wallGeometry, collisionMaterial);
                wall.position.set(...position);
                wall.rotation.set(...rotation);
                wall.userData = {
                    isCollidable: true,
                    isWall: true
                };

                scene.add(wall);
                objects.push(wall);

                if (wallSettings.showTexture) {
                    createFixedSizeTexture(wallSettings.textureUrl,
                        wallSettings.textureSize.width,
                        wallSettings.textureSize.height,
                        function (texture) {
                            if (texture) {
                                const visualMaterial = new THREE.MeshStandardMaterial({
                                    map: texture,
                                    color: 0xffffff,
                                    roughness: 0.7,
                                    metalness: 0.1,
                                    side: THREE.DoubleSide
                                });

                                texture.wrapS = THREE.RepeatWrapping;
                                texture.wrapT = THREE.RepeatWrapping;
                                texture.repeat.set(wallSettings.width / 2, wallSettings.height);

                                const visualWall = new THREE.Mesh(wallGeometry, visualMaterial);
                                visualWall.position.set(...position);
                                visualWall.rotation.set(...rotation);
                                visualWall.receiveShadow = true;
                                scene.add(visualWall);
                            }
                        }
                    );
                }
            }

            const walls = [
                { position: [0, wallSettings.height / 2, -50], rotation: [0, 0, 0] },
                { position: [0, wallSettings.height / 2, 50], rotation: [0, 0, 0] },
                { position: [-25, wallSettings.height / 2, 0], rotation: [0, Math.PI / 2, 0] },
                { position: [25, wallSettings.height / 2, 0], rotation: [0, Math.PI / 2, 0] }
            ];

            walls.forEach(wall => {
                createWallWithCollision(wall.position, wall.rotation);
            });
        }
        const tanks = [];

        function createTank(tankId, motorPos, valvePositions, connectorPos,painelId) {
            const motor = addMotor(motorPos.x, motorPos.z, motorPos.side,painelId);
            const valves = valvePositions.map(pos => createValve(pos.x, pos.y, pos.z));
            const connector = createHoseConnector(connectorPos.x, connectorPos.z, tankId);

            // Registro no conector do tanque
            connector.userData.tankId = tankId;

            const tank = {
                id: tankId,
                motor: motor,
                valves: valves,
                hoseConnector: connector
            };
            tank.motor.tank = tank; 
            tanks.push(tank);
        }
        function createNumberPlate(number, x, y, z) {
            // Criar canvas para a textura
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            // Fundo da placa
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Texto do número
            ctx.font = '48px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);

            // Criar textura com o canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter; // para evitar borrão

            // Criar material usando a textura
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false });

            // Criar plano
            const geometry = new THREE.PlaneGeometry(1, 0.5);
            const plate = new THREE.Mesh(geometry, material);

            plate.position.set(x, y, z);

            // Deixar sempre "de frente" para a câmera (opcional)
            plate.lookAt(camera.position);

            // Adicionar à cena
            scene.add(plate);

            return plate;
        }
        function createEnvironment() {
            const motorPositions = [
            { number: 1, x: 16, y: 1.5, z: 7.6 },
            { number: 2, x: 16, y: 1.5, z: 0 },
            { number: 3, x: 16, y: 1.5, z: -7.6 },
            { number: 4, x: -16, y: 1.5, z: 7.6 },
            { number: 5, x: -16, y: 1.5, z: 0 },
            { number: 6, x: -16, y: 1.5, z: -7.6 },
        ];

        motorPositions.forEach(pos => {
            createNumberPlate(pos.number, pos.x, pos.y, pos.z);
        });
            // Tanques da ESQUERDA: 1, 2, 3
            createTank(1, 
                { x: 16, z: 7.6, side: 1 }, 
                [
                    { x: 12, y: 0.6, z: 7.6 },
                    { x: 24, y: 0.8, z: 18 }
                ],
                { x: 11.3, z: 7.6 },1
            );

            createTank(2, 
                { x: 16, z: 0, side: 1 }, 
                [
                    { x: 12, y: 0.6, z: 0 },
                    { x: 23, y: 0.8, z: 0 }
                ],
                { x: 11.3, z: 0 },2
            );

            createTank(3, 
                { x: 16, z: -7.6, side: 1 }, 
                [
                    { x: 12, y: 0.6, z: -7.6 },
                    { x: 24, y: 0.8, z: -18 }
                ],
                { x: 11.3, z: -7.6 },3
            );

            // Tanques da DIREITA: 4, 5, 6
            createTank(4, 
                { x: -16, z: 7.6, side: 3 }, 
                [
                    { x: -12, y: 0.6, z: 7.6 },
                    { x: -24, y: 0.8, z: 18 }
                ],
                { x: -11.3, z: 7.6 },4
            );

            createTank(5, 
                { x: -16, z: 0, side: 3 }, 
                [
                    { x: -12, y: 0.6, z: 0 },
                    { x: -23, y: 0.8, z: 0 }
                ],
                { x: -11.3, z: 0 },5
            );

            createTank(6, 
                { x: -16, z: -7.6, side: 3 }, 
                [
                    { x: -12, y: 0.6, z: -7.6 },
                    { x: -24, y: 0.8, z: -18 }
                ],
                { x: -11.3, z: -7.6 },6
            );
            


            // Tubos tank1
            addPipe(24, 0.8, 25, 0, Math.PI/2, Math.PI / 2, 35); 
            addPipe(21.7, 0.8, 7.6, 0, 0, Math.PI / 2, 5);
            addPipe(25.3, 0.8, 42.4, 0, 0, Math.PI / 2, 3);
            addPipe(13, 0.6, 7.6, 0, 0, Math.PI / 2, 3);
            addBarreira(13, 0.8, 7.6, 0, 0, Math.PI / 2, 3);
            addPipe(16.8, 3.3, 7.6, 0, 0, Math.PI / 2, 5);
            addPipe(19, 2, 7.6, 0, 0, 0, 3);
            addPipe(14.5, 2.3, 7.6, 0, 0, 0, 2);



            // Tubos tank2
            addPipe(22.7, 0.8, 0, 0, 0, Math.PI / 2, 8);
            addPipe(16.8, 3.3, 0, 0, 0, Math.PI / 2, 5);
            addPipe(19, 2, 0, 0, 0, 0, 3);
            addPipe(14.5, 2.3, 0, 0, 0, 0, 2);
            addPipe(13, 0.6, 0, 0, 0, Math.PI / 2, 3);
            addBarreira(13, 0.8, 0, 0, 0, Math.PI / 2, 3);

            // Tubos tank3
            addPipe(24, 0.8, -25, 0, Math.PI/2, Math.PI / 2, 35); 
            addPipe(21.7, 0.8, -7.6, 0, 0, Math.PI / 2, 5);
            addPipe(25.3, 0.8, -42.4, 0, 0, Math.PI / 2, 3);
            addPipe(16.8, 3.3, -7.6, 0, 0, Math.PI / 2, 5);
            addPipe(19, 2, -7.6, 0, 0, 0, 3);
            addPipe(14.5, 2.3, -7.6, 0, 0, 0, 2);
            addPipe(13, 0.6, -7.6, 0, 0, Math.PI / 2, 3);
            addBarreira(13, 0.8, -7.6, 0, 0, Math.PI / 2, 3);

            // Tubos tank4
            addPipe(-24, 0.8, 25, 0, Math.PI/2, Math.PI / 2, 35); 
            addPipe(-21.7, 0.8, 7.6, 0, 0, Math.PI / 2, 5);
            addPipe(-25.3, 0.8, 42.4, 0, 0, Math.PI / 2, 3);
            addPipe(-16.8, 3.3, 7.6, 0, 0, Math.PI / 2, 5);
            addPipe(-19, 2, 7.6, 0, 0, 0, 3);
            addPipe(-14.5, 2.3, 7.6, 0, 0, 0, 2);
            addPipe(-13, 0.6, 7.6, 0, 0, Math.PI / 2, 3);
            addBarreira(-13, 0.8, 7.6, 0, 0, Math.PI / 2, 3);

            // Tubos tank5
            addPipe(-22.7, 0.8, 0, 0, 0, Math.PI / 2, 8);
            addPipe(-16.8, 3.3, 0, 0, 0, Math.PI / 2, 5);
            addPipe(-19, 2, 0, 0, 0, 0, 3);
            addPipe(-14.5, 2.3, 0, 0, 0, 0, 2);
            addPipe(-13, 0.6, 0, 0, 0, Math.PI / 2, 3);
            addBarreira(-13, 0.8,0, 0, 0, Math.PI / 2, 3);

            // Tubos tank6
            addPipe(-24, 0.8, -25, 0, Math.PI/2, Math.PI / 2, 35); 
            addPipe(-21.7, 0.8, -7.6, 0, 0, Math.PI / 2, 5);
            addPipe(-25.3, 0.8, -42.4, 0, 0, Math.PI / 2, 3);
            addPipe(-16.8, 3.3, -7.6, 0, 0, Math.PI / 2, 5);
            addPipe(-19, 2, -7.6, 0, 0, 0, 3);
            addPipe(-14.5, 2.3, -7.6, 0, 0, 0, 2);
            addPipe(-13, 0.6, -7.6, 0, 0, Math.PI / 2, 3);
            addBarreira(-13, 0.8, -7.6, 0, 0, Math.PI / 2, 3);




            // Tanques
            addTank(50, 0, 45, 20, 40,Math.PI);
            addTank(50, 0, 0, 20, 40,Math.PI);
            addTank(50, 0, -45, 20, 40,Math.PI);
            addTank(-50, 0, 45, 20, 40, 0);
            addTank(-50, 0, 0, 20, 40, 0);
            addTank(-50, 0, -45, 20, 40, 0);

            addTruck(-5, 0, 60); 

        }
        function addPipe(x, y, z, rotationX = 0, rotationY = 0, rotationZ = 0, length = 10, radius = 0.3) {
            const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
            const material = new THREE.MeshStandardMaterial({ color: 0x777777 });
            const pipe = new THREE.Mesh(geometry, material);

            pipe.position.set(x, y, z);
            pipe.rotation.set(rotationX, rotationY, rotationZ);
            pipe.castShadow = true;
            pipe.receiveShadow = true;
            scene.add(pipe);

            if (Math.abs(rotationZ - Math.PI / 2) < 0.01) {
                const wallGeometry = new THREE.BoxGeometry(1.8, length, radius * 2);
                const wallMaterial = new THREE.MeshBasicMaterial({
                    visible: false,
                    transparent: true,
                    opacity: 0
                });

                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(x, y + 0.2, z);
                wall.rotation.copy(pipe.rotation);
                wall.userData.isCollidable = true;

                scene.add(wall);
                objects.push(wall);
            }

            objects.push(pipe);
        }

        function createFixedSizeTexture(imageURL, targetWidth = 1024, targetHeight = 212, callback) {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                const aspectRatio = image.width / image.height;
                let drawWidth = targetWidth;
                let drawHeight = drawWidth / aspectRatio;

                if (drawHeight > targetHeight) {
                    drawHeight = targetHeight;
                    drawWidth = drawHeight * aspectRatio;
                }

                const dx = (targetWidth - drawWidth) / 2;
                const dy = (targetHeight - drawHeight) / 2;
                ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

                const texture = new THREE.CanvasTexture(canvas);
                callback(texture);
            };
            image.src = imageURL;
        }
       
        function addTank(x, y, z, radius = 12, height = 38, rotationY = 0) {
            const textureLoader = new THREE.TextureLoader();
            const textureURL = 'https://media.licdn.com/dms/image/v2/C4E0BAQHI_zstESOxMg/company-logo_200_200/company-logo_200_200/0/1630598811160?e=2147483647&v=beta&t=eppAvNQChz7myaHU80_cU6h0j1XYIeONuASz20bWPhg';

            createFixedSizeTexture(textureURL, 1024, 212, function (texture) {
                const tankGroup = new THREE.Group();
                tankGroup.position.set(x, y, z);
                tankGroup.rotation.y = rotationY;

                const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
                geometry.rotateY(Math.PI / 2);
                geometry.scale(-1, 1, 1);
                
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0.4,
                    side: THREE.DoubleSide
                });

                const visualTank = new THREE.Mesh(geometry, material);
                visualTank.position.y = height / 2;
                visualTank.castShadow = true;
                visualTank.receiveShadow = true;
                tankGroup.add(visualTank);

                const collisionMesh = createTankCollision(tankGroup, radius, height);

                scene.add(tankGroup);
                objects.push(collisionMesh);

                tankGroup.userData = {
                    collisionMesh: collisionMesh,
                    visualMesh: visualTank,
                    isTank: true,
                    frontDirection: new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY))
                };

            }, undefined, function (error) {
                console.error('Erro ao carregar a textura:', error);
            });
        }

        function createTankCollision(tankGroup, radius, height) {
            const collisionGeometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
            const collisionMaterial = new THREE.MeshBasicMaterial({
                visible: false,
                transparent: true,
                opacity: 0
            });

            const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
            collisionMesh.position.y = height / 2;
            collisionMesh.userData = {
                isCollidable: true,
                isTankCollision: true
            };

            tankGroup.add(collisionMesh);
            return collisionMesh;
        }
