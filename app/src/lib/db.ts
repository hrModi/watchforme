import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Copy .env.example to .env.local and fill in values.')
}

// Anon client — for all public read operations (rate queries, page rendering)
export const db = createClient(supabaseUrl, supabaseAnonKey)

// Service-role client — for writes that bypass Row Level Security (alert creation, cron jobs)
// Only used server-side; never exposed to the browser
export const dbAdmin = createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey, {
  auth: { persistSession: false },
})
