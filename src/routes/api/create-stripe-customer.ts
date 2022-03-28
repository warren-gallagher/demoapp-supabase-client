import { createCustomer, createSubscription } from '$lib/services/stripe';
import { updateProfileForUser } from '$lib/models/Profiles';
import { secret } from '$lib/services/secrets';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({request}) {
    const authorizationHeader = request.headers.get('Authorization');
    if( !authorizationHeader ) {
        console.log( `NOT AUTHORIZED - no authorization header provided`);
        return { status: 401, body: {message: 'NOT AUTHORIZED - no authorization header provided'}};
    } 
    const authChunks = authorizationHeader.split(' ');
    if( authChunks.length != 2 ) {
        console.log( `NOT AUTHORIZED - authorization header format invalid [1]`);
        return { status: 401, body: {message: 'NOT AUTHORIZED - authorization header format invalid'}};
    }
    if( authChunks[0] != "Bearer" ) {
        console.log( `NOT AUTHORIZED - authorization header format invalid [2]`);
        return { status: 401, body: {message: 'NOT AUTHORIZED - authorization header format invalid'}};
    }
    const authToken = authChunks[1];
    if( authToken != secret.demoappApiKey ) {
        console.log( `NOT AUTHORIZED - invalid API key ${authToken}.`);
        return { status: 401, body: {message: 'NOT AUTHORIZED - invalid API key'}};
    }
    const body = await request.json();
    const userId = body.record.id;
    const customer = await createCustomer(userId);
    const subscription = await createSubscription(customer.id, 'price_1KeNVkInz8AuXWx5oOxf89KG');
    const profile = await updateProfileForUser( userId, customer.id, subscription.id);

    return {status: 201, body: {message: `Created - Stripe Customer=${customer.id} for userId=${userId}`}};
}
