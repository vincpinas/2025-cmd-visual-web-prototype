import Animator from "./core/Animator";

// Game object, this stores all the objects the game will use apart of the post processing unit.
const animation = new Animator();

// On window resizing.
window.onresize = () => {
	animation.camera.aspect = window.innerWidth / window.innerHeight;
	animation.camera.updateProjectionMatrix();

	animation.sceneManager.renderer.setSize(window.innerWidth, window.innerHeight);
};

// Rendering loop, this updates the game and then renders using the post processer each tick.
const render = (time) => {
	animation.update(time);
	animation.tweenGroup.update(); // Update all active tweens in the group
	animation.sceneManager.composer.render(
		animation.sceneManager.current,
		animation.sceneManager.current.camera
	);
	requestAnimationFrame(render);
};
requestAnimationFrame(render);
