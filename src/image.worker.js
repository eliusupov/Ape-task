import idb from 'idb';

(() => {
	const dbPromise = idb.open('imagesDB', 1, (upgradeDb) => {
		const imageOS = upgradeDb.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
		imageOS.createIndex('id', 'id', { unique: false });
	});
	onmessage = (msg) => {
		dbPromise
			.then((db) => {
				const tx = db.transaction('images', 'readwrite');
				const store = tx.objectStore('images');
				const data = msg.data;
				store.put(data);
				return tx.complete;
			})
			.then(() => {
				postMessage('added item to the Image ObjectStore!');
			})
			.catch((err) => {
				postMessage('error');
				throw new Error(err);
			});
	};
})();
