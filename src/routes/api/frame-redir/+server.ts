import { json } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let r = await request.json();

    return redirect(302, "/mine");
}

// probably not needed
export async function GET({request}) {
    return redirect(302, "/mine");
}
