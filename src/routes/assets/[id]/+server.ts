import { error } from '@sveltejs/kit';

import minify from '@node-minify/core';
import htmlMinifier from '@node-minify/html-minifier';
import cssnano from '@node-minify/cssnano';
import babelMinify from '@node-minify/babel-minify';

import { readFile } from 'node:fs/promises';

import data from '$lib/data.json';
import attributes from '$lib/attributes-group.json';

let minifiedHtml: string | undefined;

async function getHTML() {
	const cssFileContents = await readFile('./static/term.css', 'utf8'); // Lee el archivo como texto

	const minifiedCss = (await minify({
		compressor: cssnano,
		content: cssFileContents
	})) as string;

	const jsFileContents = await readFile('./static/term.js', 'utf8'); // Lee el archivo como texto
	const minifiedJS = (await minify({
		compressor: babelMinify,
		content: jsFileContents
	})) as string;

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Pluggy Splash</title>
<style>${minifiedCss}</style>
</head>
<body>
<div id="splash">
    <img id="pluggy" src="https://buttpluggy.com/images/BUTTPLUGGY_FULLID.gif" alt="Pluggy">
</div>
<span id="hint">*click*</span>
<div id="termWrap">
    <div id="output">
    </div>
    <div id="inputBar">&gt;&nbsp;<input id="cmd" autocomplete="off"></div>
</div>
<script>${minifiedJS}</script>
BUTTPLUGGY_REPLACE_DATA
  </body>
</html>
`;

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

	if (!minifiedHtml) {
		minifiedHtml = await getHTML();
	}

	const renderHTML = minifiedHtml
		.replace('BUTTPLUGGY_REPLACE_DATA', `<script>boot('${fullId}')</script>`)
		.replace('BUTTPLUGGY_FULLID', fullId);

	return new Response(renderHTML, {
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
}
