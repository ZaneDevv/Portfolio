import { TAU } from '../../math/constants.ts';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

import { BodyInOrbit } from './BodyInOrbit.ts';
import { ORBIT_COLORS, ORBIT_RADIUS } from './OrbitsInformation.ts';

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

    private bodies: Array<BodyInOrbit> = [];

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(scene: THREE.Scene, camera: THREE.Camera, objLoader: OBJLoader)
    {
        this.scene = scene;
        this.camera = camera;
        this.objLoader = objLoader;

        this.raycaster = new THREE.Raycaster();

        for (let i: number = 0; i < ORBIT_RADIUS.length; i++)
            this.createOrbit(i);

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
     * Gets the orbits full information
     * @param index Orbit's index
     * @returns All the information about the orbit
     * @author Álvaro Fernández Barrero
     */
    private createOrbit(index: number) 
    {
        if (!(this.scene && this.objLoader && this.scene))
            return undefined;

        let radius: number = ORBIT_RADIUS[index];

        let geometry = new THREE.RingGeometry(radius, radius + 0.1, radius * 5, 1, 0, TAU);
        let mesh = new THREE.Mesh(geometry, this.getOrbitPathMaterial(ORBIT_COLORS[index]));

        this.scene.add(mesh);
        this.bodies.push(new BodyInOrbit(index, this.scene, this.objLoader));
    }

    /**
     * Updates the orbit
     * @param deltaTime Time passed since last frame
     * @author Álvaro Fernández Barrero
     */
    public update(deltaTime: number)
    {
        console.log(this.bodies)
        this.bodies.forEach(body => body.updateTransform(deltaTime));
    }
}