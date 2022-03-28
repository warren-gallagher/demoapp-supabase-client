import Stripe from 'stripe';
import { secret } from '$lib/services/secrets';

export const stripe = new Stripe(secret.stripeApiKey, {apiVersion: '2020-08-27',});

/**
 * @throws {Error} 
 */
export async function createCustomer(name: string, email: string = null) : Promise<Stripe.Customer> {

    const params: Stripe.CustomerCreateParams = {
    };
    if( name ) {
        params.name = name;
    }
    if( email ) {
        params.email = email;
    }
    const customer: Stripe.Customer = await stripe.customers.create(params);
    return customer;    
}

/**
 * @throws {Error} 
 */
 export async function createSubscription(customerId: string, price: string) {
    const subscriptionRequest : Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{
            price: price
        }],
        trial_period_days: 14
    };
    const subscription = await stripe.subscriptions.create(subscriptionRequest);
    return subscription;
}

/**
 * @throws {Error} 
 */
 export async function loadSubscription(subscriptionId: string) {
     const subscription = await stripe.subscriptions.retrieve(subscriptionId);
     return subscription;
 }
