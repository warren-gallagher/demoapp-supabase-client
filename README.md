# DemoApp 

DemoApp is a web application that integrates with Supabase from the web client. It also integrates with stripe from the backend.

The code is written in TypeScript targeting the [SvelteKit](https://kit.svelte.dev) framework.

This version interacts with Supabase directly from the web UI. 

Some Design details can be found in the [Wiki](https://github.com/warren-gallagher/demoapp-supabase-client/wiki)

## Technology Stack

* SvelteKit - [https://kit.svelte.dev](https://kit.svelte.dev)
* SvelteStrap - [https://sveltestrap.js.org](https://sveltestrap.js.org)
* Bootstrap - [https://getbootstrap.com](https://getbootstrap.com)
* Supabase - [https://supabase.com](https://supabase.com)
* Stripe - [https://stripe.com](https://stripe.com)
* Vercel - [https://vercel.com](https://vercel.com)

## Developing

### Clone the Repository
```
git clone git@bitbucket.org:warren_gallagher/demoapp-supabase-client.git
```

### Create a .env file substituting values from your Supabase & Stripe accounts
```
VITE_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
PRIVATE_SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
PRIVATE_SUPABASE_JWT_SECRET="YOUR_PRIVATE_SUPBASE_JWT_SECRET"
PRIVATE_STRIPE_API_KEY="YOUR_PRIVATE_STRIPE_API_KEY"
PRIVATE_DEMOAPP_API_KEY="Generate-a-unique-uuid-for-this"
```

### Install developer dependencies
```
npm install
```

### Run in developer mode
```
# Runs a webserver running on http://localhost:3000 and opens that page in your default browser.
npm run dev -- --open
```

### Run in production using adpater-node for SvelteKit
```
# Install additional dependencies
npm install -g env-cmd
npm install pm2@latest
npm install pm2-logrotate

# Copies use-node-svelte.config.js as svelte.config.js
./use-node.sh

# Build
npm run build

# Run using pm2
./production.sh

# to "tail" the logs
pm2 demoapp
```
