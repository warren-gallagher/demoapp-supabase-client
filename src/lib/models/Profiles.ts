import {supabaseUserClient} from '$lib/services/supabase';
import {supabaseAdminClient} from '$lib/services/supabaseAdmin';

export type Profile = {
    id: string;
    created_at: string;
    customer_id: string;
    subscription_id: string;
};

/** 
 * @throws {Error}
 */
 export async function loadProfiles() : Promise<Profile[]> {
    const {data, error} = await supabaseAdminClient.from<Profile>('profiles').select();
    if( error ) {
        throw new Error(`loadProfiles error - ${JSON.stringify(error,null,2)}`);
    }
    return data;
}

/** 
 * @throws {Error}
 */
 export async function loadProfileForUser(userId: string) : Promise<Profile> {
    const { data, error } = await supabaseAdminClient.from("profiles").select().match({ id: userId });
    if (error) {
      console.log(`Unprocessable Entity - unable to update profile for userId=${userId}`);
      throw new Error(`loadProfileForUser(${userId}) error - ${JSON.stringify(error,null,2)}`);
    }
    return data[0];
}

/** 
 * @throws {Error}
 */
 export async function updateProfileForUser(userId: string, customerId: string, subscriptionId: string) : Promise<Profile[]> {
    const {data, error} = await supabaseAdminClient.from('profiles').update({customer_id: customerId, subscription_id: subscriptionId}).eq('id', userId);
    if (error) {
      console.log(`Unprocessable Entity - unable to update profile for userId=${userId}`);
      throw new Error(`updateProfileForUser(userId=${userId}) error - ${JSON.stringify(error,null,2)}`);
    }
    return data;
}

