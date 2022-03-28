import { writable } from 'svelte/store';
import type { User } from "@supabase/gotrue-js/src/lib/types";

export const user = writable <User>(null);
