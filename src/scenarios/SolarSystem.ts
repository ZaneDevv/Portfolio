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

    orbitAngle: number,

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

    private static orbitColors: Array<number> = [
        0xA78BFA,
        0x22D3EE,
        0xF5C77E
    ];

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    public constructor(objLoader: OBJLoader, textureLoader: THREE.TextureLoader)
    {
        super(objLoader, textureLoader);

        this.setUpLights();        
        this.setUpOrbitsData();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Applies the correspondging color to the given model
     * @param model Model to apply the color
     * @param index Model's index
     * @author Álvaro Fernández Barrero
     */
    private applyColorToModel(model: THREE.Group<THREE.Object3DEventMap>, index: number)
    {
        model.traverse((child) => {
                if (child instanceof THREE.Mesh)
                {
                    child.material = new THREE.MeshStandardMaterial({
                        color: SolarSystem.orbitColors[index],
                        metalness: 0.3,
                        roughness: 0.4
                    });
                }
            });
    }

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
            model = await this.objLoader.loadAsync("/scenarios/solar_system/models/pi.obj");
            model.scale.multiplyScalar(5);
            model.rotateX(Math.PI / 2);

            break;

        case 1:
            model = await this.objLoader.loadAsync("/scenarios/solar_system/models/programming.obj");
            model.scale.multiplyScalar(3);
            model.rotateX(Math.PI / 2);

            break;

        default:
            console.warn(`No model found for #${index} orbit`);
        }

        if (model)
            this.applyColorToModel(model, index);

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

        let geometry = new THREE.RingGeometry(radius, radius - 0.01, radius * 5, 1, 0, 2 * Math.PI);
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

            orbitAngle: 175 / radius,

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
     * Sets up the scenario's background
     * @author Álvaro Fernández Barrero
     */
    protected setUpBackground()
    {
        if (!(this.scene && this.textureLoader))
        {
            console.warn("Attempted to set up a background before anything existed at all");
            return;
        }

        const texture = this.textureLoader.load("/scenarios/solar_system/images/space.png");
        texture.colorSpace = THREE.SRGBColorSpace;

        this.scene.background = texture;
        this.scene.backgroundIntensity = 1;
    }

    /**
     * Sets up atmospheric lighting for the space scenario.
     * @author Álvaro Fernández Barrero
     */
    private setUpLights(): void
    {
        if (!this.scene || !this.camera)
        {
            console.warn("Cannot set up lights before the scene and camera");
            return;
        }

        const ambientLight = new THREE.HemisphereLight(0x8B7AC8, 0x080616,1.5);
        
        const mainLight = new THREE.DirectionalLight(0xDDD6FF, 3.0);
        mainLight.position.set(-15, -10, 25);
        
        const rimLight = new THREE.DirectionalLight(0x7C3AED, 2.0);    
        rimLight.position.set(15, 10, -20);
        
        const fillLight = new THREE.PointLight(0x6366F1, 35, 80);
        fillLight.position.set(0, 0, 15);
        
        this.scene.add(ambientLight);
        this.scene.add(mainLight);
        this.scene.add(rimLight);
        this.scene.add(fillLight);
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
                data.theta = data.thetaOffset + data.orbitAngle * Math.cos(data.phi) * Math.PI / 180;
                data.alpha += deltaTime;
                data.alpha %= 2 * Math.PI;

                body.position.set(data.radius * Math.cos(data.theta), data.radius * Math.sin(data.theta), Math.sin(data.alpha) * 0.1);
            })
        });
    }
}