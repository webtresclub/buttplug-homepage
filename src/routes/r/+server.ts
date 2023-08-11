import { redirect, json } from '@sveltejs/kit';
import data from '$lib/data.json';


export function GET({params, request}) {
    let id = request.url.split('r?id=')[1] || '';
    id = Number(id.split('.')[0]);
    console.log(id)
    if(id > 0 && id < 1025) {
        return json(data[id]);
    }
    return json({});

	
	/*return redirect({
        status: 302,
        https://buttplug-homepage.vercel.app/data/${params.id}
    }*/
}



// https://nftstorage.link/ipfs/bafybeia7h7n6osru3b4mvivjb3h2fkonvmotobvboqw3k3v4pvyv5oyzse