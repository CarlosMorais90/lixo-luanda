import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso no servidor (API routes)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente singleton para uso no browser
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const createSupabaseBrowser = () => {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey)
  }
  return browserClient
}