import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Instancia o loader uma única vez para ser reutilizado
const gltfLoader = new GLTFLoader();

/**
 * Função genérica e poderosa para carregar, posicionar e configurar modelos 3D (.glb).
 * @param {object} opcoes - Um objeto com todas as configurações para o modelo.
 * @param {string} opcoes.caminho - O caminho para o arquivo .glb (obrigatório).
 * @param {THREE.Scene} opcoes.cena - A cena principal onde o modelo será adicionado.
 * @param {THREE.Object3D} [opcoes.pai] - O objeto 3D ao qual este modelo será anexado (padrão: a própria cena).
 * @param {string} [opcoes.nome] - Um nome para o objeto, útil para encontrá-lo depois com getObjectByName.
 * @param {THREE.Vector3} [opcoes.posicao] - A posição inicial do modelo.
 * @param {THREE.Vector3} [opcoes.escala] - A escala inicial do modelo.
 * @param {THREE.Euler} [opcoes.rotacao] - A rotação inicial do modelo (em radianos).
 * @param {function(THREE.Group): void} [opcoes.onLoad] - Uma função de callback executada após o carregamento bem-sucedido.
 * @returns {Promise<THREE.Group|null>} Uma promessa que resolve para o modelo carregado ou null em caso de erro.
 */
export async function importarModelo3D(opcoes) {
    // Validação básica para garantir que o caminho e a cena foram fornecidos
    if (!opcoes.caminho || !opcoes.cena) {
        console.error("Erro ao importar modelo: 'caminho' e 'cena' são obrigatórios.", opcoes);
        return null;
    }
    
    try {
        const gltf = await gltfLoader.loadAsync(opcoes.caminho);
        const modelo = gltf.scene;

        // Configura o nome do modelo, se fornecido
        if (opcoes.nome) {
            modelo.name = opcoes.nome;
        }

        // Aplica as transformações, se fornecidas
        if (opcoes.posicao) {
            modelo.position.copy(opcoes.posicao);
        }
        if (opcoes.rotacao) {
            modelo.rotation.copy(opcoes.rotacao);
        }
        if (opcoes.escala) {
            modelo.scale.copy(opcoes.escala);
        }

        // Aplica sombra a todos os sub-objetos
        modelo.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true; // Opcional, faz o objeto receber sombras de outros
            }
        });

        // Adiciona o modelo ao pai especificado ou à cena principal
        const pai = opcoes.pai || opcoes.cena;
        pai.add(modelo);

        // Executa a função de callback, se existir
        if (opcoes.onLoad && typeof opcoes.onLoad === 'function') {
            opcoes.onLoad(modelo);
        }

        console.log(`Modelo de "${opcoes.caminho}" carregado com sucesso.`);
        return modelo;

    } catch (error) {
        console.error(`Falha ao carregar o modelo de "${opcoes.caminho}"`, error);
        return null;
    }
}