// Valves system
let valves = [];
let lever = null;
let hasLever = false;
let activatedValves = 0;
const totalValves = 10;

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

            valves.push({
                base: base,
                handle: handle,
                position: new THREE.Vector3(x, y, z),
                activated: false,
                rotation: 0
            });

            objects.push(base, handle);
        }

        function createLever() {
            const leverMaterial = new THREE.MeshStandardMaterial({
                color: 0xaa5500,
                roughness: 0.5,
                metalness: 0.3
            });

            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
            const base = new THREE.Mesh(baseGeometry, leverMaterial);
            base.position.set(
                -20 + Math.random() * 40,
                0.25,
                -20 + Math.random() * 40
            );
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

            scene.remove(lever.base);
            scene.remove(lever.handle);

            document.getElementById('hand').classList.add('visible');
            handVisible = true;

            document.getElementById('objective').innerHTML =
                `Find and activate the valves (${activatedValves}/${totalValves})`;
        }

        function activateValve(valve) {
            valve.activated = true;
            activatedValves++;

            valve.base.material.color.set(0x00ff00);
            valve.handle.material.color.set(0x00ff00);

            valve.animating = true;
            valve.rotation = 0;

            document.getElementById('objective').innerHTML =
                `Find and activate the valves (${activatedValves}/${totalValves})`;

            if (activatedValves >= totalValves) {
                setTimeout(() => {
                    document.getElementById('objective').innerHTML =
                        "Congratulations! You've activated all valves! Now connect the hose to refuel the truck.";
                }, 1000);
            }
        }
