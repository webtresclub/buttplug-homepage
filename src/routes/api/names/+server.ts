import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// @dev this will be necesary only if merkle tree is too big
 
/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let r = await request.json();
    r = (r && r.randomIds || []).slice(0, 10)
        .map(id => Number(id))
        .filter(id => id > 0 && id < 1025);

    const ret = {};
    for (const id of r) {
        const file = path.resolve(`static/data/${id}.json`);
    
        ret[id] = JSON.parse(
            fs.readFileSync(file, 'utf8')
        ).name;
    }
    

	return json(ret);
}
