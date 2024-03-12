import { sveltekit } from '@sveltejs/kit/vite';

const graph_url = 'https://api.studio.thegraph.com/proxy/67825/buttpluggy/v0.0.4/';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
    proxy: {
      '/api': {
        target: graph_url,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

export default config;
