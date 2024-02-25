import init, { crack } from './pkg/rust_service_worker.js';

let ready = false;
init().then(() => {
  ready = true;
  self.postMessage({status: "ready"});
});

self.onmessage = (e) => {
  if (!ready) {
    self.postMessage({status: "not_ready"});
    return;
  }
  const {wallet, salt, difficulty} = e.data;
  
  const _results = crack(wallet, salt, difficulty);
  const results = {
    nonce: _results.nonce|| null,
    hash: _results.hash || null,
  }
  self.postMessage({status: "loop", results});
};
