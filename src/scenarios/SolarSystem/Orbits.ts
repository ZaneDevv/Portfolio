import { TAU, DEG2RAD } from '../../math/constants.ts';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

import { BodyInOrbit } from './BodyInOrbit.ts';
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
    private camera?: THREE.Camera;

    private raycaster?: THREE.Raycaster;

    private orbitsData?: Promise<OrbitData | undefined>[];

    private static orbitColors: Array<number> = [
        0xA78BFA,
        0x22D3EE,
        0xF5C77E
    ];

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(scene: THREE.Scene, camera: THREE.Camera, objLoader: OBJLoader)
    {
        this.scene = scene;
        this.camera = camera;
        this.objLoader = objLoader;

        this.raycaster = new THREE.Raycaster();

        this.setUpOrbitsData();

        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    private onMouseMove(event: {clientX: number, clientY: number}) : void
    {
        if (!(this.raycaster && this.camera && this.scene))
            return;

        this.raycaster.setFromCamera(
            new THREE.Vector2((event.clientX - window.innerWidth) / 2 - 1, (event.clientY - window.innerHeight) / 2 - 1),
            this.camera
        );

        const intersection = this.raycaster.intersectObjects(this.scene.children)[0];
        if (!intersection)
            return;
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
    private getOrbitObject(radius: number, index: number, length: number, mesh: THREE.Mesh<THREE.RingGeometry, THREE.Material, THREE.Object3DEventMap>, bodyToOrbit:  BodyInOrbit) : OrbitData
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
        if (!(this.scene && this.objLoader && this.scene))
            return undefined;

        let bodyToOrbit = await new BodyInOrbit(index, this.scene, this.objLoader);

        let geometry = new THREE.RingGeometry(radius, radius + 0.1, radius * 5, 1, 0, TAU);
        let mesh = new THREE.Mesh(geometry, this.getOrbitPathMaterial(Orbits.orbitColors[index]));

        this.scene.add(mesh);

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

            body.setTransform(data.radius, data.theta);
        }));
    }
}