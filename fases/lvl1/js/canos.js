//canos.js
import * as THREE from 'three';
import { carregarModeloNoCache, clonarModelo } from './utils.js'
import { criarParedeDeColisao } from './world.js';
//const moldeDoTank= await carregarModeloNoCache({ caminho: 'assets/TANK.glb' });
const moldeDoCanoReto= await carregarModeloNoCache({ caminho: 'assets/CanoReto.glb' });//X = 3.25 OU SEJA 1.62 DO MEIO
const moldeDoCanoRetoCurto= await carregarModeloNoCache({ caminho: 'assets/CanoRetoCurto.glb' });// 1.5 OU SEJA 0.75 DO MEIO
const moldeDoCanoCruvo= await carregarModeloNoCache({ caminho: 'assets/CanoCurvo.glb' });// .9 OU SEJA 0.45 DO MEIO
const moldeDaBaseValvula = await carregarModeloNoCache({ caminho: 'assets/BaseValvula.glb' });

export function criarCano(scene, world){
  const dc = 1.95
  const dl = 3.25
        CanosPadroes(scene,-27,30,0,4);
        CanosPadroes(scene,-27,40,dc,6);
        CanosPadroes(scene,-27,50,dl,8);
        fecharFase(scene, world);
        criarColisao(scene, world,30);
        criarColisao(scene, world,40);
        criarColisao(scene, world,50);
      clonarModelo(moldeDoCanoRetoCurto, {
        scene: scene,
        position: new THREE.Vector3(3.6, 0.7, 40), 
        scale: new THREE.Vector3(0.3, .4, .3),
        rotation: new THREE.Euler(0, 0,Math.PI / 2)
      });
      clonarModelo(moldeDoCanoReto, {
        scene: scene,
        position: new THREE.Vector3(4.2, 0.7, 50), 
        scale: new THREE.Vector3(0.3, .3, .3),
        rotation: new THREE.Euler(0,Math.PI / 2,0)
      });
      
        
        
}
function CanosPadroes(scene, x, z,d,c) {
  if(d!= 0){
    clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*5), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*6), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  }
  if(d >3){
    clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*7), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*8), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  }
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 6.1+d, 0.7, z-2.86-4.35*c-2.85), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0,Math.PI / 2,0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 6.1+d+4.35, 0.7, z-2.86-4.35*c-2.85), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0,Math.PI / 2,0)
  });
  clonarModelo(moldeDoCanoCruvo, {
    scene: scene,
    position: new THREE.Vector3(3+d+0.5, 0.7, z-2.86-4.35*c-2.57), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(-Math.PI / 2,0 , 0)
  });
  clonarModelo(moldeDoCanoCruvo, {
    scene: scene,
    position: new THREE.Vector3(3+d, 0.7, z-0.25), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(Math.PI / 2,0 , -Math.PI / 2)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*1), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*2), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*3), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3( 3.25+d, 0.7, z-2.86-4.35*4), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3(x + 18.3, 4, z), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, Math.PI / 2, 0)
  });
  clonarModelo(moldeDoCanoReto, {
    scene: scene,
    position: new THREE.Vector3(0.4, 0.7, z), 
    scale: new THREE.Vector3(0.3, .3, .4),
    rotation: new THREE.Euler(0, Math.PI / 2, 0)
  });
  clonarModelo(moldeDoCanoCruvo, {
    scene: scene,
    position: new THREE.Vector3(x + 20.9, 3.75, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, -Math.PI / 2)
  });

  clonarModelo(moldeDoCanoCruvo, {
    scene: scene,
    position: new THREE.Vector3(x + 15.7, 3.75, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, 0)
  });

  clonarModelo(moldeDoCanoRetoCurto, {
    scene: scene,
    position: new THREE.Vector3(x + 15.45, 2.53, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, 0)
  });

  clonarModelo(moldeDoCanoRetoCurto, {
    scene: scene,
    position: new THREE.Vector3(x + 21.15, 2.3, z), 
    scale: new THREE.Vector3(0.3, .4, .3),
    rotation: new THREE.Euler(0, 0, 0)
  });

  clonarModelo(moldeDoCanoRetoCurto, {
    scene: scene,
    position: new THREE.Vector3(x + 14.05, .7, z), 
    scale: new THREE.Vector3(0.3, .45, .3),
    rotation: new THREE.Euler(0, 0, Math.PI / 2)
  });

  clonarModelo(moldeDaBaseValvula, {
    scene: scene,
    position: new THREE.Vector3(x + 12.3, .92, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, 0)
  });
  clonarModelo(moldeDoCanoRetoCurto, {
    scene: scene,
    position: new THREE.Vector3(x + 23, .65, z), 
    scale: new THREE.Vector3(0.3, .45, .3),
    rotation: new THREE.Euler(0, 0, Math.PI / 2)
  });
  clonarModelo(moldeDaBaseValvula, {
    scene: scene,
    position: new THREE.Vector3(x + 2*12.3, .97, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, 0)
  });

  clonarModelo(moldeDoCanoCruvo, {
    scene: scene,
    position: new THREE.Vector3(x + 21.42, .88, z), 
    scale: new THREE.Vector3(0.3, .3, .3),
    rotation: new THREE.Euler(0, 0, Math.PI / 2)
  });
}
 function fecharFase(scene, world){
  criarParedeDeColisao({
              world: world,
              scene: scene, // Precisa da cena para o visualizador
              isVisible: false, // A MÁGICA ACONTECE AQUI
              size: { width: 0.5, height: 4, depth: 60 },
              position: { x: -18, y: 2, z: 8 },
              rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
          });
  criarParedeDeColisao({
              world: world,
              scene: scene, // Precisa da cena para o visualizador
              isVisible: false, // A MÁGICA ACONTECE AQUI
              size: { width: 0.5, height: 4, depth: 60 },
              position: { x: -18, y: 2, z: 68 },
              rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
          });
  criarParedeDeColisao({
              world: world,
              scene: scene, // Precisa da cena para o visualizador
              isVisible: false, // A MÁGICA ACONTECE AQUI
              size: { width: 60, height: 4, depth: 0.5 },
              position: { x: -48, y: 2, z: 38 },
              rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
          });
 }
export function criarColisao(scene, world,d){
        // 1
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: -12, y: 2, z: d },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 11 },
            position: { x: 0, y: 2, z: d },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        if(d==40){
          criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 60, height: 4, depth: 0.5 },
            position: { x: 3, y: 2, z: d-2 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        }
        
        
}
