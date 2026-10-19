import * as THREE from 'three';
import type { OBJLoader } from 'three/examples/jsm/Addons.js';

import { HALF_PI } from '../../math/constants.ts';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class BodyInOrbit
{
    // ----------------------------------------------------------------------------------
    // STATICS
    // ----------------------------------------------------------------------------------

    private static orbitColors: Array<number> = [
        0xA78BFA,
        0x22D3EE,
        0xF5C77E
    ];

    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private index?: number = undefined;

    private objLoader?: OBJLoader = undefined;
    private scene?: THREE.Scene = undefined;

    private model?: THREE.Group<THREE.Object3DEventMap> = undefined;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(index: number, scene: THREE.Scene, objLoader: OBJLoader)
    {
        this.index = index;

        this.scene = scene;
        this.objLoader = objLoader;
        
        this.renderModel();
        if (this.model)
            this.scene.add(this.model);
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
     * @author Álvaro Fernández Barrero
     */
    private async renderModel() : Promise<void>
    {
        if (!(this.objLoader && this.scene))
            return;

        let path: string;
        let scale: number;

        switch (this.index)
        {
        case 0:
            path = "/scenarios/solar_system/models/pi.obj";
            scale = 5;
            break;

        case 1:
            path = "/scenarios/solar_system/models/programming.obj";
            scale = 3;
            break;

        default:
            console.warn(`No model found for #${this.index} orbit`);
            return;
        }

        const body = await this.objLoader.loadAsync(path);

        body.scale.multiplyScalar(scale);
        body.rotateX(HALF_PI);

        this.applyColorToModel(body, BodyInOrbit.orbitColors[this.index]);

        this.model = body;
        this.scene.add(body);
    }

    /**
     * Sets the transform of the model according to the given polar coordinates
     * @param radius Radius
     * @param angle Angle
     * @author Álvaro Fernández Barrero 
     */
    public setTransform(radius: number, angle: number) : void
    {
        if (!this.model)
            return;

        let cosine = Math.cos(angle);

        this.model.rotation.set(Math.PI / 2, -cosine, 0);
        this.model.position.set(radius * cosine, radius * Math.sin(angle), Math.sin(angle * Math.E * 3) * 0.3);
    }
}