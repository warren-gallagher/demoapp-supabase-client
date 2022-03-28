import { append } from 'svelte/internal';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({request}) {
    return {
        status: 200,
        body: {
            environment: process.env.NODE_ENV, 
            nodeVersion: process.version
        }
    };
}
