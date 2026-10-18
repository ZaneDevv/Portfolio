import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { Scenario } from './Scenario.ts';

// ----------------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------------

interface OrbitsData {
    radius: number,

    phi: number,
    theta: number, 
    thetaOffset: number,
    alpha: number,
    speed: number,

    orbitMesh: THREE.Mesh<THREE.RingGeometry, THREE.Material, THREE.Object3DEventMap>,
    bodyMesh: THREE.Group<THREE.Object3DEventMap> | undefined
};

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class SolarSystem extends Scenario
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private orbitsData?: Promise<OrbitsData | undefined>[];

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    public constructor(objLoader: OBJLoader)
    {
        super(objLoader);
        
        this.setUpRenderer();
        this.setUpCamera();
        this.setUpLights();
        
        this.setUpOrbitsData();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Renders the model for the given orbit
     * @param index Orbit's index
     * @param objLoader OBJLoader instance
     * @returns A mesh of the object that corresponds to the orbit's index or undefined if that objest is not defined
     * @author Álvaro Fernández Barrero
     */
    private async renderModel(index: number)
    {
        if (!this.objLoader)
            return;

        let model = undefined;

        switch (index)
        {
        case 0:
            model = await this.objLoader.loadAsync("/models/pi.obj");
            model.scale.multiplyScalar(5);
            model.rotateX(Math.PI / 2);

            break;

        case 1:
            model = await this.objLoader.loadAsync("/models/programming.obj");
            model.scale.multiplyScalar(3);
            model.rotateX(Math.PI / 2);

            break;

        default:
            console.warn(`No model found for #${index} orbit`);
        }

        return model;
    }

    /**
     * Gets the orbits full information
     * @param radius Orbit's radius
     * @param index Orbit's index
     * @param length Amount of orbits
     * @param orbitPathMaterial Material to set to the orbits paths
     * @returns All the information about the orbit
     * @author Álvaro Fernández Barrero
     */
    private async getObitsData(radius: number, index: number, length: number, orbitPathMaterial: THREE.MeshBasicMaterial) : Promise<OrbitsData | undefined>
    {
        if (!this.scene)
            return undefined;

        let geometry = new THREE.RingGeometry(radius, radius - 0.1, radius * 100, 1, 0, 2 * Math.PI);
        let mesh = new THREE.Mesh(geometry, orbitPathMaterial);
        let bodyMesh = await this.renderModel(index);

        this.scene.add(mesh);
        if (bodyMesh !== undefined)
            this.scene.add(bodyMesh);

        return {
            radius: radius,

            phi: 0,
            theta: 2 * index * Math.PI / length,
            thetaOffset: 2 * index * Math.PI / length,
            alpha: 0,
            speed: (0.1 + Math.random() * 0.1) * radius / 5,

            orbitMesh: mesh,
            bodyMesh: bodyMesh
        };
    }

    /**
     * Sets up all the orbits
     * @author Álvaro Fernández Barrero
     */
    private setUpOrbitsData() : void
    {
        const orbitPathMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            color: 0xA0A0A0,
            wireframe: true,
        });

        let orbits: Array<number> = [10, 20, 30];
        this.orbitsData = orbits.map((radius: number, index: number) => this.getObitsData(radius, index, orbits.length, orbitPathMaterial));
    }

    /**
     * Sets up the scenario's camera
     * @author Álvaro Fernández Barrero
     */
    protected setUpCamera(): void
    {
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1e3);
        this.camera.position.setZ(20);
        this.camera.position.setY(-40);
        this.camera.rotateX(50 * Math.PI / 180);
    }

    /**
     * Sets up the scenario's renderer
     * @author Álvaro Fernández Barrero
     */
    protected setUpRenderer() : void
    {
        const canvas = document.getElementById("background");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas #background not found");

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Sets yo the scenario's lighting
     * @author Álvaro Fernández Barrero
     */
    private setUpLights() : void
    {
        if (!(this.scene && this.camera))
        {
            console.warn("You've attempted to create the lighting befeore the scenario");
            return;
        }

        const upLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1 );
        this.scene.add(upLight);

        const pointLightSun = new THREE.PointLight(0xFFFFFF, 1e3);
        this.scene.add(pointLightSun);

        const cameraLight = new THREE.DirectionalLight(0xFFFFFF, 1e3)
        cameraLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.y);
        this.scene.add(cameraLight);
    }

    /**
     * Update method. This will run every frame
     * @param t Time passed since the simulation began
     * @param deltaTime Delta time
     * @author Álvaro Fernández Barrero
     */
    protected update(_: number, deltaTime: number)
    {
        this.orbitsData?.forEach(promise => {
            promise.then(data => {
                if (data === undefined)
                    return;

                let body = data.bodyMesh;
            
                if (body === undefined)
                    return;
        
                data.phi += deltaTime * 10 * Math.PI / 180;
                data.theta = data.thetaOffset + 10 * Math.sin(data.phi) * Math.PI / 180;
                data.alpha += deltaTime;
                data.alpha %= 2 * Math.PI;

                body.position.set(data.radius * Math.cos(data.theta), data.radius * Math.sin(data.theta), Math.sin(data.alpha) * 0.1);
            })
        });
    }
}