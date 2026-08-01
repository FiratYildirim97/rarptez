import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jiaqclevxzlqcsuyyuzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYXFjbGV2eHpscWNzdXl5dXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzUwNjgsImV4cCI6MjEwMTE1MTA2OH0.TjRuIcH89zbZAgA1lmpjDGJWEQ9izvkRSPKmOO5Ecb8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
