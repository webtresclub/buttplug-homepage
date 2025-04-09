import { error } from '@sveltejs/kit';
import data from '$lib/data.json';
import attributes from '$lib/attributes-group.json';
import slugify from 'slug';

const grouped = {};

Object.keys(attributes).forEach((trait_type) => {
	Object.keys(attributes[trait_type]).forEach((value) => {
		grouped[slugify(trait_type + '-' + value)] = attributes[trait_type][value];
	});
});

console.log(Object.keys(grouped));

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const attr = params.attr;

	if (!grouped[attr]) {
		throw error(400, 'Buttplug Not found');
	}

	return {
		ids: grouped[attr]
	};
}
