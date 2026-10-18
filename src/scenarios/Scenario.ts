import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export abstract class Scenario
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    protected objLoader?: OBJLoader;
    
    protected scene?: THREE.Scene;
    protected camera?: THREE.Camera;
    protected renderer?: THREE.WebGLRenderer;

    protected lastT: number = 0;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    public constructor(objLoader: OBJLoader)
    {
        this.objLoader = objLoader;
        this.scene = new THREE.Scene();

        this.setUpRenderer();
        this.setUpCamera();

        this.animate();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Computes the delta time
     * @param lastT Previous time in milliseconds
     * @param t Current time in milliseconds
     * @returns Delta time in seconds
     * @author Álvaro Fernández Barrero
     */
    static computeDeltaTime = (lastT: number, t: number) => (t - lastT) / 1e3;

    /**
     * Animates the simulation
     * @param t Time passed since the simulation began
     * @author Álvaro Fernánde Barrero
     */
    protected animate(t: number = 0)
    {
        requestAnimationFrame((t) => this.animate(t));
        if (!(this.renderer && this.camera && this.scene))
            return;

        const deltaTime = Scenario.computeDeltaTime(this.lastT, t);
        this.lastT = t;

        this.update(t, deltaTime);

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Sets up the scenario's renderer
     * @author Álvaro Fernández Barrero
     */
    protected abstract setUpRenderer(): void;

    /**
     * Sets up the scenario's camera
     * @author Álvaro Fernández Barrero
     */
    protected abstract setUpCamera(): void;

    /**
     * Update method. This will run every frame
     * @param t Time passed since the simulation began
     * @param deltaTime Delta time
     * @author Álvaro Fernández Barrero
     */
    protected abstract update(_: number, deltaTime: number) : void;
}