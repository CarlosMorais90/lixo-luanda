import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso no servidor (API routes)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente para uso no browser (componentes)
export const createSupabaseBrowser = () =>
  createBrowserClient(supabaseUrl, supabaseKey)