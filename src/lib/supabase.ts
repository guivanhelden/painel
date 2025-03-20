import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqnuvxpxjtkddhhpaoxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbnV2eHB4anRrZGRoaHBhb3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NjYwNjIsImV4cCI6MjA0NzA0MjA2Mn0.mtSZfPXF9FFiRS2eYap3_AAixkX6jCa0RgTnwaeZzM8';

export const supabase = createClient(supabaseUrl, supabaseKey);