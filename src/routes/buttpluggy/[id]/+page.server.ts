import { error } from '@sveltejs/kit';
 
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const id = parseInt(params.id || '0');
    const validId = (id > 0 && id < 1025);
    if (!validId) {
        throw error(400, 'Buttplug Not found');
    }
}