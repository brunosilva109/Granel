import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Array para guardar todos os objetos que precisam de sincronização entre física e visual
const objectsToUpdate = [];

// Carregador de textura reutilizável
const textureLoader = new THREE.TextureLoader();

/**
 * Função Mestre para criar objetos com corpo físico e visual.
 * (sem alterações nesta função)
 */
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

export function createLever(scene, world, position) {
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(position.x, position.y + 0.1, position.z),
        shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.1, 0.25)),
    });
    world.addBody(body);

    const leverGroup = new THREE.Group();
    // ... (resto da sua função createLever, que já está ótima)
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xffee00 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16), baseMaterial);
    base.castShadow = true;
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), handleMaterial);
    handle.position.y = 0.5;
    handle.castShadow = true;
    leverGroup.add(base);
    leverGroup.add(handle);
    scene.add(leverGroup);

    // ✅ Vamos dar um nome para facilitar a depuração
    leverGroup.name = "Lever";
    
    // A lógica de interação será movida para o interaction.js
    leverGroup.userData.isInteractable = true;
    leverGroup.userData.interactionType = 'collect';
    leverGroup.userData.physicsBody = body;
    
    body.userData = { mesh: leverGroup };

    objectsToUpdate.push({ mesh: leverGroup, body: body });
}


/**
 * NOVA FUNÇÃO: Cria uma parede com física e a textura processada via Canvas.
 * @param {object} options - Opções para a criação da parede.
 */
function createWall({ scene, world, position, size, rotacao }) {
    const rotationQuaternion = new CANNON.Quaternion();

    // Defina a rotação do quaternion a partir dos ângulos Euler (x, y, z)
    if(rotacao)rotationQuaternion.setFromEuler(0, Math.PI / 2, 0); // Rotação de 90° no eixo Y
    // 1. Cria o corpo físico imediatamente
    const wallBody = new CANNON.Body({
        mass: 0, // Estático
        shape: new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2)),
        position: new CANNON.Vec3(position.x, position.y, position.z),
        quaternion: rotationQuaternion 
    });
    world.addBody(wallBody);

    // 2. Cria o Mesh visual com um material temporário
    const wallGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const wallMesh = new THREE.Mesh(wallGeometry, placeholderMaterial);
    wallMesh.position.copy(position);
    if(rotacao) wallMesh.rotation.y = Math.PI / 2;
    
    
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    scene.add(wallMesh);
    
    // 3. Lógica de carregamento e processamento da textura (do seu código)

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
        
        // 4. Atualiza o material do mesh com a nova textura
        wallMesh.material.map = texture;
        wallMesh.material.color.set(0xffffff);
        wallMesh.material.needsUpdate = true;
    };
    
    image.onerror = function () {
        console.warn('Erro ao carregar textura da parede.');
    };
    
    image.src = textureUrl;
}


/**
 * Constrói o cenário da cidade.
 * @param {THREE.Scene} scene - A cena Three.js.
 * @param {CANNON.World} world - O mundo Cannon-es.
 */
export function buildWorld(scene, world) {
    const groundLevel = -0.1;
    const surfaceHeight = 0.1;

    // ---- Grama, Ruas e Calçadas ----
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
    
    // ---- Paredes do Limite do Mapa ----
    const wallHeight = 3;
    const wallDepth = 0.5;
    const wallY = groundLevel + (wallHeight / 2);
    const rotacao = true;
    const semRotacao = false;

    createWall({ scene, world, position: { x: 0, y: wallY, z: -50 }, size: { width: 50, height: wallHeight, depth: wallDepth }, semRotacao });
    createWall({ scene, world, position: { x: 0, y: wallY, z: 50 }, size: { width: 50, height: wallHeight, depth: wallDepth } ,semRotacao});
    createWall({ scene, world, position: { x: -25, y: wallY, z: 0 }, size: { width: 100, height: wallHeight, depth: wallDepth}, rotacao });
    createWall({ scene, world, position: { x: 25, y: wallY, z: 0 }, size: { width: 100, height: wallHeight, depth: wallDepth } ,rotacao});


    // ---- Objetos Interativos ----
    createLever(scene, world, { x: 0, y: sidewalkY + (surfaceHeight / 2), z: -5 });
}


// Exporta a lista de objetos a serem atualizados para o loop principal
export { objectsToUpdate };