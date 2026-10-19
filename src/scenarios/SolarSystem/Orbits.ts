import { TAU, HALF_PI, DEG2RAD } from '../../math/constants.ts';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

import type { OrbitData } from './OrbitData.ts';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class Orbits
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private objLoader?: OBJLoader;
    private scene?: THREE.Scene;

    private orbitsData?: Promise<OrbitData | undefined>[];

    private static orbitColors: Array<number> = [
        0xA78BFA,
        0x22D3EE,
        0xF5C77E
    ];

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(scene: THREE.Scene, objLoader: OBJLoader)
    {
        this.scene = scene;
        this.objLoader = objLoader;

        this.setUpOrbitsData();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Applies the correspondging color to the given model
     * @param model Model to apply the color
     * @param color Hexadecimal color
     * @author Álvaro Fernández Barrero
     */
    private applyColorToModel(model: THREE.Group<THREE.Object3DEventMap>, color: number)
    {
        const properties = {
            color: color,
            metalness: 0.3,
            roughness: 0.4
        };

        model.traverse((child) => {
            if (child instanceof THREE.Mesh)
                child.material = new THREE.MeshStandardMaterial(properties);
        });
    }

    /**
     * Renders the model for the given orbit
     * @param index Orbit's index
     * @param objLoader OBJLoader instance
     * @returns A mesh of the object that corresponds to the orbit's index or undefined if that objest is not defined
     * @author Álvaro Fernández Barrero
     */
    private async renderModel(index: number) : Promise<THREE.Group<THREE.Object3DEventMap> | undefined>
    {
        if (!this.objLoader)
            return;

        let model = undefined;

        switch (index)
        {
        case 0:
            model = await this.objLoader.loadAsync("/scenarios/solar_system/models/pi.obj");
            model.scale.multiplyScalar(5);
            model.rotateX(HALF_PI);

            break;

        case 1:
            model = await this.objLoader.loadAsync("/scenarios/solar_system/models/programming.obj");
            model.scale.multiplyScalar(3);
            model.rotateX(HALF_PI);

            break;

        default:
            console.warn(`No model found for #${index} orbit`);
        }

        if (model)
            this.applyColorToModel(model, Orbits.orbitColors[index]);

        return model;
    }

    /**
     * Gets material for the orbit path in the given hexadecimal color
     * @param colorNumber Hexadecimal color to set to the orbit path
     * @returns Material for the orbit path
     * @author Álvaro Fernández Barrero
     */
    private getOrbitPathMaterial(colorNumber: number) : THREE.MeshBasicMaterial
    {
        const color = new THREE.Color(colorNumber);
        const glowingColor = color.clone().multiplyScalar(3);

        return new THREE.MeshBasicMaterial({
            color: glowingColor,
            toneMapped: false
        });
    }

    /**
     * Gets an object containing all the orbit's information
     * @param radius Orbit's radius
     * @param index Orbit's index
     * @param length Amount of orbits
     * @param mesh Orbit's mesh
     * @param bodyToOrbit Body to orbit
     * @returns Object with all the information of the orbit
     * @author Álvaro Fernández Barrero
     */
    private getOrbitObject(radius: number, index: number, length: number, mesh: THREE.Mesh<THREE.RingGeometry, THREE.Material, THREE.Object3DEventMap>, bodyToOrbit:  THREE.Group<THREE.Object3DEventMap> | undefined) : OrbitData
    {
        return {
            radius: radius,

            phi: 0,
            theta: index * TAU / length,
            thetaOffset: index * TAU / length,
            alpha: 0,
            speed: (0.1 + Math.random() * 0.1) * radius / 5,

            orbitAngle: 175 / radius,

            orbitMesh: mesh,
            bodyToOrbit: bodyToOrbit
        };
    }

    /**
     * Gets the orbits full information
     * @param radius Orbit's radius
     * @param index Orbit's index
     * @param length Amount of orbits
     * @returns All the information about the orbit
     * @author Álvaro Fernández Barrero
     */
    private async createOrbitData(radius: number, index: number, length: number) : Promise<OrbitData | undefined>
    {
        if (!this.scene)
            return undefined;

        let geometry = new THREE.RingGeometry(radius, radius + 0.1, radius * 5, 1, 0, TAU);
        let mesh = new THREE.Mesh(geometry, this.getOrbitPathMaterial(Orbits.orbitColors[index]));

        let bodyToOrbit = await this.renderModel(index);

        this.scene.add(mesh);
        if (bodyToOrbit !== undefined)
            this.scene.add(bodyToOrbit);

        return this.getOrbitObject(radius, index, length, mesh, bodyToOrbit);
    }

    /**
     * Sets up all the orbits
     * @author Álvaro Fernández Barrero
     */
    private setUpOrbitsData() : void
    {
        let orbits: Array<number> = [10, 20, 30];
        this.orbitsData = orbits.map((radius: number, index: number) => this.createOrbitData(radius, index, orbits.length));
    }

    /**
     * Updates the orbit
     * @param deltaTime Time passed since last frame
     * @author Álvaro Fernández Barrero
     */
    public update(deltaTime: number)
    {
        this.orbitsData?.forEach(promise => promise.then(data => {
            if (data === undefined)
                return;

            let body = data.bodyToOrbit;
        
            if (body === undefined)
                return;
    
            data.phi += deltaTime * 10 * DEG2RAD;
            data.theta = data.thetaOffset + data.orbitAngle * Math.cos(data.phi) * DEG2RAD;
            data.alpha += deltaTime;
            data.alpha %= TAU;

            let cosineTheta = Math.cos(data.theta);

            body.rotation.set(Math.PI / 2, -cosineTheta, 0);
            body.position.set(data.radius * cosineTheta, data.radius * Math.sin(data.theta), Math.sin(data.theta * Math.E * 3) * 0.3);
        }));
    }
}