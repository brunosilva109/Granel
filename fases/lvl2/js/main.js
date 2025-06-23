// Game variables
let scene, camera, renderer, controls;
let objects = [];
let lastTime = 0;
const FPS = 60; // Desired FPS
const frameTime = 1000 / FPS; // Time per frame in ms

// Initialize the game
init();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    scene.fog = new THREE.FogExp2(0x333333, 0.001);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
    antialias: false, // Desabilita o antialiasing (pode deixar a performance melhor em jogos simples)
    preserveDrawingBuffer: false, // Desabilita o buffer de desenho preservado, economizando memória
    powerPreference: "high-performance", // Dá prioridade à performance da GPU em vez da qualidade
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Desabilita o sombreamento, se não for essencial para seu jogo
document.getElementById('container').appendChild(renderer.domElement);


    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Menor intensidade
    directionalLight.castShadow = false; // Desabilita as sombras (para melhorar a performance)
    scene.add(directionalLight);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    creatGround();
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';

    controls = new THREE.PointerLockControls(camera, document.body);

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) {
            controls.lock();
        }
    });

    document.body.requestPointerLock = document.body.requestPointerLock ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    // Control the frame rate to 60 FPS
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= frameTime) {
        lastTime = currentTime - (deltaTime % frameTime); // Keep the time in sync

        // Update clouds
        clouds.forEach(cloud => {
            cloud.position.x += Math.sin(cloud.userData.rotation) * cloud.userData.speed;
            cloud.position.z += Math.cos(cloud.userData.rotation) * cloud.userData.speed;

            if (cloud.position.x > 250) cloud.position.x = -250;
            if (cloud.position.x < -250) cloud.position.x = 250;
            if (cloud.position.z > 250) cloud.position.z = -250;
            if (cloud.position.z < -250) cloud.position.z = 250;
        });

        updateSystemState();

        // Update valves
        valves.forEach(valve => {
            if (valve.activated && valve.animating && valve.rotation < Math.PI / 2) {
                valve.rotation += 0.05;
                valve.handle.rotation.y = valve.rotation;

                if (valve.rotation >= Math.PI / 2) {
                    valve.animating = false;
                }
            }

            if (!valve.activated && valve.animating && valve.rotation > 0) {
                valve.rotation -= 0.05;
                valve.handle.rotation.y = valve.rotation;

                if (valve.rotation <= 0) {
                    valve.animating = false;
                    valve.rotation = 0; // garantir valor limpo
                }
            }
        });

        // Update hose if connected
        if (hoseConnected && hoseMesh) {
            updateHoseMesh();
        }

        // Check ground collision
        if (camera.position.y < 1.8) {
            camera.position.y = 1.8;
        }

        updateTruckMovement();

        // Player movement
        if (controls && controls.isLocked) {
            direction.set(0, 0, 0);
            if (moveForward) direction.z -= 1;
            if (moveBackward) direction.z += 1;
            if (moveLeft) direction.x += 1;
            if (moveRight) direction.x -= 1;

            direction.normalize();

            const forward = new THREE.Vector3();
            controls.getDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(camera.up, forward).normalize();

            const newPosition = camera.position.clone();
            newPosition.addScaledVector(forward, direction.z * speed);
            newPosition.addScaledVector(right, direction.x * speed);

            if (!checkCollision(newPosition)) {
                camera.position.x = newPosition.x;
                camera.position.z = newPosition.z;
            }
        }

        renderer.render(scene, camera);
    }
}
