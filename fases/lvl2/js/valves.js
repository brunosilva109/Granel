// Valves system
let valves = [];
let lever = null;
let hasLever = false;
let activatedValves = 0;
let totalValves = 2;

        function createValve(x, y, z) {
            const valveMaterial = new THREE.MeshStandardMaterial({
                color: 0xff4444,
                roughness: 0.3,
                metalness: 0.7
            });

            const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.7, 16);
            const base = new THREE.Mesh(baseGeometry, valveMaterial);
            base.position.set(x, y, z);
            base.castShadow = true;
            base.receiveShadow = true;

            const handleGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
            const handle = new THREE.Mesh(handleGeometry, valveMaterial);
            handle.position.set(x, y + 0.45, z);
            handle.castShadow = true;
            handle.receiveShadow = true;

            scene.add(base);
            scene.add(handle);

            const valve = {
                base: base,
                handle: handle,
                position: new THREE.Vector3(x, y, z),
                activated: false,
                rotation: 0
            };

            valves.push(valve);
            objects.push(base, handle);

            return valve; // <- ESSENCIAL para usar depois
        }


        function createLever() {
            const leverMaterial = new THREE.MeshStandardMaterial({
                color: 0xaa5500,
                roughness: 0.5,
                metalness: 0.3
            });

            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
            const base = new THREE.Mesh(baseGeometry, leverMaterial);
            base.position.set(0,0.25,0);
            base.castShadow = true;
            base.receiveShadow = true;

            const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16);
            const handle = new THREE.Mesh(handleGeometry, leverMaterial);
            handle.position.set(base.position.x, base.position.y + 0.75, base.position.z);
            handle.rotation.z = Math.PI / 2;
            handle.castShadow = true;
            handle.receiveShadow = true;

            scene.add(base);
            scene.add(handle);

            lever = {
                base: base,
                handle: handle,
                position: base.position.clone(),
                picked: false
            };

            objects.push(base, handle);
        }
        
        function pickLever() {
            hasLever = true;
            lever.picked = true;
            dropHose();

            scene.remove(lever.base);
            scene.remove(lever.handle);

            document.getElementById('hand').classList.add('visible');
            handVisible = true;

            document.getElementById('objective').innerHTML =
                `Ative as Valvulas (${activatedValves}/${totalValves})`;
        }
        function dropLever(){
            hasLever = false;
            lever.picked = false;

            document.getElementById('hand').classList.remove('visible');
            handVisible = false;
            createLever();
        }

        function activateValve(valve) {
            valve.activated = true;
            activatedValves++;

            valve.base.material.color.set(0x00ff00);
            valve.handle.material.color.set(0x00ff00);

            valve.animating = true;
            valve.rotation = 0;

            document.getElementById('objective').innerHTML =
                `Ative as Valvulas  (${activatedValves}/${totalValves})`;

            if (activatedValves >= totalValves) {
                setTimeout(() => {
                    document.getElementById('objective').innerHTML =
                        "Conecte o Mangote no Caminão";
                }, 1000);
            }
        }
        
        function deactivateValve(valve) {
            if (!valve.activated) return;

            valve.activated = false;
            activatedValves--;

            valve.base.material.color.set(0xff0000);
            valve.handle.material.color.set(0xff0000);

            valve.deactivating = true;
            valve.animating = true;

            document.getElementById('objective').innerHTML =
                `Ative as Valvulas  (${activatedValves}/${totalValves})`;
        }
        function resetAllValves() {
    tanks.forEach(tank => {
        // Desativa todas as válvulas
        tank.valves.forEach(valve => {
            deactivateValve(valve);
        });

        // Desliga o motor se estiver ligado
        const motor = tank.motor;
        if (motor) {
            motor.running = false;
            if (motor.panel) {
                motor.panel.lightOn.material.emissive.set(0x000000);
                motor.panel.lightOff.material.emissive.set(0xff0000);
            }
        }
    });

    // Zera o contador global
    activatedValves = 0;

    document.getElementById('objective').innerHTML =
        `Ative as Valvulas  (${activatedValves}/${totalValves})`;

    console.log("🔧 Todas as válvulas foram desativadas e motores desligados.");
}

