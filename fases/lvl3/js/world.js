import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Array para guardar todos os objetos que precisam de sincronização entre física e visual
const objectsToUpdate = [];

// Carregador de textura reutilizável
const textureLoader = new THREE.TextureLoader();

/**
 * Função Mestre para criar objetos com corpo físico e visual.
 * @param {object} options - Opções para a criação do objeto.
 * @param {THREE.Scene} options.scene - A cena Three.js onde o mesh será adicionado.
 * @param {CANNON.World} options.world - O mundo Cannon-es onde o corpo físico será adicionado.
 * @param {string} options.type - Tipo de geometria ('box', 'sphere', etc.).
 * @param {string} options.textureURL - URL da textura para o material.
 * @param {object} options.size - Dimensões do objeto { width, height, depth }.
 * @param {object} options.position - Posição inicial { x, y, z }.
 * @param {number} [options.mass=0] - Massa do objeto. 0 para objetos estáticos (chão, paredes).
 * @param {object} [options.rotation={x:0, y:0, z:0}] - Rotação inicial.
 * @returns {object} - Retorna um objeto contendo o mesh (visual) e o body (físico).
 */
export function createObject({ scene, world, type, textureURL, size, position, mass = 0, rotation = {x:0, y:0, z:0} }) {
    // ---- Parte Visual (Three.js) ----
    let geometry;
    switch (type) {
        case 'box':
            geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(size.radius, 32, 32);
            break;
        // Adicionar outros tipos como 'cylinder' se necessário
        default:
            geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    }

    const texture = textureLoader.load(textureURL);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(size.width / 4, size.depth / 4); // Repete a textura a cada 4 unidades

    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // ---- Parte Física (Cannon-es) ----
    let shape;
    switch (type) {
        case 'box':
            shape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
            break;
        case 'sphere':
            shape = new CANNON.Sphere(size.radius);
            break;
        default:
            shape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
    }

    const body = new CANNON.Body({
        mass: mass,
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    // Se o objeto tem massa, ele precisa ser atualizado a cada frame
    if (mass > 0) {
        objectsToUpdate.push({ mesh, body });
    }
    
    // Retorna o objeto com colisão (corpo físico) e visual
    return { mesh, body };
}

/**
 * Constrói o cenário inicial do jogo.
 * @param {THREE.Scene} scene - A cena Three.js.
 * @param {CANNON.World} world - O mundo Cannon-es.
 */
export function buildWorld(scene, world) {
    // Chão
    createObject({
        scene,
        world,
        type: 'box',
        textureURL: 'https://threejsfundamentals.org/threejs/resources/images/checker.png',
        size: { width: 100, height: 1, depth: 100 },
        position: { x: 0, y: -0.5, z: 0 },
        mass: 0 // Estático
    });

    // Algumas caixas para interagir
    createObject({
        scene,
        world,
        type: 'box',
        textureURL: 'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
        size: { width: 2, height: 2, depth: 2 },
        position: { x: 5, y: 1, z: -10 },
        mass: 1 // Dinâmico
    });

     createObject({
        scene,
        world,
        type: 'box',
        textureURL: 'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
        size: { width: 4, height: 4, depth: 4 },
        position: { x: -8, y: 2, z: -12 },
        mass: 5 // Dinâmico e mais pesado
    });
}

// Exporta a lista de objetos a serem atualizados para o loop principal
export { objectsToUpdate };