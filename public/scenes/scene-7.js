import {
	Scene,
	DirectionalLight,
	AmbientLight,
	Color,
	FogExp2,
	MeshStandardMaterial,
	Mesh,
} from "three";

import * as THREE from "three";

import AudioManager from "/src/core/AudioManager";
import Config from "/src/core/Config";

export default class StatesScene extends Scene {
	constructor(camera) {
		super();

		this.audioManager = AudioManager.getInstance();
		this.config = Config.getInstance();
		
		this.setupCamera(camera);
		
		this.initEnvironment();
		
		this.initScene();
	}

	setupAudio() {
		this.audioManager.play("content");
	}
	
	setupCamera(camera) {
		this.camera = camera;

		this.camera.position.set(0, 0, 2);
		this.add(this.camera);
	}

	initScene() {
		this.states = {
			content: {
				geometry: new THREE.SphereGeometry(5, 64, 64),
				material: new MeshStandardMaterial({
					color: 0x66ccff,
				}),
                originalPositions: []
			},
			frustrated: {

			},
		};

		const posAttr = this.states.content.geometry.attributes.position;
		const count = posAttr.count;

		for (let i = 0; i < count; i++) {
			this.states.content.originalPositions.push({
				x: posAttr.getX(i),
				y: posAttr.getY(i),
				z: posAttr.getZ(i),
			});
		}

		const contentStateMesh = new Mesh(
			this.states.content.geometry,
			this.states.content.material
		);
		const frustratedStateMesh = new Mesh(
			this.states.frustrated.geometry,
			this.states.frustrated.material
		);
		this.add(contentStateMesh, frustratedStateMesh);
	}

	initEnvironment() {
		this.light = new DirectionalLight(0xffffff, 15);
		this.ambient = new AmbientLight(0xffffff, 0.25);
		this.background = new Color(0xbfe3dd);
		this.fog = new FogExp2(0xefd1b5, 0.005);

		this.light.position.set(-500, 1500, -1500);

		this.add(this.light);
		this.add(this.ambient);
	}

	// UPDATE METHODS
	// =================================================

	updateContentStatePositioning() {
		const dataArray = this.audioManager.getSource("content").data;

		const positions = this.states.content.geometry.attributes.position;
		for (let i = 0; i < positions.count; i++) {
			const amp = dataArray[i % dataArray.length] / 255;
			const offset = amp * 0.5;

            const orig = this.states.content.originalPositions[i];

            positions.setXYZ(
                i,
                orig.x + offset * Math.sin(i),
                orig.y + offset * Math.cos(i),
                orig.z + offset
            );
		}

		positions.needsUpdate = true;
	}

	updateCamera(mic) {
		if(!mic) return;
		
		const minFOV = 10;
		const maxFOV = 125;
		const minDistance = 3;
		const maxDistance = 5.8;
		const maxVolume = this.config.maxMicVolume;
		
		const currentFOV = maxFOV - (mic.averageVolume / maxVolume) * (maxFOV - minFOV);
		this.camera.fov = currentFOV;
		this.camera.updateProjectionMatrix();
		
		const currentDistance = maxDistance - (mic.averageVolume / maxVolume) * (maxDistance - minDistance);
		this.camera.position.z = currentDistance;
	}
	
	updateFog(mic) {
		if(!mic) return;
		
		const minDensity = 0.005;
		const maxDensity = 10;
		const maxVolume = this.config.maxMicVolume;
		
		const currentDensity = minDensity + (mic.averageVolume / maxVolume) * (maxDensity - minDensity);
		this.fog.density = currentDensity;
		
		const minRed = 0.5;
		const maxRed = 1;
		const minGreen = 0.1;
		const maxGreen = 1;
		const minBlue = 0.1;
		const maxBlue = 1;
		
		const currentRed = minRed + (mic.averageVolume / maxVolume) * (maxRed - minRed);
		const currentGreen = minGreen + (mic.averageVolume / maxVolume) * (maxGreen - minGreen);
		const currentBlue = minBlue + (mic.averageVolume / maxVolume) * (maxBlue - minBlue);
		
		this.fog.color.setRGB(currentRed, currentGreen, currentBlue);
	}

	updateBackground() {
		const mic = this.audioManager.getSource("mic");
		if(!mic) return;

		const minColor = 0xFFFF00; // Yellow
		const maxColor = 0xFF0000; // Red
		const maxVolume = this.config.maxMicVolume;

		const currentColor = minColor + (mic.averageVolume / maxVolume) * (maxColor - minColor);
		this.background.set(currentColor);
	}

	update() {
		const mic = this.audioManager.getSource("mic");

		this.updateCamera(mic);

		this.updateFog(mic);

		this.updateBackground(mic);

		this.updateContentStatePositioning();
	}
}
