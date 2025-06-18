import { Tween, Easing } from "@tweenjs/tween.js";
import Config from "./Config";

export default class AudioManager {
	static _instance;

	constructor(audioAssets = []) {
		if (!AudioManager._instance) {
			this.audioContext = new AudioContext();
			this.audioSources = [];
			this.isMuted = false;

			this.lastState = null;
			this.microphoneStream = null;
			this.switchCooldown = null;
			this.transitionDuration = 8000;

			this.createSources(audioAssets);
			this.startMicrohpone();

			AudioManager._instance = this;
		} else {
			throw new Error(
				"AudioManager is a singleton and cannot be instantiated multiple times."
			);
		}
	}

	static getInstance(audioAssets = []) {
		if (!AudioManager._instance) {
			return new AudioManager(audioAssets);
		}
		return AudioManager._instance;
	}

	getSource(id) {
		return this.audioSources.filter(source => source.id === id)[0];
	}

	createSources(assets) {
		if (assets.length <= 0) return;

		assets.forEach((asset) => {
			const id = asset.src.split('/').pop().split('.').shift();
			const source = this.audioContext.createMediaElementSource(asset);
			const analyser = this.audioContext.createAnalyser();
			const gainNode = this.audioContext.createGain();

			analyser.fftSize = 512;

			source.connect(analyser);
			analyser.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			const dataArray = new Uint8Array(analyser.frequencyBinCount);

			asset.loop = true;

			this.audioSources.push({
				id,
				asset,
				source,
				analyser,
				gainNode,
				data: dataArray,
			});
		});
	}

	play(id) {
		this.getSource(id).asset.play();
	}
	
	pause(id) {
		this.getSource(id).asset.pause();
	}

	pauseAll() {
		this.audioSources.forEach(source => {
			if(!source.asset) return;
			source.asset.pause();
		})
	}

	mute() {
		if (this.isMuted) return;

		this.audioSources.forEach((source) => {
			if (!source.gainNode) return;
			source.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
		});

		this.isMuted = true;
	}

	unmute() {
		if (!this.isMuted) return;

		this.audioSources.forEach((source) => {
			if (!source.gainNode) return;
			source.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
		});

		this.isMuted = false;
	}

	async startMicrohpone() {
		// Prompt the user to use their microphone.
		this.microphoneStream = await navigator.mediaDevices.getUserMedia({
			audio: true,
		});
		const source = this.audioContext.createMediaStreamSource(
			this.microphoneStream
		);
		const analyser = this.audioContext.createAnalyser();
		const gainNode = this.audioContext.createGain();

		analyser.fftSize = 512;

		source.connect(analyser);
		analyser.connect(gainNode);
		
		gainNode.connect(this.audioContext.destination);
		gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

		const dataArray = new Uint8Array(analyser.frequencyBinCount);

		this.audioSources.push({
			id: "mic",
			source,
			analyser,
			data: dataArray,
		});
	}

	// UPDATE METHOD
	// =================================================

	update(config) {
		if (config.muted) this.mute();
		else if (!config.muted) this.unmute();

		this.audioSources.forEach((source) => {
			source.analyser.getByteFrequencyData(source.data);

			const total = source.data.reduce((acc, val) => acc + val, 0);
			const averageVolume = total / source.data.length;

			source.averageVolume = averageVolume;
		});
	}
}
