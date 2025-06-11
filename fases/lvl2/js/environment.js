// Environment elements
let clouds = [];
const CLOUDS_COUNT = 30;
const gravity = -0.02;


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
                cloud.scale.set(20, 10, 1);

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
                { position: [-50, wallSettings.height / 2, 0], rotation: [0, Math.PI / 2, 0] },
                { position: [50, wallSettings.height / 2, 0], rotation: [0, Math.PI / 2, 0] }
            ];

            walls.forEach(wall => {
                createWallWithCollision(wall.position, wall.rotation);
            });
        }

        function createEnvironment() {
            // Tubos horizontais
            addPipe(10, 0.8, 10, 0, 0, Math.PI / 2, 10);
            addPipe(-10, 0.8, -10, 0, 0, Math.PI / 2, 10);

            // Tubos verticais
            addPipe(5, 3, -5, 0, 0, 0, 6);
            addPipe(-15, 3, 5, 0, 0, 0, 8);

            // Tubos Horizontais compridos
            addPipe(48, 0.8, 0, 0, Math.PI/2, Math.PI / 2, 100); 
            addPipe(46, 0.8, 0, 0, Math.PI/2, Math.PI / 2, 100); 

            // Válvulas
            createValve(48, 1, 0);
            createValve(0, 1, 45);
            createValve(11.5, 1, 10);
            createValve(-8.5, 1, -10);

            // Tanques
            addTank(75, 0, 45, 20, 40,Math.PI);
            addTank(75, 0, 0, 20, 40,Math.PI);
            addTank(75, 0, -45, 20, 40,Math.PI);

            addTank(-75, 0, 45, 20, 40, 0);
            addTank(-75, 0, 0, 20, 40, 0);
            addTank(-75, 0, -45, 20, 40, 0);

            addTruck(0, 0, 60); 

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
