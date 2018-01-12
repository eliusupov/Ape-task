import idb from 'idb';

(() => {
	const dbPromise = idb.open('imagesDB', 1, (db) => {
		if (!db.objectStoreNames.contains('images')) {
			const imageOS = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
			imageOS.createIndex('id', 'id', { unique: false });
		}
	});
	onmessage = (msg) => {
		dbPromise
			.then((db) => {
				const tx = db.transaction('images', 'readwrite');
				const storeObj = tx.objectStore('images');
				const data = msg.data;
				storeObj.put(data);
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
