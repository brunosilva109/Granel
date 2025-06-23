const motors = [];
// Função auxiliar para adicionar uma geometria à cena
function addGeometry(geometry, color, x, y, z, rotationX,rotationY,rotationZ) {
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.z = rotationZ;  // Definir rotação em torno do eixo Z
  mesh.rotation.y = rotationY; 
  mesh.rotation.x = rotationX; 
  mesh.position.set(x, y, z); // Posição ajustada
  return mesh;
}
let motorOn = false;
// Função para adicionar o motor com a estrutura ajustada
function addMotor(baseX, baseZ,num,painelId) {
    // Cria um "grupo" que serve como um ponto de origem para todos os componentes do motor
    let panelGroup;
    const motorGroup = new THREE.Group();  // Usamos um grupo para o motor
    // Posições relativas para cada geometria (agora em relação ao ponto baseX, baseY, baseZ)
            const part1 = addGeometry(new THREE.BoxGeometry(4, 0.2, 1.5), 0x000000, 0, 0, 0, 0,0,0);      // Base do motor (caixa)
            const part2 = addGeometry(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 32), 0x0000ff,  1, 0.5, 0, 0,0, Math.PI / 2); // Cilindro
            const part3 = addGeometry(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 32), 0x0000ff, - 1.5,  0.5, 0, 0,0 ,Math.PI / 2); // Cilindro
            const part4 = addGeometry(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32), 0x0000ff,  - 1.5, 1.1, 0, 0,0 , 0); // Cilindro
            const part5 = addGeometry(new THREE.CylinderGeometry(0.19, 0.18, 0.1, 32), 0x000000, - 1.5, 1.3, 0 , 0,0, 0); // Cilindro
            const part6 = addGeometry(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32), 0xaa5500, 0, 0.7, 0, 0,0 ,Math.PI / 2); // Cilindro
            const part7 = addGeometry(new THREE.BoxGeometry(0.3, 0.7, 0.7), 0xaa5500, 0, 0.4, 0, 0,0 , 0); // Caixa
            const part8 = addGeometry(new THREE.CylinderGeometry(0.2, 0.2, 3, 32), 0x777777, 0, 0.5, 0 ,0,0 , Math.PI / 2); // Cilindro grande
            motorGroup.add(part1,part2,part3,part4,part5,part6,part7,part8);

            motorGroup.position.set(baseX,0,baseZ);
  
    switch (num) {
        
        case 1:
             
            panelGroup = createMotorPanel(baseX+1,baseZ-.5,Math.PI);
            addBarreira(baseX, 0.8, baseZ , 0, 0, Math.PI / 2, 3);
            break;   
        case 2:
           panelGroup =  createMotorPanel(baseX+.5,baseZ+1,Math.PI / 2);
            motorGroup.rotation.y = -Math.PI/2;
            addBarreira(baseX, 0.8, baseZ , 0, Math.PI / 2, Math.PI / 2, 3);
            break;
        case 3:
            panelGroup = createMotorPanel(baseX-1,baseZ+.5,0);
            motorGroup.rotation.y = Math.PI;
            addBarreira(baseX, 0.8, baseZ , 0, 0, Math.PI / 2, 3);
            
            break;
        case 4:
            panelGroup = createMotorPanel(baseX-.5,baseZ-1,-Math.PI / 2);
            motorGroup.rotation.y = Math.PI/2;
            addBarreira(baseX, 0.8, baseZ , 0, Math.PI / 2, Math.PI / 2, 3);
            break;
    }
      
        panelGroup.userData.lightOn = motorLightOn;
        panelGroup.userData.lightOff = motorLightOff;
        panelGroup.userData.button = motorButton;

        // Armazene referência do motor no botão
        panelGroup.userData.motor = motorGroup;

        // Também associe o painel ao grupo motor (se precisar)
        motorGroup.userData.panel = panelGroup;
        panelGroup.userData.motorId = painelId;

        // Adiciona motor e painel à cena
        scene.add(motorGroup);
        scene.add(panelGroup);


    // Agora podemos adicionar o grupo à cena
    scene.add(motorGroup); // Adiciona todo o conjunto à cena
    const motor = {
        mesh: motorGroup,
        canRun: false,
        panel: {
            button: motorButton,
            lightOn: motorLightOn,
            lightOff: motorLightOff
        }
    };

    // Armazena em um array global se quiser:
    motors.push(motor);

    // Ou use diretamente ao montar os tanks
    return motor;
}
    function addBarreira(x, y, z, rotationX = 0, rotationY = 0, rotationZ = 0, length = 10, radius = 0.5) {
        // Cria a geometria do cano
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);

        // Define o material do cano como invisível
        const material = new THREE.MeshStandardMaterial({ color: 0x777777, visible: false }); // Canos invisíveis
        const pipe = new THREE.Mesh(geometry, material);

        // Posiciona e rota o cano
        pipe.position.set(x, y, z);
        pipe.rotation.set(rotationX, rotationY, rotationZ);


        // Adiciona o cano invisível à cena
        scene.add(pipe);

        // Verifica a rotação e cria a parede de colisão se necessário
        if (Math.abs(rotationZ - Math.PI / 2) < 0.01) {
            // Cria a geometria da parede de colisão (invisível também)
            const wallGeometry = new THREE.BoxGeometry(1.8, length, radius * 2);
            const wallMaterial = new THREE.MeshBasicMaterial({
                visible: false, // Invisível
                transparent: true,
                opacity: 0
            });

            // Cria a parede de colisão
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, y + 0.2, z);
            wall.rotation.copy(pipe.rotation);
            wall.userData.isCollidable = true;

            // Adiciona a parede invisível à cena
            scene.add(wall);

            // Adiciona a parede ao array de objetos para verificação de colisão
            objects.push(wall);
        }

        // Adiciona o cano invisível ao array de objetos para verificação de colisão
        objects.push(pipe);
    }

let motorButton, motorLightOn, motorLightOff;

function createMotorPanel(x,z, rotation) {
    const panelGroup = new THREE.Group();

    // Base do painel
    const panelGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.2);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    panelGroup.add(panelMesh);

    // Luz "Ligado"
    const onLightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const onLightMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x000000 });
    motorLightOn = new THREE.Mesh(onLightGeometry, onLightMaterial);
    motorLightOn.position.set(-0.1, 0.15, 0.1);
    panelGroup.add(motorLightOn);

    // Luz "Desligado"
    const offLightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const offLightMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff0000 });
    motorLightOff = new THREE.Mesh(offLightGeometry, offLightMaterial);
    motorLightOff.position.set(0.1, 0.15, 0.1);
    panelGroup.add(motorLightOff);

    // Botão (cilindro)
    const buttonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
    const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0x0088ff });
    motorButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
    motorButton.rotation.x = Math.PI / 2;
    motorButton.position.set(0, -0.05, 0.1);
    panelGroup.add(motorButton);

    motorButton.name = 'motorButton'; // Para identificar no click

    // Posição na cena
    panelGroup.position.set(x,.8, z);
    panelGroup.rotation.y = rotation;
    scene.add(panelGroup);
    return panelGroup;
    
}

function toggleMotor(motor) {
    const panel = motor.userData.panel;
    
    const verifica = checkSystemStatus(); // ← Aqui
    if (!verifica) {
        showMotorMessage("Conecte o mangote e abra as válvulas corretas antes de ligar o motor!");
        return;
    }
     // Verifica se o ID do painel corresponde ao motor selecionado
    if (selectedMotorId !== panel.userData.motorId) {
        showMotorMessage(`Este não é o motor selecionado! Você selecionou o motor ${selectedMotorId}. Selecione o motor correto.`);
        return;  // Se o motor não for o selecionado, não faz nada
    }

    motor.userData.running = ! motor.userData.running;

    if (!panel?.userData) {
        console.warn("Painel não encontrado no motor:", motor);
        return;
    }

    const lightOn = panel.userData.lightOn;
    const lightOff = panel.userData.lightOff;

    if (verifica) {
        lightOn.material.emissive.set(0x00ff00);
        lightOff.material.emissive.set(0x000000);
        motorOn = true;
        startRefueling(motor); // adapte para tanque específico, se necessário
    } else {
        lightOn.material.emissive.set(0x000000);
        lightOff.material.emissive.set(0xff0000);
        motorOn = false;
        stopRefueling(motor); // idem
    }

    if ( motor.userData.running) {
        motorOn = true;
    console.log('O motor está ligado');
    } else {
        motorOn = false;
        motor.userData.running = false;
        resetMotor();
        stopRefueling();
        console.log('O motor está desligado');
    }
}



window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    if (clickedObject.name === 'motorButton') {
      // Encontre o painel (pai do botão)
      const panelGroup = clickedObject.parent;

      if (panelGroup && panelGroup.userData.motor) {
        const motorGroup = panelGroup.userData.motor;

        toggleMotor(motorGroup);
      }
    }
  }
}

function showMotorMessage(text, duration = 3000) {
    const msgBox = document.getElementById('motor-message');
    msgBox.innerText = text;
    msgBox.style.display = 'block';

    setTimeout(() => {
        msgBox.style.display = 'none';
    }, duration);
}


