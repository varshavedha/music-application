// Use the CDN for Supabase JS client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project details
const supabaseUrl = 'https://ajgfjabvxkpdrkawptjz.supabase.co';
const supabaseKey = 'sb_publishable_8YqSwma3XvcQCuuch1Y3pQ_H2QqYU5Z';


// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
