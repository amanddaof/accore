import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://luitgrfjrwsydbufbbuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aXRncmZqcndzeWRidWZiYnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDk1OTksImV4cCI6MjA3ODEyNTU5OX0.t2PIe5YNwl6BkZ3WAcnvqFupwsvYAiu14tKyFRYFxHw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
