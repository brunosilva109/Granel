import * as THREE from 'three';
import { carregarModeloNoCache, clonarModelo } from './utils.js'
import { criarParedeDeColisao } from './world.js';
const moldeDoTank= await carregarModeloNoCache({ caminho: 'assets/Tank.glb' });
const moldeDoCanoReto= await carregarModeloNoCache({ caminho: 'assets/CanoReto.glb' });//X = 3.25 OU SEJA 1.62 DO MEIO
const moldeDoCanoRetoCurto= await carregarModeloNoCache({ caminho: 'assets/CanoRetoCurto.glb' });// 1.5 OU SEJA 0.75 DO MEIO
const moldeDoCanoCruvo= await carregarModeloNoCache({ caminho: 'assets/CanoCurvo.glb' });// .9 OU SEJA 0.45 DO MEIO
const moldeDaBaseValvula = await carregarModeloNoCache({ caminho: 'assets/BaseValvula.glb' });

export function criarCano(scene, world){
        CanosPadroes(scene,1,0);
        CanosPadroes(scene,1,8);
        CanosPadroes(scene,1,-8);
        CanosPadroes(scene,-1,0);
        CanosPadroes(scene,-1,8);
        CanosPadroes(scene,-1,-8);

        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(-22.45, .92, 0),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-24.15, .63,0),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, -Math.PI/2)
        });
        ///
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(22.45, .92, 0),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(24.05, .63,0),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, -Math.PI/2)
        });
        ///
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(22.3, .63, 8.25),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0, Math.PI)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, 9.8),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(22.55, .92, 11.44),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, Math.PI/2,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, 13.19),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, 15.9),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0,0, 0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(22.8, .63, 17.99),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(24.4, .63, 18.25),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, Math.PI/2)
        });
        ///
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-22.3, .63, 8.25),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(-Math.PI/2,0,0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-22.8, .63, 17.99),         
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0, -Math.PI/2)
            
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, 9.8),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .92, 11.44),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, Math.PI/2,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, 13.19),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, 15.9),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0,0, 0)
        });    
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-24.4, .63, 18.25),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, Math.PI/2)
        });
        ///
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(22.3, .63, -8.25),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(22.8, .63, -17.99),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(-Math.PI/2,0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, -9.8),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(22.55, .92, -11.54),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, Math.PI/2,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, -13.19),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(22.55, .63, -15.9),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0,0, 0)
        });
        
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(24.4, .63, -18.25),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, Math.PI/2)
        });
        ///
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-22.3, .63, -8.25),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0,0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-22.8, .63, -17.99),         
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI/2,0, Math.PI)
            
            
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, -9.8),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .92, -11.54),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, Math.PI/2,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, -13.19),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,Math.PI/2, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(-22.55, .63, -15.9),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0,0, 0)
        });    
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-24.4, .63, -18.25),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0,0, Math.PI/2)
        });
}
function CanosPadroes(scene,x,z){
    if(x==1){
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(18.3,4, z), 
            scale: new THREE.Vector3(0.3, .3, .4),
            rotation: new THREE.Euler(0, Math.PI/2, 0)
        });
        
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(20.9, 3.75, z),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0, -Math.PI/2)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(15.7, 3.75, z),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0, 0)
        });
         
        
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(15.45, 2.53, z),
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        }); 
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(21.15, 2.3, z),
            scale: new THREE.Vector3(0.3, .4, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(14.05, .7, z),           
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0, 0, Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(12.3, .97, z),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(21.42, .88, z),           
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0, Math.PI/2)
        });  
    }
    if(x==-1){
        clonarModelo(moldeDoCanoReto, {
            scene: scene,
            position: new THREE.Vector3(-18.3,4, z), // x = + ou - 2.11
            scale: new THREE.Vector3(0.3, .3, .4),
            rotation: new THREE.Euler(0, Math.PI/2, 0)
        });
        
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-20.9, 3.75, z),           //x = + ou - 0.25 para centralizar o cano a baixo Y = + ou - 0.25 centralizar cano encima
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0, 0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-15.7, 3.75, z),           //x = + ou - 0.25 para centralizar o cano a baixo Y = + ou - 0.25 centralizar cano encima
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,-Math.PI/2)
        });
         
        
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-15.45, 2.53, z),
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        }); 
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-21.15, 2.3, z),
            scale: new THREE.Vector3(0.3, .4, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoRetoCurto, {
            scene: scene,
            position: new THREE.Vector3(-14.05, .7, z),           //x = + ou - 0.25 para centralizar o cano a baixo Y = + ou - 0.25 centralizar cano encima
            scale: new THREE.Vector3(0.3, .45, .3),
            rotation: new THREE.Euler(0, 0, Math.PI/2)
        });
        clonarModelo(moldeDaBaseValvula, {
            scene: scene,
            position: new THREE.Vector3(-12.4, .97, z),           //x = + ou - 0.25 para centralizar o cano a baixo Y = + ou - 0.25 centralizar cano encima
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(0, 0,0)
        });
        clonarModelo(moldeDoCanoCruvo, {
            scene: scene,
            position: new THREE.Vector3(-21.42, .88,z),           //x = + ou - 0.25 para centralizar o cano a baixo Y = + ou - 0.25 centralizar cano encima
            scale: new THREE.Vector3(0.3, .3, .3),
            rotation: new THREE.Euler(Math.PI, 0,-Math.PI/2)
        });  
    }

}
export function criarColisao(scene, world){
        // 1
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: 15.5, y: 2, z: 8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 1 },
            position: { x: 22, y: 2, z: 8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 3, height: 4, depth: 11 },
            position: { x: 24, y: 2, z: 13},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        //2
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: 15.5, y: 2, z: 0 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 4 },
            position: { x: 23.5, y: 2, z: 0 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        //3
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: 15.5, y: 2, z: -8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 1 },
            position: { x: 22, y: 2, z: -8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 3, height: 4, depth: 11 },
            position: { x: 24, y: 2, z: -13},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        // 4
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: -15.5, y: 2, z: 8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 1 },
            position: { x: -22, y: 2, z: 8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 3, height: 4, depth: 11 },
            position: { x: -24, y: 2, z: 13},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });
        //5
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: -15.5, y: 2, z: 0 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 4 },
            position: { x: -23.5, y: 2, z: 0 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        //6
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 7 },
            position: { x: -15.5, y: 2, z: -8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 0.5, height: 4, depth: 1 },
            position: { x: -22, y: 2, z: -8 },
            rotation: { x: 0, y: Math.PI /2, z: 0 } // Rotacionada em 45 graus
        });
        criarParedeDeColisao({
            world: world,
            scene: scene, // Precisa da cena para o visualizador
            isVisible: false, // A MÁGICA ACONTECE AQUI
            size: { width: 3, height: 4, depth: 11 },
            position: { x: -24, y: 2, z: -13},
            rotation: { x: 0, y: 0, z: 0 } // Rotacionada em 45 graus
        });

}