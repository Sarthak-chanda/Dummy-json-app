import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ypvzlwkmdoueswvcagkq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdnpsd2ttZG91ZXN3dmNhZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTkzNjgsImV4cCI6MjA5Mzk3NTM2OH0.tQQ-YKBtU6rUeOY6qk6dyQJLxkdfi20j290XCGtHxWE'


export const supabase = createClient(supabaseUrl, supabaseAnonKey)