
import { createClient } from '@supabase/supabase-js';

// Default to env vars if available, otherwise use placeholders for demo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhkyheluznkthxqdrkgw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9UJpwx47--BCh1LC4Ef26w_BvMEfEA0';

export const supabase = createClient(supabaseUrl, supabaseKey);
