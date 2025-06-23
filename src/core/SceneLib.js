import Config from "./Config";
import SceneManager from "./SceneManager";

// Static imports for production builds
import Scene1 from "../scenes/scene-1.js";
import Scene2 from "../scenes/scene-2.js";
import Scene3 from "../scenes/scene-3.js";
import Scene4 from "../scenes/scene-4.js";
import Scene5 from "../scenes/scene-5.js";
import Scene6 from "../scenes/scene-6.js";
import Scene7 from "../scenes/scene-7.js";
import Scene8 from "../scenes/scene-8.js";
import Scene9 from "../scenes/scene-9.js";

export default class SceneLibrary {
	static _instance = null;

	constructor() {
		if (SceneLibrary._instance) {
			throw new Error(
				"SceneLibrary is a singleton and cannot be instantiated multiple times."
			);
		}
		SceneLibrary._instance = this;

		this.scenes = [];
		this.index = 0;
		this.sceneCount = 0;

		this.panel = document.getElementById("scene-lib");
		this.elements = {
			controls: document.createElement("span"),
			playButton: document.createElement("button"),
			prevButton: document.createElement("button"),
			nextButton: document.createElement("button"),
			sceneId: document.createElement("p"),
		};

		this.init();
	}

	async importScenes() {
		const isProduction = window.location.href.includes("netlify");
		
		if (isProduction) {
			// Use static imports for production
			const staticScenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9];
			staticScenes.forEach((scene, index) => {
				if (scene && scene.default) {
					this.scenes.push(scene.default);
				}
			});
			this.sceneCount = this.scenes.length;
		} else {
			// Use dynamic imports for development
			const basePath = "../scenes";

			for (let i = 1; i <= 20; i++) {
				try {
					const scene = await import(`${basePath}/scene-${i}.js`);
					this.scenes.push(scene.default);
					this.sceneCount = i;
				} catch (error) {
					console.log(`Scene ${i} not found, stopping import`);
					this.sceneCount = i - 1;
					break;
				}
			}
		}
	}

	async init() {
		await this.importScenes();

		const configButton = document.getElementById("scene-lib-button");
		const elements = this.elements;

		configButton.addEventListener("click", () => {
			this.panel.parentElement.classList.toggle("active");
		});

		elements.controls.className = "scene-lib-controls";
		elements.sceneId.className = "scene-lib-id";
		elements.playButton.className = "scene-lib-play";

		elements.prevButton.innerHTML = '<i class="fa-solid fa-backward"></i>';
		elements.playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
		elements.nextButton.innerHTML = '<i class="fa-solid fa-forward"></i>';
		elements.sceneId.innerHTML = `Versie <b>${this.index + 1}</b> van de <b>${
			this.sceneCount
		}</b>`;

		elements.playButton.addEventListener("click", () => {
			const config = Config.getInstance();

			if (config.frozen) {
				config.frozen = false;
				playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
			} else {
				config.frozen = true;
				playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
			}
		});

		elements.prevButton.addEventListener("click", async () => {
			if (this.index === 0) return;
			this.goTo(this.index - 1);
		});

		elements.nextButton.addEventListener("click", async () => {
			if (this.index === this.sceneCount - 1) return;
			this.goTo(this.index + 1);
		});

		elements.controls.append(
			elements.prevButton,
			elements.playButton,
			elements.nextButton
		);
		this.panel.append(elements.controls, elements.sceneId);

		this.goTo(this.sceneCount - 1);
	}

	async getScene(index, camera) {
		if (this.scenes.length <= 0) return null;
		return new this.scenes[index](camera);
	}

	async goTo(index) {
		const camera = SceneManager.getInstance().current.camera;

		const scene = await this.getScene(index, camera);

		if (!scene) return;

		this.index = index;

		SceneManager.getInstance().setScene(scene, camera);

		this.elements.sceneId.innerHTML = `Versie <b>${
			this.index + 1
		}</b> van de <b>${this.sceneCount}</b>`;
	}

	static getInstance() {
		if (!SceneLibrary._instance) {
			SceneLibrary._instance = new SceneLibrary();
		}
		return SceneLibrary._instance;
	}
}
