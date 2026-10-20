import * as THREE from 'three';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class CelestialObject
{
    // ----------------------------------------------------------------------------------
    // STATICS
    // ----------------------------------------------------------------------------------

    private static MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE: number = 5;
    private static MAXIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE: number = 20;
    private static DIFFERENCE_OF_TIME_LIMITS_FOR_NEXT_METEORITE: number = Math.abs(CelestialObject.MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE - CelestialObject.MAXIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE);

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
            color: 0xFFC44A,
            wireframe: true,
            wireframeLinewidth: 3,
        })

        this.body = new THREE.Group()
        this.body.add(new THREE.Mesh(geometry, material));
        this.body.add(new THREE.Mesh(edges, materialEdges));

        this.scene.add(this.body);
        this.body.position.set(0, 0, 10);
    }

    /**
     * Launches a celestial object
     * @author Álvaro Fernández Barrero
     */
    private launch()
    {

        const startingPosition = new THREE.Vector3(Math.random() * 80 - 40, 40, Math.random() * 80 - 40);
        const direction = new THREE.Vector3(1, 0, 0);

        const lifetime = Math.random() * 5 + 2;

        let t = 0;

        this.body?.scale.set(Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5);

        while (t < lifetime)
        {
            let rotationQuaternion = new THREE.Quaternion();
            rotationQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.deltaTime * 100);

            console.log(rotationQuaternion);

            let position = startingPosition.add(direction.multiplyScalar(t * 1000));
            
            this.body?.position.set(position.x, position.y, position.z);
            this.body?.setRotationFromQuaternion(this.body?.quaternion.multiply(rotationQuaternion));

            t += this.deltaTime;
        }
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
            this.nextBodyTime = CelestialObject.MINIMUM_TIME_TO_WAIT_FOR_NEXT_METEORITE + Math.random() * CelestialObject.DIFFERENCE_OF_TIME_LIMITS_FOR_NEXT_METEORITE;
        }
    }
}