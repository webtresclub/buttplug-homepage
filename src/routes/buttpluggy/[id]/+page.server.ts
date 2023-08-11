import { error } from '@sveltejs/kit';
import data from '$lib/data.json';
 
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const id = parseInt(params.id || '0');
    const validId = (id > 0 && id < 1025);
    if (!validId) {
        throw error(400, 'Buttplug Not found');
    }
    
    return { buttplug: data[id]};
}
