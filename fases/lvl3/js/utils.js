
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltfLoader = new GLTFLoader();

export async function importarModelo3D(opcoes) {
    if (!opcoes.caminho) {
        console.error("Erro ao importar modelo: a opção 'caminho' é obrigatória.");
        return null;
    }
    
    try {
        const gltf = await gltfLoader.loadAsync(opcoes.caminho);
        const modelo = gltf.scene;
        if (opcoes.nome) modelo.name = opcoes.nome;
        if (opcoes.posicao) modelo.position.copy(opcoes.posicao);
        if (opcoes.rotacao) modelo.rotation.copy(opcoes.rotacao);
        if (opcoes.escala) modelo.scale.copy(opcoes.escala);
        modelo.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        modelo.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // ✅ NOVO: Adiciona o brilho se a opção estiver ativada
                if (opcoes.isGlowing) {
                    // Faz o material emitir uma luz amarelada
                    child.material.emissive = new THREE.Color(0xffff00); 
                    // A intensidade do brilho, que poderemos animar
                    child.material.emissiveIntensity = 0; 
                }
            }
        });

        if (opcoes.pai) {
            opcoes.pai.add(modelo);
        } else if (opcoes.cena) {
            opcoes.cena.add(modelo);
        } else {
             console.warn(`Modelo de "${opcoes.caminho}" foi carregado, mas não foi adicionado a um 'pai' ou 'cena'.`);
        }
        if (opcoes.onLoad) opcoes.onLoad(modelo);

        return modelo; 

    } catch (error) {
        console.error(`Falha ao carregar o modelo de "${opcoes.caminho}"`, error);
        return null;
    }
}