import { error } from '@sveltejs/kit';
import data from '$lib/data.json';
import attributes from '$lib/attributes-group.json';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const id = parseInt(params.id || '0');
	const validId = id > 0 && id < 1025;
	if (!validId) {
		throw error(400, 'Buttplug Not found');
	}

	const grouped = {};
	data[id].attributes.forEach((e) => {
		grouped[e.trait_type + '-' + e.value] = attributes[e.trait_type][e.value].length;
	});
	return {
		buttplug: data[id],
		grouped
	};
}
