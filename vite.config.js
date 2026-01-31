import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'@walletconnect/utils': path.resolve(__dirname, 'node_modules/@walletconnect/utils/dist/index.js'),
			'@walletconnect/logger': path.resolve(__dirname, 'node_modules/@walletconnect/logger/dist/index.es.js'),
			'@walletconnect/time': path.resolve(__dirname, 'node_modules/@walletconnect/time/dist/esm/index.js'),
			'@walletconnect/heartbeat': path.resolve(__dirname, 'node_modules/@walletconnect/heartbeat/dist/index.es.js'),
			'@walletconnect/window-getters': path.resolve(
				__dirname,
				'node_modules/@walletconnect/window-getters/dist/esm/index.js'
			),
			'@walletconnect/window-metadata': path.resolve(
				__dirname,
				'node_modules/@walletconnect/window-metadata/dist/esm/index.js'
			),
			'@walletconnect/safe-json': path.resolve(
				__dirname,
				'node_modules/@walletconnect/safe-json/dist/esm/index.js'
			),
			'@walletconnect/environment': path.resolve(
				__dirname,
				'node_modules/@walletconnect/environment/dist/esm/index.js'
			),
			'@walletconnect/jsonrpc-utils': path.resolve(
				__dirname,
				'node_modules/@walletconnect/jsonrpc-utils/dist/esm/index.js'
			)
		}
	},
	ssr: {
		noExternal: [/^@reown\/.*/, /^@walletconnect\/.*/, /^@noble\/.*/, /^ox\/.*/, 'ox']
	},
	optimizeDeps: {
		include: ['@walletconnect/utils', '@walletconnect/logger', '@walletconnect/time']
	}
};

export default config;
