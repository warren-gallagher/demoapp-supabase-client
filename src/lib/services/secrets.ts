export const secret = {
    demoappApiKey: <string>process.env['PRIVATE_DEMOAPP_API_KEY'],
    supabasePrivateKey: <string>process.env['PRIVATE_SUPABASE_SERVICE_ROLE_KEY'],
    supabaseJWTSecret: <string>process.env['PRIVATE_SUPABASE_JWT_SECRET'],
    stripeApiKey: <string>process.env['PRIVATE_STRIPE_API_KEY']
}