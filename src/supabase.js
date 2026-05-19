import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bedgmfxcgcxgqbujalpi.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZGdtZnhjZ2N4Z3FidWphbHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTYxMDYsImV4cCI6MjA5NDc3MjEwNn0.RadxiClZB44kA335b90q91AxovjzycT0WKxdol5LurU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
