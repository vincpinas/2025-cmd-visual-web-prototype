export default class Config {
	constructor() {
		this.muted = true;
		this.maxMicVolume = 175;
		
		this.keys = Object.keys(this);
		
		this.frozen = false;
		this.panel = document.getElementById("config");

		this.init();
	}

	init() {
		this.keys.forEach((key) => {
			this.addPanelOption(key);
		});

		const configButton = document.getElementById("config-button");
		configButton.addEventListener("click", () => {
			this.panel.parentElement.classList.toggle("active");
		});

		this.cleanUpPanel();
	}

	addPanelOption(key) {
		const panelLabel = document.createElement("label");
		const panelOption = this.createTypedInput(key);

		panelLabel.innerText = key.replace(/([A-Z])/g, " $1").trim();

		panelLabel.appendChild(panelOption);
		this.panel.appendChild(panelLabel);
	}

	createTypedInput(key) {
		const type = typeof this[key];
		const input = document.createElement("input");

		input.id = key;
		input.name = key;

		if (type === "number") input.type = "number";
		else if (type === "boolean") input.type = "checkbox";
		else if (type === "string") input.type = "text";

		if (type === "boolean") {
			input.checked = this[key];

			input.addEventListener("click", () => {
				this[key] = input.checked;
			});
		} else {
			input.value = this[key];

			input.addEventListener("change", () => {
				this[key] = JSON.parse(input.value);
			});
		}

		return input;
	}

	cleanUpPanel() {
		const inputGroups = [];
		const inputs = this.panel.querySelectorAll("input");
		let currentGroup = null;

		// Sort into groups
		inputs.forEach((input) => {
			if (currentGroup && currentGroup.type !== input.type) {
				currentGroup = null;
			}
			if (!currentGroup) {
				currentGroup = { type: input.type, elements: [input] };
				inputGroups.push(currentGroup);
			} else {
				currentGroup.elements.push(input);
			}
		});

		// Put grouped elements on the same row (only checkboxes right now).
		inputGroups.forEach((group) => {
			if (group.type !== "checkbox") return;

			const wrapper = document.createElement("div");
			wrapper.className = "config-row";

			group.elements.forEach((element) => {
				wrapper.appendChild(element.parentElement);
			});

			this.panel.appendChild(wrapper);
		});
	}

	static getInstance() {
		if (!Config._instance) {
			Config._instance = new Config();
		}
		return Config._instance;
	}

	set(option, value) {
		this[option] = value;
	}
}
