import $ from "jquery";
import Worker from './indexDB.worker';

const worker = new Worker();
// index counter
const indexCounter = {
	value: 0,
};
// makes viewport function not to run as many times
function debounce(func, wait = 30, immediate = false) {
	var timeout;
	return function () {
		var context = this, args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// checks if the user scrolled down enough to load additional images
const viewport = () => {
	const scrollBot = $(document).height() - $(window).height() - $(window).scrollTop();
	if (scrollBot < 1000) {
		loadImages(indexCounter.value);
	}
};

// Loads the images from localStorage
const loadFromLocal = () => {
	if (localStorage.images) {
		const data = JSON.parse(localStorage.images);
		for (let i = 0; i < data.length; i++) {
			const image = `<img class="img-thumbnail" src="${data[i].low_resolution.url}" style="background-color: ${data[i].prominentColor}" data-src="${data[i].standard_resolution.url}" onload="this.src = this.dataset.src; this.removeAttribute('data-set');" alt="Responsive image">`;
			$('#image-list').append(image);
			indexCounter.value += 1;
			worker.postMessage(JSON.stringify(data[i]));
		}
	}
};

// Loads the images with an ajax request from gallery-data.json
// gets index from index counter and updates it
const loadImages = (index) => {
	$.ajax({
		url: 'http://localhost/apester/src/gallery-data.json',
		success: (data) => {
			for (let i = index; i < index + 15; i++) {
				const image = `<div class="img-container"><img src="${data[i].low_resolution.url}" style="background-color: ${data[i].prominentColor}" data-src="${data[i].standard_resolution.url}" onload="this.src = this.dataset.src; this.removeAttribute('data-set');" alt="Responsive image"></div>`;
				$('#image-list').append(image);
				indexCounter.value += 1;
				worker.postMessage(JSON.stringify(data[i]));
			}
		},
		error: (err) => {
			throw err;
		},
	});
};

export { debounce, viewport, loadFromLocal, loadImages, indexCounter };
