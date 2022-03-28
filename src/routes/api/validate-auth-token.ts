import {verify} from 'jsonwebtoken';
import { supabaseAdminClient } from '$lib/services/supabaseAdmin';
import { secret } from '$lib/services/secrets';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({request}) {
    const data = await request.json();
    const authToken = data.authToken;
    try {
        const decodedToken = verify(authToken, secret.supabaseJWTSecret, {algorithms: ["HS256"], ignoreExpiration: false});
        const userId :string = decodedToken.sub;
        const {data, error} = await supabaseAdminClient.auth.api.getUserById(userId);
        if( error ) {
            return {
                status: 404,
                body: {message: `Not found - invalid userId "${userId}"`}
            }
        }
        return {
            status: 200,
            body: {
                decodedToken: decodedToken,
                user: data
            }
        };
    }
    catch(e) {
        console.error( `validate-auth-token Exception - ${JSON.stringify(e,null,2)}`);
        return {
            status: 401,
            body: {message: `Unauthorized - invalid authToken`}
        };
    }
}