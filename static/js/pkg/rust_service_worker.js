let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
	return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
	if (idx < 132) return;
	heap[idx] = heap_next;
	heap_next = idx;
}

function takeObject(idx) {
	const ret = getObject(idx);
	dropObject(idx);
	return ret;
}

const cachedTextDecoder =
	typeof TextDecoder !== 'undefined'
		? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
		: {
				decode: () => {
					throw Error('TextDecoder not available');
				}
			};

if (typeof TextDecoder !== 'undefined') {
	cachedTextDecoder.decode();
}

let cachedUint8Memory0 = null;

function getUint8Memory0() {
	if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1);
	const idx = heap_next;
	heap_next = heap[idx];

	heap[idx] = obj;
	return idx;
}
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
	const ret = wasm.add(a, b);
	return ret;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
	if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	}
	return cachedInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder =
	typeof TextEncoder !== 'undefined'
		? new TextEncoder('utf-8')
		: {
				encode: () => {
					throw Error('TextEncoder not available');
				}
			};

const encodeString =
	typeof cachedTextEncoder.encodeInto === 'function'
		? function (arg, view) {
				return cachedTextEncoder.encodeInto(arg, view);
			}
		: function (arg, view) {
				const buf = cachedTextEncoder.encode(arg);
				view.set(buf);
				return {
					read: arg.length,
					written: buf.length
				};
			};

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length, 1) >>> 0;
		getUint8Memory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}

	let len = arg.length;
	let ptr = malloc(len, 1) >>> 0;

	const mem = getUint8Memory0();

	let offset = 0;

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 0x7f) break;
		mem[ptr + offset] = code;
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset);
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
		const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
		const ret = encodeString(arg, view);

		offset += ret.written;
		ptr = realloc(ptr, len, offset, 1) >>> 0;
	}

	WASM_VECTOR_LEN = offset;
	return ptr;
}
/**
 * @param {string} user_str
 * @param {string} current_salt_str
 * @param {number} difficulty
 * @returns {Results}
 */
export function crack(user_str, current_salt_str, difficulty) {
	const ptr0 = passStringToWasm0(user_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	const len0 = WASM_VECTOR_LEN;
	const ptr1 = passStringToWasm0(current_salt_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	const len1 = WASM_VECTOR_LEN;
	const ret = wasm.crack(ptr0, len0, ptr1, len1, difficulty);
	return Results.__wrap(ret);
}

function handleError(f, args) {
	try {
		return f.apply(this, args);
	} catch (e) {
		wasm.__wbindgen_exn_store(addHeapObject(e));
	}
}

const ResultsFinalization =
	typeof FinalizationRegistry === 'undefined'
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_results_free(ptr >>> 0));
/**
 */
export class Results {
	static __wrap(ptr) {
		ptr = ptr >>> 0;
		const obj = Object.create(Results.prototype);
		obj.__wbg_ptr = ptr;
		ResultsFinalization.register(obj, obj.__wbg_ptr, obj);
		return obj;
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr;
		this.__wbg_ptr = 0;
		ResultsFinalization.unregister(this);
		return ptr;
	}

	free() {
		const ptr = this.__destroy_into_raw();
		wasm.__wbg_results_free(ptr);
	}
	/**
	 * @returns {string}
	 */
	get nonce() {
		let deferred1_0;
		let deferred1_1;
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
			wasm.results_nonce(retptr, this.__wbg_ptr);
			var r0 = getInt32Memory0()[retptr / 4 + 0];
			var r1 = getInt32Memory0()[retptr / 4 + 1];
			deferred1_0 = r0;
			deferred1_1 = r1;
			return getStringFromWasm0(r0, r1);
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16);
			wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
		}
	}
	/**
	 * @returns {string}
	 */
	get hash() {
		let deferred1_0;
		let deferred1_1;
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
			wasm.results_hash(retptr, this.__wbg_ptr);
			var r0 = getInt32Memory0()[retptr / 4 + 0];
			var r1 = getInt32Memory0()[retptr / 4 + 1];
			deferred1_0 = r0;
			deferred1_1 = r1;
			return getStringFromWasm0(r0, r1);
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16);
			wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
		}
	}
	/**
	 * @param {string} nonce
	 * @param {string} hash
	 * @returns {Results}
	 */
	static new(nonce, hash) {
		const ptr0 = passStringToWasm0(nonce, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len1 = WASM_VECTOR_LEN;
		const ret = wasm.results_new(ptr0, len0, ptr1, len1);
		return Results.__wrap(ret);
	}
}

async function __wbg_load(module, imports) {
	if (typeof Response === 'function' && module instanceof Response) {
		if (typeof WebAssembly.instantiateStreaming === 'function') {
			try {
				return await WebAssembly.instantiateStreaming(module, imports);
			} catch (e) {
				if (module.headers.get('Content-Type') != 'application/wasm') {
					console.warn(
						'`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
						e
					);
				} else {
					throw e;
				}
			}
		}

		const bytes = await module.arrayBuffer();
		return await WebAssembly.instantiate(bytes, imports);
	} else {
		const instance = await WebAssembly.instantiate(module, imports);

		if (instance instanceof WebAssembly.Instance) {
			return { instance, module };
		} else {
			return instance;
		}
	}
}

function __wbg_get_imports() {
	const imports = {};
	imports.wbg = {};
	imports.wbg.__wbg_crypto_d05b68a3572bb8ca = function (arg0) {
		const ret = getObject(arg0).crypto;
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_is_object = function (arg0) {
		const val = getObject(arg0);
		const ret = typeof val === 'object' && val !== null;
		return ret;
	};
	imports.wbg.__wbg_process_b02b3570280d0366 = function (arg0) {
		const ret = getObject(arg0).process;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_versions_c1cb42213cedf0f5 = function (arg0) {
		const ret = getObject(arg0).versions;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_node_43b1089f407e4ec2 = function (arg0) {
		const ret = getObject(arg0).node;
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_is_string = function (arg0) {
		const ret = typeof getObject(arg0) === 'string';
		return ret;
	};
	imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
		takeObject(arg0);
	};
	imports.wbg.__wbg_msCrypto_10fc94afee92bd76 = function (arg0) {
		const ret = getObject(arg0).msCrypto;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_require_9a7e0f667ead4995 = function () {
		return handleError(function () {
			const ret = module.require;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbindgen_is_function = function (arg0) {
		const ret = typeof getObject(arg0) === 'function';
		return ret;
	};
	imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
		const ret = getStringFromWasm0(arg0, arg1);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_randomFillSync_b70ccbdf4926a99d = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).randomFillSync(takeObject(arg1));
		}, arguments);
	};
	imports.wbg.__wbg_getRandomValues_7e42b4fb8779dc6d = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).getRandomValues(getObject(arg1));
		}, arguments);
	};
	imports.wbg.__wbg_newnoargs_cfecb3965268594c = function (arg0, arg1) {
		const ret = new Function(getStringFromWasm0(arg0, arg1));
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_call_3f093dd26d5569f8 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).call(getObject(arg1));
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
		const ret = getObject(arg0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_self_05040bd9523805b9 = function () {
		return handleError(function () {
			const ret = self.self;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_window_adc720039f2cb14f = function () {
		return handleError(function () {
			const ret = window.window;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_globalThis_622105db80c1457d = function () {
		return handleError(function () {
			const ret = globalThis.globalThis;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_global_f56b013ed9bcf359 = function () {
		return handleError(function () {
			const ret = global.global;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbindgen_is_undefined = function (arg0) {
		const ret = getObject(arg0) === undefined;
		return ret;
	};
	imports.wbg.__wbg_call_67f2111acd2dfdb6 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_buffer_b914fb8b50ebbc3e = function (arg0) {
		const ret = getObject(arg0).buffer;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_newwithbyteoffsetandlength_0de9ee56e9f6ee6e = function (arg0, arg1, arg2) {
		const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_new_b1f2d6842d615181 = function (arg0) {
		const ret = new Uint8Array(getObject(arg0));
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_set_7d988c98e6ced92d = function (arg0, arg1, arg2) {
		getObject(arg0).set(getObject(arg1), arg2 >>> 0);
	};
	imports.wbg.__wbg_newwithlength_0d03cef43b68a530 = function (arg0) {
		const ret = new Uint8Array(arg0 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_subarray_adc418253d76e2f1 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_throw = function (arg0, arg1) {
		throw new Error(getStringFromWasm0(arg0, arg1));
	};
	imports.wbg.__wbindgen_memory = function () {
		const ret = wasm.memory;
		return addHeapObject(ret);
	};

	return imports;
}

function __wbg_init_memory(imports, maybe_memory) {}

function __wbg_finalize_init(instance, module) {
	wasm = instance.exports;
	__wbg_init.__wbindgen_wasm_module = module;
	cachedInt32Memory0 = null;
	cachedUint8Memory0 = null;

	return wasm;
}

function initSync(module) {
	if (wasm !== undefined) return wasm;

	const imports = __wbg_get_imports();

	__wbg_init_memory(imports);

	if (!(module instanceof WebAssembly.Module)) {
		module = new WebAssembly.Module(module);
	}

	const instance = new WebAssembly.Instance(module, imports);

	return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
	if (wasm !== undefined) return wasm;

	if (typeof input === 'undefined') {
		input = new URL('rust_service_worker_bg.wasm', import.meta.url);
	}
	const imports = __wbg_get_imports();

	if (
		typeof input === 'string' ||
		(typeof Request === 'function' && input instanceof Request) ||
		(typeof URL === 'function' && input instanceof URL)
	) {
		input = fetch(input);
	}

	__wbg_init_memory(imports);

	const { instance, module } = await __wbg_load(await input, imports);

	return __wbg_finalize_init(instance, module);
}

//export { initSync }
export default __wbg_init;
