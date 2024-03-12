import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
    proxy: {
      '/api': {
        target: 'https://api.studio.thegraph.com/proxy/67825/buttpluggy/v0.0.4/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

export default config;
