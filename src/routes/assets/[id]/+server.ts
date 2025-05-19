import { error } from '@sveltejs/kit';
import data from '$lib/data.json';
import attributes from '$lib/attributes-group.json';

import fs from 'fs';
import { cwd } from 'process';


const style = fs.readFileSync(cwd()+'/static/style-term.css', 'utf8');
const termJS = fs.readFileSync(cwd()+'/static/term.js', 'utf8');


/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {

	const id = parseInt(params.id || '0');
	const validId = id > 0 && id < 1025;
	if (!validId) {
		throw error(400, 'Buttplug Not found');
	}

    const fullId = ('00000'+id).slice(-4);


console.log(cwd())
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Pluggy Splash</title>
<style>${style}</style>
</head>
<body>
<div id="splash">
    <img id="pluggy" src="https://buttpluggy.com/images/${fullId}.gif" alt="Pluggy">
</div>
<span id="hint">*click*</span>
<div id="termWrap">
    <div id="output">
    </div>
    <div id="inputBar">&gt;&nbsp;<input id="cmd" autocomplete="off"></div>
</div>
<script>${termJS}</script>
<script>boot('${fullId}')</script>
  </body>
</html>
`;
  
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });
  }