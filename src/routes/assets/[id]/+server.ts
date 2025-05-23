import { error } from '@sveltejs/kit';

import minify from '@node-minify/core';
import htmlMinifier from '@node-minify/html-minifier';
import cssnano from '@node-minify/cssnano';
import babelMinify from '@node-minify/babel-minify';
import HTML from "./index.html.txt?raw";

import data from '$lib/data.json';
import attributes from '$lib/attributes-group.json';

let minifiedHtml: string | undefined;

async function getHTML() {

	const html = HTML;

	return (await minify({
		compressor: htmlMinifier,
		content: html
	})) as string;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
	const id = parseInt(params.id || '0');
	const validId = id > 0 && id < 1025;
	if (!validId) {
		throw error(400, 'Buttplug Not found');
	}

	const fullId = ('00000' + id).slice(-4);

    /*
	if (!minifiedHtml) {
		minifiedHtml = await getHTML();
	}
        */

	/*const renderHTML = minifiedHtml
		.replace('BUTTPLUGGY_REPLACE_DATA', `<script>boot('${fullId}')</script>`)
		.replace('BUTTPLUGGY_FULLID', fullId);*/

	return new Response(HTML.replace('params:{id:"1"}', `params:{id:"${fullId}"}`), {
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
}