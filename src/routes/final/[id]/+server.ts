import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
	const id = parseInt(params.id || '0');
	const validId = id > 0 && id < 1025;
	if (!validId) {
		throw error(400, 'Buttplug Not found');
	}

	const fullId = ('00000' + id).slice(-4);

	redirect(301, '/metadata/' + fullId + '.json');
}
