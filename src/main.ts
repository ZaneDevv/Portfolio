import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

createApp(App).mount('#app');

interface OrbitsData {
    radius: number,

    theta: number,
    speed: number,

    orbitMesh: THREE.Mesh,
    bodyMesh: Promise<THREE.Group<THREE.Object3DEventMap> | undefined>
};

const objLoader: OBJLoader = new OBJLoader();

const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1e3);
camera.position.setZ(20);
camera.position.setY(-40);
camera.rotateX(50 * Math.PI / 180);

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("background")
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const orbitPathMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
    color: 0xA0A0A0,
    wireframe: true,
});

async function renderModel(index: number)
{
    let model = undefined;

    switch (index)
    {
    case 0:
        model = await objLoader.loadAsync("/models/pi.obj");
        model.scale.multiplyScalar(5);
        model.rotateX(Math.PI / 2);

        break;

    case 1:
        model = await objLoader.loadAsync("/models/programming.obj");
        model.scale.multiplyScalar(3);
        model.rotateX(Math.PI / 2);

        break;

    default:
        console.warn(`No model found for #${index} orbit`);
    }

    return model;
}

async function getObitsData(radius: number, index: number)
{
    let geometry = new THREE.RingGeometry(radius, radius - 0.1, radius * 100, 1, 0, 2 * Math.PI);
    let mesh = new THREE.Mesh(geometry, orbitPathMaterial);
    let bodyMesh = await renderModel(index);

    scene.add(mesh);
    if (bodyMesh !== undefined)
        scene.add(bodyMesh);

    return {
        radius: radius,

        theta: 2 * index * Math.PI / orbits.length, 
        speed: (0.1 + Math.random() * 0.1) * radius / 5,

        orbitMesh: mesh,
        bodyMesh: bodyMesh
    };
}

let orbits: Array<number> = [10, 25, 35];
let orbitsData = orbits.map(getObitsData);

const upLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add(upLight);

const pointLightSun = new THREE.PointLight(0xFFFFFF, 1e3);
scene.add(pointLightSun);

const cameraLight = new THREE.DirectionalLight(0xFFFFFF, 1e3)
cameraLight.position.set(camera.position.x, camera.position.y, camera.position.y);
scene.add(cameraLight);

function animate() : void
{
    requestAnimationFrame(animate);

    orbitsData.forEach(promise => {
        promise.then(data => {
            let body = data.bodyMesh;
        
            if (body === undefined)
                return;
    
            body.position.set(data.radius * Math.cos(data.theta), data.radius * Math.sin(data.theta), 0);
            
            data.theta += data.speed * Math.PI / 180;
            data.theta %= (2 * Math.PI);
        })
    });

    renderer.render(scene, camera);
}
animate();