import { json } from '@sveltejs/kit';
import data from '$lib/data.json';


// @dev this will be necesary only if merkle tree is too big
 
/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let r = await request.json();
    r = (r && r.randomIds || []).slice(0, 10)
        .map(id => Number(id))
        .filter(id => id > 0 && id < 1025);

    const ret = {};
    for (const id of r) {
    
        ret[id] = data[id].name;
    }
    

	return json(ret);
}
