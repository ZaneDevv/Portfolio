import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { SolarSystem } from './scenarios/SolarSystem/SolarSystem.ts'

// ----------------------------------------------------------------------------------
// APP SETUP
// ----------------------------------------------------------------------------------

createApp(App).mount('#app');

// ----------------------------------------------------------------------------------
// SCENARIOS SETUP
// ----------------------------------------------------------------------------------

const objLoader: OBJLoader = new OBJLoader();
const textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

new SolarSystem(objLoader, textureLoader);