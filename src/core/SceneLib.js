import Animator from "./Animator";
import Config from "./Config";
import SceneManager from "./SceneManager";

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
		let failed = false;

		for (let i = 1; i <= 20; i++) {
			if (failed) return;

			await import(`../scenes/scene-${i}`)
				.then((scene) => {
					this.scenes.push(scene.default);
				})
				.catch(() => {
					this.sceneCount = i - 1;
					failed = true;
				});
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
