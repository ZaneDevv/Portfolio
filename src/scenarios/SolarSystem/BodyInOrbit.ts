import * as THREE from 'three';
import type { OBJLoader } from 'three/examples/jsm/Addons.js';

import { ORBIT_COLORS, ORBIT_RADIUS } from './OrbitsInformation.ts';

import { HALF_PI, TAU, DEG2RAD } from '../../math/constants.ts';
import { lerp } from '../../math/interpolation.ts';

// ----------------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------------

export class BodyInOrbit
{
    // ----------------------------------------------------------------------------------
    // STATICS
    // ----------------------------------------------------------------------------------

    private static HITBOX_SCALE = 7;

    // ----------------------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------------------

    private index?: number = undefined;

    private objLoader?: OBJLoader = undefined;
    private camera?: THREE.Camera = undefined;
    private scene?: THREE.Scene = undefined;

    private model?: THREE.Group<THREE.Object3DEventMap> = undefined;
    private hitboxModel?: THREE.Object3D = undefined;

    private isSelected: boolean = false;

    private deltaTime: number = 0;

    private orbitAngle: number = 0;
    private radius: number = 0;
    private phi: number = 0;
    private alpha: number = 0;
    private theta: number = 0;
    private thetaOffset: number = 0;
    private speed: number = 0;

    // ----------------------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------------------

    constructor(index: number, scene: THREE.Scene, camera: THREE.Camera, objLoader: OBJLoader)
    {
        let length = ORBIT_RADIUS.length;

        this.index = index;

        this.radius = ORBIT_RADIUS[index],
        this.phi = 0,
        this.theta = index * TAU / length,
        this.thetaOffset = index * TAU / length,
        this.alpha = 0,
        this.speed = 10,
        this.orbitAngle = 175 / this.radius,

        this.scene = scene;
        this.camera = camera;
        this.objLoader = objLoader;
        
        this.renderModel();
        if (this.model)
            this.scene.add(this.model);

        this.setUpHitbox();
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

        this.applyColorToModel(body, ORBIT_COLORS[this.index]);

        this.model = body;
        this.scene.add(body);
    }

    /**
     * Sets up the mesh's hitbox
     * @author Álvaro Fernández Barrero
     */
    private setUpHitbox()
    {
        const geometry = new THREE.BoxGeometry(BodyInOrbit.HITBOX_SCALE, BodyInOrbit.HITBOX_SCALE, BodyInOrbit.HITBOX_SCALE);
        const material = new THREE.MeshBasicMaterial({
            visible: false
        });

        this.hitboxModel = new THREE.Mesh(geometry, material);
        this.scene?.add(this.hitboxModel);
    }

    /**
     * Updates the transform of the model according to the given polar coordinates
     * @param {Number} deltaTime Time passed since last frame
     * @author Álvaro Fernández Barrero 
     */
    public updateTransform(deltaTime: number) : void
    {
        this.deltaTime = deltaTime;

        if (!this.model || this.isSelected)
            return;

        this.phi += deltaTime * this.speed * DEG2RAD;
        this.theta = this.thetaOffset + this.orbitAngle * Math.cos(this.phi) * DEG2RAD;
        this.alpha += deltaTime;
        this.alpha %= TAU;

        let cosineTheta = Math.cos(this.theta);

        this.model.rotation.set(HALF_PI, -cosineTheta, 0);  
        this.model.position.set(this.radius * cosineTheta, this.radius * Math.sin(this.theta), Math.sin(this.theta * Math.E * 3) * 0.3);

        this.hitboxModel?.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
    }

    public async select()
    {
        this.isSelected = true;

        if (!(this.camera && this.model))
            return;

        const forward: THREE.Vector3 = this.camera.position.clone();
        forward.sub(this.model.position.clone());
        forward.normalize();

        const right: THREE.Vector3 = forward.clone();
        right.cross(new THREE.Vector3(0, 0, -1));
        right.normalize();
        
        const up: THREE.Vector3 = forward.clone();
        up.cross(right);
        up.normalize();

        const originQuaternion = this.model.quaternion;
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4(
                right.x, up.x, forward.x, 0,
                right.y, up.y, forward.y, 0,
                right.z, up.z, forward.z, 0,
                0, 0, 0, 1
            )
        );

        let t = 0;

        while (t <= 1 && this.isSelected)
        {
            let alpha = t * t * t;

            const quaternionRotation = originQuaternion.clone();
            quaternionRotation.slerp(targetQuaternion, alpha);

            this.model.setRotationFromQuaternion(quaternionRotation);

            await new Promise(resolve => setTimeout(resolve, this.deltaTime)).then(() => t += this.deltaTime);
        }
    }

    public unselect()
    {
        this.isSelected = false;
    }

    // ----------------------------------------------------------------------------------
    // GETTERS & SETTERS
    // ----------------------------------------------------------------------------------

    public get hitboxMesh()
    {
        return this.hitboxModel;
    }
}