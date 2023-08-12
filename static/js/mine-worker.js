/* global importScripts, onmessage */
const window = {};
importScripts('sha3.min.js');
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
  return bytes.map((x) => { return (`0${x.toString(16)}`).slice(-2); }).join('');
}

function randomSeed() {
  // return Array.from(crypto.getRandomValues(new Uint8Array(32))); // crashes chrome
  const x = new Array(32);
  for (let i = 0; i < 32; i += 1) {
    x[i] = Math.floor(Math.random() * 256);
  }
  return x;
}

function mine() {
  // return ['0x84dba1e522eaccb726e1d6a14019b9beb016764cf158218d0ec1dadd71f47159', '0x00ac2718e3', 29, '000000e75dde0fa9a5641377481c4c84aea6d05180ffcaa662db9876ac2718e3', '201.04318548802695 Kh/s'];
  let time = Date.now();
  const startTime = Date.now();
  let hash;
  const nonce = randomSeed();
  for(let i = 0; i < 100000; i++) {
    hash = sha3.keccak256(searchSeed.concat(nonce));
    // debugger;
    if (hash.slice(0, 5) === '00000') {
      const rawTime = (Date.now() - startTime) / 1000;
      time = Math.floor(rawTime);
      const khs = 10000 / rawTime / 1000;
      console.log(`0x${bytesToHex(searchSeed.concat(nonce))}`);
      return [`0x${bytesToHex(nonce)}`, hash, time, hash, `${khs} Kh/s`];
      break;
    }

    // just change one byte
    nonce[i % 32] =  Math.floor(Math.random() * 256);
    //nonce[(Math.random() * 256) % 32] =  Math.floor(Math.random() * 256);
  }
  const rawTime = (Date.now() - startTime) / 1000;
  time = Math.floor(rawTime);
  const khs = 10000 / rawTime / 1000;
  return [`0x${bytesToHex(nonce)}`, -1, time, -1, `${khs} Kh/s`];
}

onmessage = ({data}) => {
  const bytesConcat = data.$account.toLowerCase().slice(2).concat(data.$salt.slice(2));
  
  searchSeed = [];
  for (let i = 0; i < bytesConcat.length; i += 2) {
    searchSeed.push(parseInt(bytesConcat.slice(i, i + 2), 16));
  }
  const result = mine();
  postMessage(JSON.stringify(result));
};