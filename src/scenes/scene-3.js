import {
	Scene,
	DirectionalLight,
	AmbientLight,
	Color,
	FogExp2,
	SphereGeometry,
	MeshStandardMaterial,
	Mesh,
} from "three";

import AudioManager from "../core/AudioManager";
import Config from "../core/Config";

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
				geometry: new SphereGeometry(5, 64, 64),
				material: new MeshStandardMaterial({
					color: 0x66ccff,
					wireframe: true,
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
		const maxFOV = 140;
		const minDistance = 2;
		const maxDistance = 8;
		const maxVolume = this.config.maxMicVolume;
		
		const currentFOV = maxFOV - (mic.averageVolume / maxVolume) * (maxFOV - minFOV);
		this.camera.fov = currentFOV;
		this.camera.updateProjectionMatrix();

		const currentDistance = maxDistance - (mic.averageVolume / maxVolume) * (maxDistance - minDistance);
		this.camera.position.z = currentDistance;
	}

	updateFog() {
		
	}

	update() {
		const mic = this.audioManager.getSource("mic");

		this.updateCamera(mic);

		this.updateContentStatePositioning();
	}
}
