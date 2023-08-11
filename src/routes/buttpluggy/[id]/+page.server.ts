import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

 
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const id = parseInt(params.id || '0');
    const validId = (id > 0 && id < 1025);
    if (!validId) {
        throw error(400, 'Buttplug Not found');
    }

    const file = path.resolve(`static/data/${id}.json`);
    
    return { buttplug: JSON.parse(fs.readFileSync(file, 'utf8'))};
}
