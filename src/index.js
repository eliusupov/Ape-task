import $ from 'jquery';
import idb from 'idb';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'animate.css';
import './index.html';
import './styles/style.css';
import { debounce } from './helper';
import Worker from './image.worker';
import store from './components/store';

$(() => {
	// web worker
	const worker = new Worker();
	// worker
	worker.onmessage = (e) => {
		console.log(e.data);
	};
	// creates images and appends to the DOM
	const imageCreator = (index, data, webWorker) => {
		for (let i = index; i < index + 15; i++) {
			const image = `<img src="${data[i].low_resolution.url}"
												class="animated fadeIn"
												style="background-color: ${data[i].prominentColor}"
                        data-src="${data[i].standard_resolution.url}"
                        onclick="window.open(this.src)"
                        onload="this.src = this.dataset.src;"
                        alt="image">`;
			const imageList = document.getElementById('image-list');
			const imgContainer = document.createElement('div');
			imgContainer.classList.add('img-container');
			imgContainer.innerHTML = image;
			imageList.appendChild(imgContainer);
			store.indexValue += 1;
			if (webWorker) {
				worker.postMessage(data[i]);
			}
		}
	};
	// Loads the images from gallery-data.json
	// gets index from store.indexValue and updates it
	const loadImages = (index, webWorker) => {
		const json = require('./gallery-data.json');
		fetch(json)
		.then(res => res.json())
		.then((data) => {
			imageCreator(index, data, webWorker);
		})
		.catch((err) => {
			throw new Error(err);
		});
	};
	const loadFromLocal = (index) => {
		const dbPromise = idb.open('imagesDB', 1, () => {});
		dbPromise.then((db) => {
			const tx = db.transaction('images', 'readwrite');
			const storeObj = tx.objectStore('images');
			return storeObj.getAll();
		})
		.then((data) => {
			imageCreator(index, data);
		})
		.catch(() => {
			console.log('No more images load more from JSON');
		});
	};
	// checks if the user scrolled down enough to load additional images
	const viewport = () => {
		const scrollBot = $(document).height() - $(window).height() - $(window).scrollTop();
		if (scrollBot < 1000) {
			if (store.mode === 'local') {
				loadFromLocal(store.indexValue);
			}
			if (store.mode === 'json') {
				loadImages(store.indexValue, worker);
			}
		}
	};
	// loads from DB instead of JSON
	const loadOffline = () => {
		document.getElementById('image-list').innerHTML = '';
		store.mode = 'local';
		store.indexValue = 0;
		$(window).scroll(debounce(viewport));
		loadFromLocal(store.indexValue);
	};
	// loads from JSON request instead of db
	const loadJSON = () => {
		document.getElementById('image-list').innerHTML = '';
		store.mode = 'json';
		$(window).scroll(debounce(viewport));
		loadImages(store.indexValue, worker);
	};
	// empties the DB
	const emptyDB = () => {
		document.getElementById('image-list').innerHTML = '';
		const dbPromise = idb.open('imagesDB', 1, () => {});
		dbPromise.then((db) => {
			const tx = db.transaction('images', 'readwrite');
			const store = tx.objectStore('images');
			store.clear();
			console.log('objectStore Cleared');
		}).catch(() => {
			console.log('No more images load more from JSON');
		});
	};
	// adds click events on the buttons
	const offline = document.getElementById('offline');
	offline.addEventListener('click', loadOffline, false);
	const json = document.getElementById('ajax');
	json.addEventListener('click', loadJSON, false);
	const deleteDB = document.getElementById('delete-db');
	deleteDB.addEventListener('click', emptyDB, false);
});
