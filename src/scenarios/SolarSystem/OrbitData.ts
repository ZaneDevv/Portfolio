import * as THREE from 'three';
import { BodyInOrbit } from './BodyInOrbit';

// ----------------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------------

export interface OrbitData {
    radius: number,

    phi: number,
    theta: number, 
    thetaOffset: number,
    alpha: number,
    speed: number,

    orbitAngle: number,

    orbitMesh: THREE.Mesh<THREE.RingGeometry, THREE.Material, THREE.Object3DEventMap>,
    bodyToOrbit: BodyInOrbit
};