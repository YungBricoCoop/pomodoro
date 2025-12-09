let intervalId: number | undefined;

self.onmessage = (e) => {
	if (e.data === 'start') {
		if (!intervalId) {
			intervalId = setInterval(() => {
				self.postMessage('tick');
			}, 1000) as unknown as number;
		}
	} else if (e.data === 'stop') {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
	}
};

export {};
