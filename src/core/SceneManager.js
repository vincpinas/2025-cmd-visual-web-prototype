import { EffectComposer, RenderPass } from "postprocessing";
import { ACESFilmicToneMapping, WebGLRenderer } from "three";
import AudioManager from "./AudioManager";

export default class SceneManager {
	static _instance;

	constructor(initialScene) {
        this.renderer = new WebGLRenderer({
			canvas: document.getElementById("app"),
			antialias: true,
		});

		this.current = initialScene;

		// Setting initial values for renderer
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

        // Spinning up composer for VFX
		this.composer = new EffectComposer(this.renderer);
		this.renderPass = new RenderPass(this.current, this.current.camera);

		this.composer.addPass(this.renderPass);
	}

	static getInstance(initialScene) {
		if (!SceneManager._instance) {
			if (!initialScene) {
				throw new Error(
					"Initial scene must be provided for the first instantiation."
				);
			}
			SceneManager._instance = new SceneManager(initialScene);
		}
		return SceneManager._instance;
	}

	addEffect(effect) {
		this.composer.addPass(effect);
	}

	setScene(scene) {
        if(!scene) return;

		this.destroyCurrent();

		if (this.renderPass) {
			this.renderPass.mainScene = scene;

            this.current = scene;
		}

		this.current.setupAudio();
	}

	destroyCurrent() {
		if (!this.current) return;

		// Remove all children from the scene
		while (this.current.children.length > 0) {
			const child = this.current.children[0];
			this.current.remove(child);

			// Dispose geometries, materials, and textures if possible
			if (child.geometry) {
				child.geometry.dispose?.();
			}
			if (child.material) {
				// Some objects have an array of materials
				if (Array.isArray(child.material)) {
					child.material.forEach((mat) => mat.dispose?.());
				} else {
					child.material.dispose?.();
				}
			}
			// Dispose textures if present
			if (child.material && child.material.map) {
				child.material.map.dispose?.();
			}
		}

		AudioManager.getInstance().pauseAll();
	}
}
