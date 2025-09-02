//utils.js
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

const modeloCache = new Map();

export async function carregarModeloNoCache(opcoes) {
    const caminho = opcoes.caminho;
    if (!caminho) {
        console.error("O 'caminho' é obrigatório para carregar um modelo.");
        return null;
    }

    // Se o modelo já está no cache, retorna ele imediatamente.
    if (modeloCache.has(caminho)) {
        return modeloCache.get(caminho);
    }

    // Se não, carrega o modelo pela primeira vez.
    try {
        const gltf = await gltfLoader.loadAsync(caminho);
        const modelo = gltf.scene;

        // Guarda o modelo carregado no cache para uso futuro.
        modeloCache.set(caminho, modelo);
        
        return modelo;
    } catch (error) {
        console.error(`Falha ao carregar o modelo de "${caminho}"`, error);
        return null;
    }
}

export function clonarModelo(modeloOriginal, opcoes) {
    if (!modeloOriginal || !opcoes.scene) {
        console.error("É necessário um modelo original e uma cena para clonar.");
        return null;
    }
    
    // Cria o clone!
    const clone = modeloOriginal.clone();

    // Aplica as transformações (posição, rotação, etc.)
    if (opcoes.position) clone.position.copy(opcoes.position);
    if (opcoes.rotation) clone.rotation.copy(opcoes.rotation);
    if (opcoes.scale) clone.scale.copy(opcoes.scale);
    if (opcoes.nome) clone.name = opcoes.nome;

    // Garante que o clone e seus filhos projetem e recebam sombras
    clone.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Adiciona o clone à cena
    opcoes.scene.add(clone);
    
    return clone;
}