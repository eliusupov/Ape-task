import $ from 'jquery';
// import 'bootstrap';
import './style.css';
import { debounce, viewport, loadFromLocal, loadImages, indexCounter } from './helper';
import Worker from './indexDB.worker';

$(() => {
	// web worker
	const worker = new Worker();
	// sets the array returned from web-worker to localStorage
	worker.onmessage = (msg) => {
		console.log('12');
		console.log(msg.data);
		localStorage.setItem('images', JSON.stringify(msg.data));
		localStorage.setItem('timestamp', `${new Date().getHours()}`);
	};
	$(window).scroll(debounce(viewport));
	// checks if there are any images
	if (!document.getElementById('image-list').hasChildNodes()) {
		// checks if there is an object in local storage and if not gets images from ajax
		if (!localStorage.images) {
			loadImages(indexCounter.value);
		} else {
			loadFromLocal();
		}
	}
});
