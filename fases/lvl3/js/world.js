import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { importarModelo3D } from './utils.js';
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




export function buildWorld(scene, world) {
    const groundLevel = -0.1;
    const surfaceHeight = 0.1;
    createObject({ scene, world, size: { width: 100, height: surfaceHeight, depth: 200 }, position: { x: 0, y: groundLevel, z: 0 }, textureURL: 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg', textureRepeat: { x: 25, y: 25 } });


        criarCanoVisual({
            scene: scene,
            caminho: 'assets/mapa.glb',
            position: new THREE.Vector3(-10, 0,0),
            escala: new THREE.Vector3(0.3, .3, .3   ),
            rotation: new THREE.Euler(0, 0,0 )
        });
        criarCanoVisual({
            scene: scene,
            caminho: 'assets/Bv.glb',
            position: new THREE.Vector3(10.5, 3,14),
            escala: new THREE.Vector3(0.25, .25, .25),
            rotation: new THREE.Euler(0, 0,0 )
        });
        criarCanoVisual({
            scene: scene,
            caminho: 'assets/Bv.glb',
            position: new THREE.Vector3(10.5, 3,-39.5),
            escala: new THREE.Vector3(0.25, .25, .25),
            rotation: new THREE.Euler(0, 0,0 )
        });
        criarCanoVisual({
            scene: scene,
            caminho: 'assets/Bv.glb',
            position: new THREE.Vector3(0, 3,33),
            escala: new THREE.Vector3(0.25, .25, .25),
            rotation: new THREE.Euler(0, -0 ,0 )
        });
        // tank do meio escadas
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 2, depth: 3 },
            position: { x: 14.7, y: 1, z: 15 },
            rotation: { x: Math.PI /2, y: -Math.PI /4, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 2, height: 2, depth: 2 },
            position: { x: 16.7, y: 1.2, z: 15 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 2 },
            position: { x: 17.7, y: 1.2, z: 15 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 4 },
            position: { x: 15.4, y: 1.2, z: 16 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        // tank esquerdo escadas
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 2, depth: 3 },
            position: { x: 14.7, y: 1, z: -38.5 },
            rotation: { x: Math.PI /2, y: -Math.PI /4, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 2, height: 2, depth: 2 },
            position: { x: 16.7, y: 1.2, z: -38.5},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 2 },
            position: { x: 17.7, y: 1.2, z: -38.5 },
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 4 },
            position: { x: 15.4, y: 1.2, z: -37.5 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
         // tank direito escadas
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 2, depth: 3 },
            position: { x: 14.7, y: 1, z: 34 },
            rotation: { x: Math.PI /2, y: -Math.PI /4, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 2, height: 2, depth: 2 },
            position: { x: 16.7, y: 1.2, z: 34},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 2 },
            position: { x: 17.7, y: 1.2, z: 34},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 4 },
            position: { x: 15.4, y: 1.2, z: 33 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        // PAREDES
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 200 },
            position: { x: -8, y: 1.2, z: 0},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 200 },
            position: { x: 34.5, y: 1.2, z: 0},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 50 },
            position: { x: 17, y: 1.2, z: 70},
            rotation: { x: 0, y: Math.PI/2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: true, // A MÁGICA ACONTECE AQUI
            size: { width: 0.1, height: 8, depth: 50 },
            position: { x: 17, y: 1.2, z: -74},
            rotation: { x: 0, y: Math.PI/2, z: 0 } // Rotacionada em 45 graus
        });
        // interno tank meio
        criarCilindroDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos ele
            radius: 16,
            height: 2,
            position: { x: 15, y: 1, z: -2 }
        });

        // Criando um grande tanque oco onde o jogador pode entrar
        criarCilindroOcoDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos a estrutura
            innerRadius: 15,
            outerRadius: 15.1, // Parede com 0.5 de espessura
            height: 6,
            numSegments: 64, // Mais segmentos = mais redondo
            position: { x: 15, y: 3, z: -2 }
        });
        // interno tank esquerdo
        criarCilindroDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos ele
            radius: 16,
            height: 2,
            position: { x: 15, y: 1, z: -55.5 }
        });

        // Criando um grande tanque oco onde o jogador pode entrar
        criarCilindroOcoDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos a estrutura
            innerRadius: 15,
            outerRadius: 15.1, // Parede com 0.5 de espessura
            height: 6,
            numSegments: 64, // Mais segmentos = mais redondo
            position: { x: 15, y: 3, z: -55.5 }
        });
        // interno tank direito
        criarCilindroDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos ele
            radius: 16,
            height: 2,
            position: { x: 15, y: 1, z: 51 }
        });

        // Criando um grande tanque oco onde o jogador pode entrar
        criarCilindroOcoDeColisao({
            world: world,
            scene: scene,
            isVisible: true, // Para vermos a estrutura
            innerRadius: 15,
            outerRadius: 15.1, // Parede com 0.5 de espessura
            height: 6,
            numSegments: 64, // Mais segmentos = mais redondo
            position: { x: 15, y: 3, z: 51 }
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
export function criarCilindroDeColisao(opcoes) {
    const { world, radius, height, position, rotation = {x:0, y:0, z:0}, isVisible = false, scene } = opcoes;

    // --- 1. Parte Física ---
    // Usamos CANNON.Cylinder em vez de CANNON.Box
    const shape = new CANNON.Cylinder(radius, radius, height, 24); // 24 segmentos para boa precisão
    const body = new CANNON.Body({
        mass: 0,
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    // --- 2. Visualizador Opcional ---
    if (isVisible) {
        if (!scene) {
            console.warn("A 'scene' é necessária para criar um visualizador de colisão.");
            return body;
        }
        // Usamos THREE.CylinderGeometry para o visualizador
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 24);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const visualizerMesh = new THREE.Mesh(geometry, material);
        visualizerMesh.position.copy(body.position);
        visualizerMesh.quaternion.copy(body.quaternion);
        scene.add(visualizerMesh);
    }

    return body;
}
export function criarCilindroOcoDeColisao(opcoes) {
    const { world, innerRadius, outerRadius, height, numSegments = 12, position, rotation = {x:0, y:0, z:0}, isVisible = false, scene } = opcoes;

    // --- 1. Parte Física (Usando Compound Shape) ---
    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);

    const wallThickness = outerRadius - innerRadius;
    const averageRadius = (innerRadius + outerRadius) / 2;

    // Cria cada segmento da parede como um Box
    for (let i = 0; i < numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
        
        // Calcula a posição e a rotação de cada "tijolo" da parede
        const segmentPosition = new CANNON.Vec3(
            averageRadius * Math.cos(angle),
            0,
            averageRadius * Math.sin(angle)
        );
        const segmentRotation = new CANNON.Quaternion();
        segmentRotation.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -angle); // Rotaciona o tijolo para ficar na tangente

        const segmentShape = new CANNON.Box(new CANNON.Vec3(
            wallThickness / 2,
            height / 2,
            (Math.PI * averageRadius) / numSegments // Largura do "tijolo"
        ));
        
        // Adiciona a forma ao corpo composto, com sua posição e rotação relativas
        body.addShape(segmentShape, segmentPosition, segmentRotation);
    }
    world.addBody(body);

    // --- 2. Visualizador Opcional ---
    if (isVisible) {
        if (!scene) {
            console.warn("A 'scene' é necessária para criar um visualizador de colisão.");
            return body;
        }

        // Para o visualizador, criamos um grupo que terá a mesma posição/rotação do corpo
        const visualizerGroup = new THREE.Group();
        visualizerGroup.position.copy(body.position);
        visualizerGroup.quaternion.copy(body.quaternion);
        
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        
        // Também criamos um visual para cada "tijolo"
        for (let i = 0; i < numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
            const segmentPosition = new THREE.Vector3(averageRadius * Math.cos(angle), 0, averageRadius * Math.sin(angle));
            const segmentRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);

            const geometry = new THREE.BoxGeometry(wallThickness, height, (Math.PI * averageRadius) / numSegments * 2);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(segmentPosition);
            mesh.quaternion.copy(segmentRotation);
            visualizerGroup.add(mesh);
        }
        scene.add(visualizerGroup);
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
    addTank(15, 2, -2, 16, 40,Math.PI,scene);
    addTank(15, 2, -55.5, 16, 40,Math.PI,scene);
    addTank(15, 2, 51, 16, 40,Math.PI,scene);


}