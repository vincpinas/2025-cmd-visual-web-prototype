import { ACESFilmicToneMapping, PerspectiveCamera, WebGLRenderer } from "three";
import { Group } from "@tweenjs/tween.js";

import Config from "./Config";
import AudioManager from "./AudioManager";
import SceneManager from "./SceneManager";

// Scenes
import DefaultScene from "../scenes/scene-1";
import SceneLibrary from "./SceneLib";

export default class Animator {
	static _instance = null;

	constructor() {
		if (Animator._instance) {
			throw new Error(
				"Animator is a singleton and cannot be instantiated multiple times."
			);
		}

		this.config = Config.getInstance();
		this.tweenGroup = new Group();

		this.camera = new PerspectiveCamera(
			this.config.fov,
			window.innerWidth / window.innerHeight,
			1,
			this.config.renderDistance
		);

		this.sceneLibrary = SceneLibrary.getInstance();

		this.audioManager = AudioManager.getInstance([
			new Audio("assets/content.mp3"),
			new Audio("assets/frustrated.mp3"),
		]);

		this.sceneManager = SceneManager.getInstance(new DefaultScene(this.camera));
	}

	// UPDATE METHOD
	// =================================================

	update(time) {
		this.audioManager.update(this.config);

		if (this.config.frozen) return;

		this.sceneManager.current.update(this.config);
	}

	static getInstance() {
		if (!Animator._instance) {
			Animator._instance = new Animator();
		}
		return Animator._instance;
	}
}
