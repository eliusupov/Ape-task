import $ from 'jquery';
import idb from 'idb';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/style.css';
import { debounce } from './helper';
import Worker from './image.worker';

$(() => {
	// little store Obj
	const store = {
		indexValue: 0,
		mode: null,
	};
	// web worker
	const worker = new Worker();
	// worker
	worker.onmessage = (e) => {
		console.log(e.data);
	};
	// url to fetch JSON Obj
	const fetchUrl = 'http://localhost/apester/src/gallery-data.json';
	// creates images and appends to the DOM
	const imageCreator = (index, data, webWorker) => {
		for (let i = index; i < index + 15; i++) {
			const image = `<img src="${data[i].low_resolution.url}"
												style="background-color: ${data[i].prominentColor}"
                        data-src="${data[i].standard_resolution.url}"
                        onclick="window.location = this.src"
                        onload="this.src = this.dataset.src; this.removeAttribute('data-set');"
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
	// Loads the images with an ajax request from gallery-data.json
	// gets index from index counter and updates it
	const loadImages = (url, index, webWorker) => {
		fetch(url)
		.then(res => res.json())
		.then((data) => {
			imageCreator(index, data, webWorker);
		})
		.catch((err) => {
			throw new Error(err);
		});
	};
	// gets data from db and sends to imageCreator function
	const loadFromLocal = (index) => {
		const dbPromise = idb.open('imagesDB', 1, () => {});
		dbPromise.then((db) => {
			const tx = db.transaction('images', 'readonly');
			const store = tx.objectStore('images');
			return store.getAll();
		}).then((data) => {
			imageCreator(index, data);
		}).catch(() => {
			console.log('No more images load more from Ajax');
		});
	};
	// checks if the user scrolled down enough to load additional images
	const viewport = () => {
		const scrollBot = $(document).height() - $(window).height() - $(window).scrollTop();
		if (scrollBot < 1000) {
			if (store.mode === 'local') {
				loadFromLocal(store.indexValue);
			}
			if (store.mode === 'ajax') {
				loadImages(fetchUrl, store.indexValue, worker);
			}
		}
	};
	// loads from DB instead of Ajax
	const loadOffline = () => {
		store.mode = 'local';
		$(window).scroll(debounce(viewport));
		loadFromLocal(store.indexValue);
	};
	// loads from Ajax request instead of db
	const loadAjax = () => {
		store.mode = 'ajax';
		$(window).scroll(debounce(viewport));
		loadImages(fetchUrl, store.indexValue, worker);
	};
	// empties the DB
	const emptyDB = () => {
		idb.delete('imagesDB').then(() => console.log('done!'));
	};
	// adds click events on the buttons
	const offline = document.getElementById('offline');
	offline.addEventListener('click', loadOffline, false);
	const ajax = document.getElementById('ajax');
	ajax.addEventListener('click', loadAjax, false);
	const deleteDB = document.getElementById('delete-db');
	deleteDB.addEventListener('click', emptyDB, false);
});
