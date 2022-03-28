import pkg from 'jsonwebtoken';
const {verify} = pkg;
import { loadProfileForUser } from '$lib/models/Profiles';
import { loadSubscription } from '$lib/services/stripe';
import { secret } from '$lib/services/secrets';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({request}) {
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
    try {
        const decodedToken = verify(authToken, secret.supabaseJWTSecret, {algorithms: ["HS256"], ignoreExpiration: false});
        const userId :string = decodedToken.sub;
        const profile = await loadProfileForUser(userId);
        const subscriptionId = profile.subscription_id.trim();
        try {
            const subscription = await loadSubscription(subscriptionId);
            return {
                status: 200,
                body: subscription
            }
        }
        catch(e) {
            console.error( `GET /subscription - loadSubscription Exception - ${JSON.stringify(e,null,2)}`);
            return {
                status: 422,
                body: {message: `Unprocessable Entity - cannot load subscriptionId=${subscriptionId} for userId=${userId}`}
            };
        }
    }
    catch(e) {
        console.error( `GET /subscription - validate-auth-token Exception - ${JSON.stringify(e,null,2)}`);
        return {
            status: 401,
            body: {message: `Unauthorized - invalid authToken`}
        };
    }
}