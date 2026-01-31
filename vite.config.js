import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@reown/appkit-wallet', '@walletconnect/logger']
	}
};

export default config;
