import js from '@eslint/js';
import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
	js.configs.recommended,
	{
		ignores: [
			'.svelte-kit/**/*',
			'node_modules/**/*',
			'build/**/*',
			'dist/**/*',
			'static/js/pkg/**/*',
			'rust-service-worker/**/*',
			'rust-service-worker-gpu/**/*'
		]
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,svelte}'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: typescriptParser,
				sourceType: 'module',
				ecmaVersion: 2020,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				browser: true,
				es2017: true,
				node: true,
				window: true,
				document: true,
				localStorage: true,
				console: true,
				fetch: true,
				alert: true,
				prompt: true,
				Worker: true,
				MessageEvent: true,
				navigator: true,
				setInterval: true,
				clearInterval: true
			}
		},
		plugins: {
			svelte: sveltePlugin,
			'@typescript-eslint': typescriptPlugin
		},
		rules: {
			...sveltePlugin.configs.recommended.rules,
			...prettier.rules,
			'no-unused-vars': ['error', { varsIgnorePattern: '^_' }]
		}
	}
];
