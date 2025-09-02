//world.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { importarModelo3D } from './utils.js';
import { floatingObjects } from './main.js';
import { criarCano, criarColisao } from './canos.js';
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
        mass: 0, 
        position: new CANNON.Vec3(position.x, position.y + 3, position.z),
        shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.1, 0.25)),
    });
    world.addBody(body);

    const leverGroup = new THREE.Group();
    scene.add(leverGroup);
    await importarModelo3D({
        caminho: 'assets/paper.glb',
        cena: scene,
        pai: leverGroup,
        isGlowing: true,
        escala: new THREE.Vector3(3, 3, 3)
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
}



export function buildWorld(scene, world) {
    const groundLevel = -0.1;
    const surfaceHeight = 0.1;
    const roadY = groundLevel + 0.01;
    const sidewalkY = groundLevel + 0.02;
    const sidewalkTexture = 'https://st.depositphotos.com/1092019/3699/i/450/depositphotos_36998909-stock-photo-paving-slabs-seamless-tileable-texture.jpg';
    const wallHeight = 3.25;
    const wallDepth = 0.5;
    const wallY = groundLevel + (wallHeight / 2);
    const rotacao = true;
    const semRotacao = false;
    // grama/ piso do mundo
    createObject({ scene, world, size: { width: 200, height: surfaceHeight, depth: 200 }, position: { x: 0, y: groundLevel, z: 0 }, textureURL: 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg', textureRepeat: { x: 25, y: 25 } });
    // rua
    createObject({ scene, world, size: { width: 50, height: surfaceHeight, depth: 200 }, position: { x: -50, y: roadY, z: 0 }, color: 0x333333 });
    createObject({ scene, world, size: { width: 100, height: surfaceHeight, depth: 15}, position: { x: 25, y: roadY, z: 80}, color: 0x333333 });
     //calçada central
    createObject({ scene, world, size: { width: 5, height: surfaceHeight, depth: 200 }, position: { x: -75, y: sidewalkY, z: 0 }, textureURL: sidewalkTexture, textureRepeat: { x: 1, y: 20 } });
    createObject({ scene, world, size: { width: 5, height: surfaceHeight, depth: 175 }, position: { x: -25, y: sidewalkY, z: -15 }, textureURL: sidewalkTexture, textureRepeat: { x: 1, y: 20 } });
    createObject({ scene, world, size: { width: 105, height: surfaceHeight, depth: 5 }, position: { x: 25, y: sidewalkY, z: 75 }, textureURL: sidewalkTexture, textureRepeat: { x: 20, y: 1 } });
    
    //parede central
    //createWall({ scene, world, position: { x: 0, y: wallY, z: -50 }, size: { width: 50, height: wallHeight, depth: wallDepth }, semRotacao });
//bacia
    createWall({ scene, world, position: { x: 12.5, y: wallY, z: -7.5 }, size: { width: 150, height: wallHeight, depth: wallDepth }, rotacao });
    createWall({ scene, world, position: { x: 87.5, y: wallY, z: -7.5 }, size: { width: 150, height: wallHeight, depth: wallDepth }, rotacao });
    createWall({ scene, world, position: { x: 50, y: wallY, z: -82.5 }, size: { width:75, height: wallHeight, depth: wallDepth }, semRotacao });
    createWall({ scene, world, position: { x: 50, y: wallY, z: 67.5}, size: { width:75, height: wallHeight, depth: wallDepth }, semRotacao });
    //piso
    createWall({ scene, world, position: { x:50, y:0, z: -7.5 }, size: { width: 75, height: 0.2, depth: 150 }, semRotacao });
    //ESCADA
    createLStairs({scene: scene,world: world,position: { x: 22, y: -0.1, z:64 },height: 3.5,width: 3.0,platformWidth: 7,rotationY: -Math.PI / 2});
// patio de bombas
    createWall({ scene, world, position: { x: -10, y:0, z: 40 }, size: { width: 25, height: 0.1, depth: 40}, semRotacao });
    createWall({ scene, world, position: { x: 1.5, y:5, z: 21 }, size: { width: 1.5, height: 10, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: -21.5, y:5, z: 21 }, size: { width: 1.5, height: 10, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: 1.5, y:5, z: 59}, size: { width: 1.5, height: 10, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: -21.5, y:5, z: 59}, size: { width: 1.5, height: 10, depth: 1.5}, semRotacao });
    createObject({ scene, world, size: { width: 25, height: 1, depth: 40}, position: { x: -10, y: 10, z:40}, color: 0xffffff });

// plataforma de carregamento
    createWall({ scene, world, position: { x: -40, y:10, z: -40 }, size: { width: 1.5, height: 20, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: -40, y:10, z: -60 }, size: { width: 1.5, height: 20, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: -60, y:10, z: -40 }, size: { width: 1.5, height: 20, depth: 1.5}, semRotacao });
    createWall({ scene, world, position: { x: -60, y:10, z: -60 }, size: { width: 1.5, height: 20, depth: 1.5}, semRotacao });
    createObject({ scene, world, size: { width: 45, height: 1, depth: 25}, position: { x: -50, y: 20, z:-50}, color: 0xffffff });   
    //lever
    createLever(scene, world, { x: -25, y: sidewalkY + (surfaceHeight / 2), z: 45 });
    //tank
    addTank(50, 2.5, 45, 18, 45 ,Math.PI,scene);
    addTank(50, 2.5, -60, 18, 45,Math.PI,scene);
    addTank(50, 2.5, -5, 18, 45,Math.PI,scene);
    //canos
    criarCano(scene, world);
    //criarColisao(scene, world);
    createLargeCylinder({scene: scene,world: world,position: { x: 50, y: 0, z: 45 }});
    createLargeCylinder({scene: scene,world: world,position: { x: 50, y: 0, z: -5 }});
    createLargeCylinder({scene: scene,world: world,position: { x: 50, y: 0, z: -60 }});
    createPlatformStairs({
        scene: scene,
        world: world,
        position: { x: 45, y: -0.1, z: 14 },
        height: 3,
        width: 2,
        platformLength: 3,
        doorSide: 'right', // Abertura na lateral esquerda
        rotationY: Math.PI/2 // Rotacionada em 180 graus
    });
    createPlatformStairs({
        scene: scene,
        world: world,
        position: { x: 45, y: -0.1, z: -41 },
        height: 3,
        width: 2,
        platformLength: 3,
        doorSide: 'right', // Abertura na lateral esquerda
        rotationY: Math.PI/2 // Rotacionada em 180 graus
    });
    createPlatformStairs({
        scene: scene,
        world: world,
        position: { x: 45, y: -0.1, z: 26 },
        height: 3,
        width: 2,
        platformLength: 3,
        doorSide: 'left', // Abertura na lateral esquerda
        rotationY: Math.PI/2 // Rotacionada em 180 graus
    });
    createPlatformStairs({
        scene: scene,
        world: world,
        position: { x: -42, y: -0.1, z: -35 },
        height: 5,
        width: 3,
        platformLength: 22,
        doorSide: 'right', // Abertura na lateral esquerda
        rotationY: Math.PI // Rotacionada em 180 graus
    });
    createPlatformStairs({
        scene: scene,
        world: world,
        position: { x: -58, y: -0.1, z: -35 },
        height: 5,
        width: 3,
        platformLength: 22,
        doorSide: 'left', // Abertura na lateral esquerda
        rotationY: Math.PI // Rotacionada em 180 graus
    });
     
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
        const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // Verde e de arame
        const visualizerMesh = new THREE.Mesh(geometry, material);

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

function createLStairs({ scene, world, position, height, width, platformWidth, rotationY = 0 }) {
    // --- Constantes de Design ---
    const stairAngle = Math.PI / 4.5;
    const stepThickness = 0.25;
    const railingHeight = 1.5;
    const postRadius = 0.05;

    // --- Materiais ---
    const stairMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.5 });
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.1, roughness: 0.8 });
    
    // --- Objetos Principais ---
    const stairGroup = new THREE.Group();
    const stairBody = new CANNON.Body({ mass: 0 });

    // --- Cálculos ---
    const rampLength = height / Math.sin(stairAngle);
    const rampHorizontalLength = height / Math.tan(stairAngle);

    function addPart(geo, mat, pos, rot = {x:0, y:0, z:0}) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.rotation.set(rot.x, rot.y, rot.z);
        stairGroup.add(mesh);
        const shape = new CANNON.Box(new CANNON.Vec3(geo.parameters.width/2, geo.parameters.height/2, geo.parameters.depth/2));
        const quaternion = new CANNON.Quaternion().setFromEuler(rot.x, rot.y, rot.z);
        stairBody.addShape(shape, new CANNON.Vec3(pos.x, pos.y, pos.z), quaternion);
    }

    // --- Rampas e Plataforma ---
    const rampUpPos = { x: 1.5, y: height / 2, z: rampHorizontalLength / 2 };
    addPart(new THREE.BoxGeometry(width, stepThickness, rampLength), stairMaterial, rampUpPos, { x: -stairAngle, y: 0, z: 0 });
    const platformPos = { x: platformWidth / 2, y: height, z: rampHorizontalLength + width / 2 };
    addPart(new THREE.BoxGeometry(platformWidth, stepThickness, width), stairMaterial, platformPos);
    const rampDownPos = { x: platformWidth - 1.5, y: height / 2, z: rampHorizontalLength / 2 };
    addPart(new THREE.BoxGeometry(width, stepThickness, rampLength), stairMaterial, rampDownPos, { x: -stairAngle, y: 0, z: 0 });

    // --- Guarda-Corpo ---
    function createRailingSegment(start, end) {
        const startPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, railingHeight), railingMaterial);
        startPost.position.set(start.x, start.y + railingHeight / 2, start.z);
        stairGroup.add(startPost);
        const endPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, railingHeight), railingMaterial);
        endPost.position.set(end.x, end.y + railingHeight / 2, end.z);
        stairGroup.add(endPost);
        const railVec = new THREE.Vector3().subVectors(end, start);
        const railLength = railVec.length();
        const rail = new THREE.Mesh(new THREE.BoxGeometry(postRadius * 2, postRadius * 2, railLength), railingMaterial);
        rail.position.lerpVectors(start, end, 0.5).y += railingHeight;
        rail.lookAt(new THREE.Vector3(end.x, end.y + railingHeight, end.z));
        stairGroup.add(rail);
        const railShape = new CANNON.Box(new CANNON.Vec3(postRadius, postRadius, railLength / 2));
        const railBodyPos = new CANNON.Vec3(rail.position.x, rail.position.y, rail.position.z);
        const railQuaternion = new CANNON.Quaternion().copy(rail.quaternion);
        stairBody.addShape(railShape, railBodyPos, railQuaternion);
    }
    
    const w = width / 2;
    const rampUpX = 1.5;
    const rampDownX = platformWidth - 1.5;
    
    // Guarda-corpo externo (lado de fora do L)
    const p_out_A = { x: rampUpX - w, y: 0, z: 0 };
    const p_out_B = { x: rampUpX - w, y: height, z: rampHorizontalLength };
    const p_out_C = { x: rampUpX - w, y: height, z: rampHorizontalLength + width };
    const p_out_D = { x: rampDownX + w, y: height, z: rampHorizontalLength + width };
    const p_out_E = { x: rampDownX + w, y: height, z: rampHorizontalLength };
    const p_out_F = { x: rampDownX + w, y: 0, z: 0 };
    createRailingSegment(p_out_A, p_out_B);
    createRailingSegment(p_out_B, p_out_C);
    createRailingSegment(p_out_C, p_out_D);
    createRailingSegment(p_out_D, p_out_E);
    createRailingSegment(p_out_E, p_out_F);
    
    // Guarda-corpo interno (lado de dentro do L)
    const p_in_A = { x: rampUpX + w, y: 0, z: 0 };
    const p_in_B = { x: rampUpX + w, y: height, z: rampHorizontalLength };
    const p_in_C = { x: rampDownX - w, y: height, z: rampHorizontalLength };
    const p_in_D = { x: rampDownX - w, y: 0, z: 0 };
    createRailingSegment(p_in_A, p_in_B);
    
    // ✅ CORREÇÃO: Adiciona o guarda-corpo que faltava na frente da plataforma.
    createRailingSegment(p_in_B, p_in_C);
    
    createRailingSegment(p_in_C, p_in_D);
    
    // --- Montagem Final ---
    stairBody.position.set(position.x, position.y, position.z);
    stairBody.quaternion.setFromEuler(0, rotationY, 0);
    stairGroup.position.copy(stairBody.position);
    stairGroup.quaternion.copy(stairBody.quaternion);

    world.addBody(stairBody);
    scene.add(stairGroup);
}
function createLargeCylinder({ scene, world, position }) {
    // --- Dimensões Solicitadas ---
    const radius = 18;
    const height = 2.5;

    // --- Parte Visual (Three.js) ---
    const geometry = new THREE.CylinderGeometry(
        radius,     // Raio do topo
        radius,     // Raio da base
        height,     // Altura
        32          // Segmentos (para deixá-lo redondo)
    );
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111, // Um preto não-absoluto, para melhor visual com luzes
        roughness: 0.8,
        metalness: 0.2
    });
    const cylinderMesh = new THREE.Mesh(geometry, material);
    cylinderMesh.castShadow = true;
    cylinderMesh.receiveShadow = true;
    
    // --- Parte Física (Cannon-es) ---
    // ✅ A forma de colisão usa EXATAMENTE as mesmas dimensões da visual
    const cylinderShape = new CANNON.Cylinder(radius, radius, height, 32);
    const cylinderBody = new CANNON.Body({
        mass: 0, // Objeto estático, não se move
        shape: cylinderShape,
        // A posição do corpo físico é no seu centro.
        // Como a 'position' que recebemos é da base, subimos metade da altura.
        position: new CANNON.Vec3(position.x, position.y + height / 2, position.z)
    });

    // --- Sincronização e Adição ao Mundo ---
    // A posição do objeto visual deve ser a mesma do corpo físico
    cylinderMesh.position.copy(cylinderBody.position);

    scene.add(cylinderMesh);
    world.addBody(cylinderBody);
}
function createPlatformStairs({ scene, world, position, height, width, platformLength, doorSide = 'front', rotationY = 0 }) {
    // --- Constantes de Design ---
    const stairAngle = Math.PI / 4.5;
    const stepThickness = 0.25;
    const railingHeight = 1.5;
    const postRadius = 0.05;

    // --- Materiais ---
    const stairMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.5 });
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.1, roughness: 0.8 });
    
    // --- Objetos Principais ---
    const stairGroup = new THREE.Group();
    const stairBody = new CANNON.Body({ mass: 0 });

    // --- Cálculos ---
    const rampLength = height / Math.sin(stairAngle);
    const rampHorizontalLength = height / Math.tan(stairAngle);

    function addPart(geo, mat, pos, rot = {x:0, y:0, z:0}) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.rotation.set(rot.x, rot.y, rot.z);
        stairGroup.add(mesh);
        const shape = new CANNON.Box(new CANNON.Vec3(geo.parameters.width/2, geo.parameters.height/2, geo.parameters.depth/2));
        const quaternion = new CANNON.Quaternion().setFromEuler(rot.x, rot.y, rot.z);
        stairBody.addShape(shape, new CANNON.Vec3(pos.x, pos.y, pos.z), quaternion);
    }

    // --- 1. Rampa de Subida ---
    const rampUpPos = { x: 0, y: height / 2, z: rampHorizontalLength / 2 };
    addPart(new THREE.BoxGeometry(width, stepThickness, rampLength), stairMaterial, rampUpPos, { x: -stairAngle, y: 0, z: 0 });

    // --- 2. Plataforma ---
    const platformPos = { x: 0, y: height, z: rampHorizontalLength + platformLength / 2 };
    addPart(new THREE.BoxGeometry(width, stepThickness, platformLength), stairMaterial, platformPos);

    // --- 3. Guarda-Corpo ---
    function createRailingSegment(start, end) {
        // ... (a função createRailingSegment continua a mesma)
        const startPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, railingHeight), railingMaterial);
        startPost.position.set(start.x, start.y + railingHeight / 2, start.z);
        stairGroup.add(startPost);
        const endPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, railingHeight), railingMaterial);
        endPost.position.set(end.x, end.y + railingHeight / 2, end.z);
        stairGroup.add(endPost);
        const railVec = new THREE.Vector3().subVectors(end, start);
        const railLength = railVec.length();
        const rail = new THREE.Mesh(new THREE.BoxGeometry(postRadius * 2, postRadius * 2, railLength), railingMaterial);
        rail.position.lerpVectors(start, end, 0.5).y += railingHeight;
        rail.lookAt(new THREE.Vector3(end.x, end.y + railingHeight, end.z));
        stairGroup.add(rail);
        const railShape = new CANNON.Box(new CANNON.Vec3(postRadius, postRadius, railLength / 2));
        const railBodyPos = new CANNON.Vec3(rail.position.x, rail.position.y, rail.position.z);
        const railQuaternion = new CANNON.Quaternion().copy(rail.quaternion);
        stairBody.addShape(railShape, railBodyPos, railQuaternion);
    }

    const w = width / 2;

    // Pontos chave da plataforma no topo
    const backLeft =  { x: -w, y: height, z: rampHorizontalLength };
    const backRight = { x:  w, y: height, z: rampHorizontalLength };
    const frontLeft = { x: -w, y: height, z: rampHorizontalLength + platformLength };
    const frontRight ={ x:  w, y: height, z: rampHorizontalLength + platformLength };

    // Guarda-corpo das rampas (sempre existem)
    createRailingSegment({ x: -w, y: 0, z: 0 }, backLeft);
    createRailingSegment({ x:  w, y: 0, z: 0 }, backRight);

    // ✅ LÓGICA DA "PORTINHA": Cria os guarda-corpos da plataforma, exceto no lado da porta
    if (doorSide !== 'left') {
        createRailingSegment(backLeft, frontLeft); // Guarda-corpo da esquerda
    }
    if (doorSide !== 'right') {
        createRailingSegment(backRight, frontRight); // Guarda-corpo da direita
    }
    if (doorSide !== 'front') {
        createRailingSegment(frontLeft, frontRight); // Guarda-corpo da frente
    }
    
    // --- Montagem Final ---
    stairBody.position.set(position.x, position.y, position.z);
    stairBody.quaternion.setFromEuler(0, rotationY, 0);
    stairGroup.position.copy(stairBody.position);
    stairGroup.quaternion.copy(stairBody.quaternion);

    world.addBody(stairBody);
    scene.add(stairGroup);
}