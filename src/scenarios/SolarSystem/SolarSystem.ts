import * as THREE from 'three';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { Scenario } from '../Scenario.ts';
import { Orbits } from './Orbits.ts'
import { CentralBody } from './CentralBody.ts';
import { CelestialObject } from './CelestialObjects.ts';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class SolarSystem extends Scenario
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private centralBody?: CentralBody;
    private orbits?: Orbits;
    private celestialObject?: CelestialObject;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    public constructor(objLoader: OBJLoader, textureLoader: THREE.TextureLoader)
    {
        super(objLoader, textureLoader);

        this.setUpComposer();
        this.setUpLights();      
        this.setUpBackgroundMusic();  

        if (this.scene && this.camera && objLoader)
        {
            this.centralBody = new CentralBody(this.scene, objLoader);
            this.orbits = new Orbits(this.scene, this.camera, objLoader);  
            this.celestialObject = new CelestialObject(this.scene); 
        }
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

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
    protected setUpBackground() : void
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
     * Plays a background music
     * @author Álvaro Fernández Barrero
     */
    private setUpBackgroundMusic() : void
    {
        const audio = document.getElementById("solar-system-background-music") as HTMLAudioElement | null;
        if (!audio)
        {
            console.warn("Background music was not found");
            return;
        }

        audio.volume = 0.5;

        this.playBackgroundMusic(audio);
        document.addEventListener("keydown", () => this.playBackgroundMusic(audio));
        document.addEventListener("pointerdown", () => this.playBackgroundMusic(audio));
    }

    /**
     * Sets up the composer for gloom effects
     * @author Álvaro Fernández Barrero
     */
    private setUpComposer() : void
    {
        if (!(this.renderer && this.scene && this.camera))
        {
            console.warn("Renderer, scene and camera are required");
            return;
        }

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.1, 0.1));
        this.composer.addPass(new OutputPass());
    }

    /**
     * Plays the background music
     * @param audio Background music's audio's HTML elemenet
     * @author Álvaro Fernández Barrero
     */
    private async playBackgroundMusic(audio: HTMLAudioElement) : Promise<void>
    {
        try
        {
            await audio.play();

            document.removeEventListener("pointerdown", () => this.playBackgroundMusic(audio));
            document.removeEventListener("keydown", () => this.playBackgroundMusic(audio));
        }
        catch (error)
        {
            console.warn("Background music requires user interaction:", error);
        }
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
        this.centralBody?.update(deltaTime);
        this.orbits?.update(deltaTime);
        this.celestialObject?.update(deltaTime);
    }
}