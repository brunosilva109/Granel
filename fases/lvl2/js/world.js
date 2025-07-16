import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { GameColors } from './config.js';
import { importarModelo3D } from './utils.js';
import { floatingObjects } from './main.js';
const objectsToUpdate = [];
const textureLoader = new THREE.TextureLoader();
export function createObject({ scene, world, type = 'box', textureURL, color, size, position, mass = 0, rotation = {x:0, y:0, z:0}, textureRepeat }) {
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    
    const materialOptions = {
        roughness: 0.8,
        metalness: 0.2
    };

    if (textureURL) {
        const texture = textureLoader.load(textureURL);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        if (textureRepeat) {
            texture.repeat.set(textureRepeat.x, textureRepeat.y);
        } else {
            texture.repeat.set(size.width / 4, size.depth / 4);
        }
        materialOptions.map = texture;
    } else {
        materialOptions.color = color || 0xffffff;
    }

    const material = new THREE.MeshStandardMaterial(materialOptions);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
    const body = new CANNON.Body({
        mass: mass,
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    if (mass > 0) {
        objectsToUpdate.push({ mesh, body });
    }
    
    return { mesh, body };
}

export async function createLever(scene, world, position) {

    const body = new CANNON.Body({
        mass: 1, 
        position: new CANNON.Vec3(position.x, position.y + 3, position.z),
        shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.1, 0.25)),
    });
    world.addBody(body);

    const leverGroup = new THREE.Group();
    scene.add(leverGroup);
    await importarModelo3D({
        caminho: 'assets/valvula.glb',
        cena: scene,
        pai: leverGroup,
        isGlowing: true,
        escala: new THREE.Vector3(0.2, 0.2, 0.2)
    });
    leverGroup.userData = {
        isInteractable: true,
        interactionType: 'collect',
        physicsBody: body,
        initialY: 1,      // Posição Y inicial
        floatAmplitude: 0.1,       // Amplitude original (que você gostou)
        floatSpeed: 2              // Velocidade original
    };
    objectsToUpdate.push({ mesh: leverGroup, body: body }); // Mantém na lista de física
    floatingObjects.push(leverGroup); 
    leverGroup.name = "Lever";
    leverGroup.userData.isInteractable = true;
    leverGroup.userData.interactionType = 'collect';
    leverGroup.userData.physicsBody = body;
    
    body.userData = { mesh: leverGroup };

    objectsToUpdate.push({ mesh: leverGroup, body: body });
}

function createWall({ scene, world, position, size, rotacao }) {
    const rotationQuaternion = new CANNON.Quaternion();
    if(rotacao)rotationQuaternion.setFromEuler(0, Math.PI / 2, 0);
    const wallBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2)),
        position: new CANNON.Vec3(position.x, position.y, position.z),
        quaternion: rotationQuaternion 
    });
    world.addBody(wallBody);
    const wallGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const wallMesh = new THREE.Mesh(wallGeometry, placeholderMaterial);
    wallMesh.position.copy(position);
    if(rotacao) wallMesh.rotation.y = Math.PI / 2;
    
    
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    scene.add(wallMesh);

    const textureUrl = 'https://media.istockphoto.com/id/183174438/pt/foto/bloco-de-bet%C3%A3o-parede.jpg?b=1&s=612x612&w=0&k=20&c=hbtfX93Tcdgdikw7ULT7GFIsmsbYMXs-6IcpLNPyJpM=';
    const image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = size.width * 50; 
        canvas.height = size.height * 50;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = ctx.createPattern(image, 'repeat');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        wallMesh.material.map = texture;
        wallMesh.material.color.set(0xffffff);
        wallMesh.material.needsUpdate = true;
    };
    
    image.onerror = function () {
        console.warn('Erro ao carregar textura da parede.');
    };
    
    image.src = textureUrl;
}

function addPipe({ scene, world, length, position, rotation }) {
    const pipeRadius = 0.35;
    const geometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, 16);
    const material = new THREE.MeshStandardMaterial({
        color: GameColors.PIPE,
        metalness: 0.8,
        roughness: 0.4
    });
    const pipeMesh = new THREE.Mesh(geometry, material);
    pipeMesh.castShadow = true;
    pipeMesh.receiveShadow = true;
    const pipeShape = new CANNON.Cylinder(pipeRadius, pipeRadius, length, 16);
    const pipeBody = new CANNON.Body({
        mass: 0, // Objeto estático
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape: pipeShape
    });
    pipeBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    pipeMesh.position.copy(pipeBody.position);
    pipeMesh.quaternion.copy(pipeBody.quaternion);

    scene.add(pipeMesh);
    world.addBody(pipeBody);
}

export function buildWorld(scene, world) {
    const groundLevel = -0.1;
    const surfaceHeight = 0.1;
    createObject({ scene, world, size: { width: 100, height: surfaceHeight, depth: 100 }, position: { x: 0, y: groundLevel, z: 0 }, textureURL: 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg', textureRepeat: { x: 25, y: 25 } });
    const roadY = groundLevel + 0.01;
    createObject({ scene, world, size: { width: 5, height: surfaceHeight, depth: 100 }, position: { x: -5, y: roadY, z: 0 }, color: 0x333333 });
    createObject({ scene, world, size: { width: 5, height: surfaceHeight, depth: 100 }, position: { x: 5, y: roadY, z: 0 }, color: 0x333333 });
    const sidewalkY = groundLevel + 0.02;
    const sidewalkTexture = 'https://st.depositphotos.com/1092019/3699/i/450/depositphotos_36998909-stock-photo-paving-slabs-seamless-tileable-texture.jpg';
    createObject({ scene, world, size: { width: 5, height: surfaceHeight, depth: 100 }, position: { x: 0, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 1, y: 20 } });
    createObject({ scene, world, size: { width: 2, height: surfaceHeight, depth: 100 }, position: { x: -8.5, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 1, y: 20 } });
    createObject({ scene, world, size: { width: 2, height: surfaceHeight, depth: 100 }, position: { x: 8.5, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 1, y: 20 } });
    createObject({ scene, world, size: { width: 12, height: surfaceHeight, depth: 20 }, position: { x: 15.5, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 4, y: 6 } });
    createObject({ scene, world, size: { width: 12, height: surfaceHeight, depth: 20 }, position: { x: -15.5, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 4, y: 6 } });
    const wallHeight = 3;
    const wallDepth = 0.5;
    const wallY = groundLevel + (wallHeight / 2);
    const rotacao = true;
    const semRotacao = false;

    createWall({ scene, world, position: { x: 0, y: wallY, z: -50 }, size: { width: 50, height: wallHeight, depth: wallDepth }, semRotacao });
    createWall({ scene, world, position: { x: 0, y: wallY, z: 50 }, size: { width: 50, height: wallHeight, depth: wallDepth } ,semRotacao});
    createWall({ scene, world, position: { x: -25, y: wallY, z: 0 }, size: { width: 100, height: wallHeight, depth: wallDepth}, rotacao });
    createWall({ scene, world, position: { x: 25, y: wallY, z: 0 }, size: { width: 100, height: wallHeight, depth: wallDepth } ,rotacao});
    createLever(scene, world, { x: 0, y: sidewalkY + (surfaceHeight / 2), z: -5 });
        criarCanoVisual({
            scene: scene,
            caminho: 'assets/pipes.glb',
            position: new THREE.Vector3(23, .6, 1.8),
            escala: new THREE.Vector3(0.3, .3, .3   ),
            rotation: new THREE.Euler(0, 0,0 )
        });
        // 1
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: 16.7, y: 2, z: 8.1 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 12 },
            position: { x: 23, y: 2, z: 14 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        //2
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: 14.7, y: 2, z: -.9 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 4 },
            position: { x: 23, y: 2, z: -.9 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        //3
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: 16.7, y: 2, z: -9.7 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 12 },
            position: { x: 23, y: 2, z: -16 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        // 5
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: -16.7, y: 2, z: 8.1 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 12 },
            position: { x: -23, y: 2, z: 14 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        //4
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: -14.7, y: 2, z: -.9 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 4 },
            position: { x: -23, y: 2, z: -.9 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        //6
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 8 },
            position: { x: -16.7, y: 2, z: -9.7 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 12 },
            position: { x: -23, y: 2, z: -16 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });

     
}

async function criarCanoVisual(opcoes) {
    const { scene, caminho, position, rotation, escala } = opcoes;

    // Criamos um grupo para conter nosso modelo, facilitando a manipulação.
    const visualGroup = new THREE.Group();
    visualGroup.position.copy(position);
    visualGroup.rotation.copy(rotation);
    scene.add(visualGroup);
    
    // Importa o modelo .glb e o anexa ao nosso grupo visual
    await importarModelo3D({
        caminho: caminho,
        cena: scene,
        pai: visualGroup, // Anexa o modelo ao grupo
        escala: escala,
    });
    
    // Retorna o grupo caso você precise dele depois
    return visualGroup;
}

export function criarParedeDeColisao(opcoes) {
    const { world, size, position, rotation = {x:0, y:0, z:0}, isVisible = false, scene } = opcoes;

    // --- 1. Cria o Corpo Físico (Sempre) ---
    const shape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
    const body = new CANNON.Body({
        mass: 0, // Estático, não se move
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    // --- 2. Cria o Visualizador (Apenas se isVisible for true) ---
    if (isVisible) {
        if (!scene) {
            console.warn("A 'scene' do Three.js é necessária para criar um visualizador de colisão.");
            return body;
        }

        const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // Verde e de arame
        const visualizerMesh = new THREE.Mesh(geometry, material);

        // Sincroniza a posição e rotação do visualizador com o corpo físico
        visualizerMesh.position.copy(body.position);
        visualizerMesh.quaternion.copy(body.quaternion);

        scene.add(visualizerMesh);
    }

    return body;
}
export { objectsToUpdate };

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
function addTank(x, y, z, radius = 12, height = 38, rotationY = 0,scene) {
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
            scene.add(tankGroup);


            tankGroup.userData = {
            visualMesh: visualTank,
            isTank: true,
            frontDirection: new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY))
            };
        }, undefined, function (error) {
            console.error('Erro ao carregar a textura:', error);
        });
}
export function createSceneryTanks(scene){
    addTank(50, 0, 45, 20, 40,Math.PI,scene);
    addTank(50, 0, 0, 20, 40,Math.PI,scene);
    addTank(50, 0, -45, 20, 40,Math.PI,scene);
    addTank(-50, 0, 45, 20, 40, 0,scene);
    addTank(-50, 0, 0, 20, 40, 0,scene);
    addTank(-50, 0, -45, 20, 40, 0,scene);
}