    // Arquivo: js/trava.js
    import * as THREE from 'three';
    import * as CANNON from 'cannon-es';
    import { playerState } from './player.js';
    import { showInfoToast } from './ui.js';
    import { completeTask, isTaskCompleted } from './quest.js';
    // --- Variáveis de Módulo ---
    let scene, world;
    const state = {
        collectible: null,
        preview: null,
        placed: null,
    };

    // =======================================================================
    // === PAINEL DE CONTROLE DA TRAVA ===
    // Altere os valores abaixo para reposicionar os objetos.
    // =======================================================================
    const INITIAL_POSITION = new THREE.Vector3(-25, 0.1, 25);
    const INITIAL_ROTATION = new THREE.Euler(0, -Math.PI / 2, 0);

    const TARGET_POSITION = new THREE.Vector3(-28.5, 0.1, 41); // Posição do alvo
    const TARGET_ROTATION = new THREE.Euler(0, -Math.PI / 2, 0);    // Rotação do alvo
    // =======================================================================

    /**
     * Função principal que inicializa o sistema da trava.
     */
    export function setupTrava(options) {
        scene = options.scene;
        world = options.world;
        createCollectibleTrava();
    }

    // --- Funções de Criação e Interação ---

    function createChockGeometry() {
        const shape = new THREE.Shape([ new THREE.Vector2(0, 0), new THREE.Vector2(0, 0.5), new THREE.Vector2(1., 0) ]);
        // ✅ Objeto mais grosso, como solicitado
        return new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
    }

    function createCollectibleTrava() {
        const geometry = createChockGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const mesh = new THREE.Mesh(geometry, material);
        const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(0.75, 0.4, 0.25)) });

        body.position.copy(INITIAL_POSITION);
        mesh.position.copy(INITIAL_POSITION);
        
        const quaternion = new THREE.Quaternion().setFromEuler(INITIAL_ROTATION);
        body.quaternion.copy(quaternion);
        mesh.quaternion.copy(quaternion);

        mesh.name = "TravaPickup";
        mesh.userData = {
            isInteractable: true,
            onInteract: () => {
                playerState.hasTrava = true;
                scene.remove(mesh);
                world.removeBody(body);
                state.collectible = null;
                
                showInfoToast("Trava coletada!", 2000, 'info');
            }
        };
        state.collectible = { mesh, body };
        scene.add(mesh);
        world.addBody(body);
    }

    export function createTravaPreview() {
        const geometry = createChockGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.copy(TARGET_POSITION);
        const quaternion = new THREE.Quaternion().setFromEuler(TARGET_ROTATION);
        mesh.quaternion.copy(quaternion);

        mesh.name = "TravaPreview";
        mesh.userData = {
            isInteractable: true,
            onInteract: () => {
                if (playerState.hasTrava) {
                    playerState.hasTrava = false;
                    scene.remove(mesh);
                    state.preview = null;
                    createPlacedTrava();
                    showInfoToast("Trava posicionada.", 2000, 'info');
                    completeTask('place_trava');
                } else {
                    showInfoToast("Você precisa coletar a trava primeiro.", 3000, 'error');
                }
            }
        };
        state.preview = mesh;
        scene.add(mesh);
    }

    function createPlacedTrava() {
        const geometry = createChockGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const mesh = new THREE.Mesh(geometry, material);
        
        const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(0.75, 0.4, 0.25)) });
        body.position.copy(TARGET_POSITION);
        const quaternion = new THREE.Quaternion().setFromEuler(TARGET_ROTATION);
        body.quaternion.copy(quaternion);
        
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
            mesh.name = "PlacedTrava";
            mesh.userData = {
                isInteractable: true,
                onInteract: () => {
                     if (isTaskCompleted('disconnect_hose')) {
                        playerState.hasTrava = true; // Pega de volta
                        world.removeBody(body);
                        scene.remove(mesh);
                        state.placed = null;
                        showInfoToast("Trava removida.", 2000, 'info');
                        completeTask('remove_trava');
                    }else {
                    showInfoToast("Ainda não é hora de remover a trava.", 3000, 'error');
                }
                } 
            };
        
        
        state.placed = { mesh, body };
        scene.add(mesh);
        world.addBody(body);
    }