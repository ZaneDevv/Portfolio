import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { SolarSystem } from './scenarios/SolarSystem.ts'


createApp(App).mount('#app');

const objLoader: OBJLoader = new OBJLoader();
new SolarSystem(objLoader);