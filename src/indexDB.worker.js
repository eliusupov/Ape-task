const data = [];

onmessage = (msg) => {
	const parsedData = JSON.parse(msg.data);
	data.push(parsedData);
	postMessage(data);
};
