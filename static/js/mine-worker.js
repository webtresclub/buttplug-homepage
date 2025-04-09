/* global importScripts, onmessage */
const window = {};
importScripts('sha3.js');
const sha3 = window;

function hexToBytes(hex) {
	const result = [];
	for (let i = 0; i < 64; i += 2) {
		result.push(parseInt(hex.slice(i, i + 2), 16));
	}
	return result;
}

let searchSeed;

function bytesToHex(bytes) {
	return bytes
		.map((x) => {
			return `0${x.toString(16)}`.slice(-2);
		})
		.join('');
}

function randomSeed() {
	// return Array.from(crypto.getRandomValues(new Uint8Array(32))); // crashes chrome
	const x = new Array(32);
	for (let i = 0; i < 32; i++) {
		x[i] = (Math.random() * 256) | 0;
	}
	return x;
}

function mine(difficulty) {
	// return ['0x84dba1e522eaccb726e1d6a14019b9beb016764cf158218d0ec1dadd71f47159', '0x00ac2718e3', 29, '000000e75dde0fa9a5641377481c4c84aea6d05180ffcaa662db9876ac2718e3', '201.04318548802695 Kh/s'];
	const startTime = Date.now();
	let hash;
	const nonce = randomSeed();

	// 0 contanated
	const expectedHash = '0'.repeat(difficulty); // Pre-compute expected hash prefix

	const baseLen = searchSeed.length;
	const toHash = searchSeed.concat(nonce);

	for (let i = 0; i < 100000; i++) {
		hash = sha3.keccak256(toHash);
		// debugger;
		if (hash.startsWith(expectedHash)) {
			// Use startsWith for clarity
			const rawTime = (Date.now() - startTime) / 1000;
			const khs = 10000 / rawTime / 1000;
			return [`0x${bytesToHex(toHash.slice(-32))}`, hash, Math.floor(rawTime), hash, `${khs} Kh/s`];
		}

		toHash[baseLen + (i & 31)] = (Math.random() * 256) | 0;
	}
	const rawTime = (Date.now() - startTime) / 1000;
	const khs = 10000 / rawTime / 1000;
	return [`0x${bytesToHex(toHash.slice(-32))}`, -1, Math.floor(rawTime), -1, `${khs} Kh/s`];
}

onmessage = ({ data }) => {
	const bytesConcat = data.$account.toLowerCase().slice(2).concat(data.$salt.slice(2));
	searchSeed = [];
	for (let i = 0; i < bytesConcat.length; i += 2) {
		searchSeed.push(parseInt(bytesConcat.slice(i, i + 2), 16));
	}
	const result = mine(parseInt(data.$difficulty));
	postMessage(JSON.stringify(result));
};
