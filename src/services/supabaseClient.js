import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zodfekamwsidlrjrujmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGZla2Ftd3NpZGxyanJ1am1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjY2MzksImV4cCI6MjA3MzY0MjYzOX0.DeogEyUiOMLyabVpknCrO7NJgJraUAtb6bmXDPsfMOA';

export const supabase = createClient(supabaseUrl, supabaseKey);
