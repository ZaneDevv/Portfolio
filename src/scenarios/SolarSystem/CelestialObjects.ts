import * as THREE from 'three';

import { random } from '../../math/randomness';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class CelestialObject
{
    // ----------------------------------------------------------------------------------
    // STATICS
    // ----------------------------------------------------------------------------------

    private static MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE: number = 0.5;
    private static MAXIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE: number = 5;

    private static MINIMUM_LIFETIME: number = 6;
    private static MAXIMUM_LIFETIME: number = 30;

    private static MINIMUM_SCALE: number = 0.2;
    private static MAXIMUM_SCALE: number = 0.6;

    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private scene?: THREE.Scene = undefined;

    private body?: THREE.Group = undefined;

    private deltaTime: number = 0;
    private time: number = 0;
    private nextBodyTime: number = 0;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(scene: THREE.Scene)
    {
        this.scene = scene;

        this.nextBodyTime = random(CelestialObject.MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE, CelestialObject.MAXIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE);
        this.setUpBody();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Sets up the meyeorite
     * @author Álvaro Fernández Barrero
     */
    private setUpBody()
    {
        if (!this.scene)
            return;

        const geometry = new THREE.OctahedronGeometry(10, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x571000
        });

        const edges = new THREE.OctahedronGeometry(10, 1);
        const materialEdges = new THREE.MeshBasicMaterial({
            color: 0xB08530,
            wireframe: true,
            wireframeLinewidth: 3,
        })

        this.body = new THREE.Group()
        this.body.add(new THREE.Mesh(geometry, material));
        this.body.add(new THREE.Mesh(edges, materialEdges));

        this.scene.add(this.body);
        this.body.position.set(0, -170, 0);
    }

    /**
     * Launches a celestial object
     * @author Álvaro Fernández Barrero
     */
    private async launch()
    {
        if (!(this.body && this.scene))
            return;

        const meteorite = this.body.clone();
        this.scene.add(meteorite);

        const rotationAxis = new THREE.Vector3().randomDirection();

        const scale = new THREE.Vector3(
            random(CelestialObject.MINIMUM_SCALE, CelestialObject.MAXIMUM_SCALE),
            random(CelestialObject.MINIMUM_SCALE, CelestialObject.MAXIMUM_SCALE),
            random(CelestialObject.MINIMUM_SCALE, CelestialObject.MAXIMUM_SCALE)
        );

        const direction = new THREE.Vector3().randomDirection();
        const startingPosition = new THREE.Vector3(Math.random() * 80 - 40, 60, Math.random() * 80 - 40);

        const lifetime = random(CelestialObject.MINIMUM_LIFETIME, CelestialObject.MAXIMUM_LIFETIME);

        let t = 0;

        meteorite.position.set(startingPosition.x, startingPosition.y, startingPosition.z);
        meteorite.scale.set(scale.x, scale.y, scale.z);

        while (t < lifetime)
        {
            let alpha = t / lifetime;

            let rotationQuaternion = new THREE.Quaternion();
            rotationQuaternion.setFromAxisAngle(rotationAxis, this.deltaTime);

            let displacement = direction.clone();
            displacement.multiplyScalar(this.deltaTime * 10 / (t + 1));

            let newPosition = meteorite.position.clone();
            newPosition.add(displacement);

            let newScale = scale.clone();
            newScale.multiplyScalar(1 - alpha);
            
            meteorite.position.set(newPosition.x, newPosition.y, newPosition.z);
            meteorite.scale.set(newScale.x, newScale.y, newScale.z)
            meteorite.setRotationFromQuaternion(meteorite.quaternion.multiply(rotationQuaternion));

            await new Promise(resolve => setTimeout(resolve, this.deltaTime)).then(() => t += this.deltaTime);
        }

        meteorite.parent?.remove(meteorite);
    }

    /**
     * 
     * @param deltaTime Time passed since last frame
     * @author Álvaro Fernández Barrero
     */
    public update(deltaTime: number)
    {
        this.deltaTime = deltaTime;
        this.time += deltaTime;

        if (this.time >= this.nextBodyTime)
        {
            this.launch();

            this.time = 0;
            this.nextBodyTime = random(CelestialObject.MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE, CelestialObject.MAXIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE);
        }
    }
}