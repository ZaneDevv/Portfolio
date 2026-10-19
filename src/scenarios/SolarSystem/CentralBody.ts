import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/Addons.js';

import { TAU } from '../../math/constants.ts';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class CentralBody
{
    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private objLoader?: OBJLoader;
    private scene?: THREE.Scene;

    private centralBody: THREE.Group<THREE.Object3DEventMap> | undefined;

    private centralBodyQuaternionOffset: THREE.Quaternion = new THREE.Quaternion(0, 1, 1, 0).normalize();
    private centralBodyRotationAxis: THREE.Vector3 = new THREE.Vector3(1, 0, 2).normalize();
    private centralBodyTheta: number = 0;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(scene: THREE.Scene, objLoader: OBJLoader)
    {
        this.scene = scene;
        this.objLoader = objLoader;

        this.setUpCentralBody();
    }

    // ----------------------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------------------

    /**
     * Sets up a central body to the scenario
     * @author Álvaro Fernández Barrero
     */
    private async setUpCentralBody() : Promise<void>
    {
        if (this.centralBody)
            return;

        this.centralBody = await this.objLoader?.loadAsync("/scenarios/solar_system/models/duck.obj");

        if (!this.centralBody)
            return;

        this.centralBody.scale.multiplyScalar(0.5);

        //this.applyColorToModel(this.centralBody, 0xF2E333);
        this.scene?.add(this.centralBody);
    }

     /**
     * Updates the central body
     * @param deltaTime Time passed since last frame
     * @author Álvaro Fernández Barrero
     */
    public update(deltaTime: number)
    {
        if (!this.centralBody)
            return;

        this.centralBodyTheta += deltaTime * 0.2;
        this.centralBodyTheta %= TAU;

        let quaternion = new THREE.Quaternion().setFromAxisAngle(this.centralBodyRotationAxis, Math.sin(this.centralBodyTheta) * Math.PI / 5);
        quaternion.conjugate();
        
        quaternion.multiplyQuaternions(quaternion, this.centralBodyQuaternionOffset);

        this.centralBody.setRotationFromQuaternion(quaternion);
    }
}