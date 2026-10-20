import * as THREE from 'three';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export abstract class Scenario
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    protected composer?: EffectComposer;

    protected objLoader?: OBJLoader;
    protected textureLoader?: THREE.TextureLoader;
    
    protected scene?: THREE.Scene;
    protected camera?: THREE.PerspectiveCamera;
    protected renderer?: THREE.WebGLRenderer;

    protected lastT: number = 0;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    public constructor(objLoader: OBJLoader, textureLoader: THREE.TextureLoader)
    {
        this.objLoader = objLoader;
        this.textureLoader = textureLoader;

        this.scene = new THREE.Scene();

        this.setUpRenderer();
        this.setUpCamera();
        this.setUpBackground();

        document.addEventListener("mousemove", () => { this.updateDimensions(); });

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
     * @author Álvaro Fernández Barrero
     */
    protected animate(t: number = 0) : void
    {
        requestAnimationFrame((t) => this.animate(t));
        if (!(this.renderer && this.camera && this.scene))
            return;

        const deltaTime = Scenario.computeDeltaTime(this.lastT, t);
        this.lastT = t;

        this.update(t, deltaTime);

        if (this.composer)
            this.composer.render(deltaTime)
        else
            this.renderer.render(this.scene, this.camera);
    }

    /**
     * Updates the environment's dimensions according to the resize of the content
     * @author Álvaro Fernández Barrero
     */
    protected updateDimensions()
    {
        if (this.camera)
            this.camera.aspect = window.innerWidth / window.innerHeight;

        this.renderer?.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Sets up the scenario's renderer
     * @author Álvaro Fernández Barrero
     */
    protected abstract setUpRenderer() : void;

    /**
     * Sets up the scenario's camera
     * @author Álvaro Fernández Barrero
     */
    protected abstract setUpCamera() : void;

    /**
     * Sets up the scenario's background
     * @author Álvaro Fernández Barrero
     */
    protected abstract setUpBackground() : void

    /**
     * Update method. This will run every frame
     * @param t Time passed since the simulation began
     * @param deltaTime Delta time
     * @author Álvaro Fernández Barrero
     */
    protected abstract update(_: number, deltaTime: number) : void;
}