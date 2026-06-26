import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvzlwkmdoueswvcagkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdnpsd2ttZG91ZXN3dmNhZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTkzNjgsImV4cCI6MjA5Mzk3NTM2OH0.tQQ-YKBtU6rUeOY6qk6dyQJLxkdfi20j290XCGtHxWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";
  
  console.log(`Signing up test user: ${email}...`);
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (signUpError) {
      console.error("SignUp Error:", signUpError);
      return;
    }
    
    const user = signUpData.user;
    console.log("Logged in user ID:", user.id);
    
    console.log("Querying Profiles table as authenticated user...");
    const { data: profiles, error: profileError } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', user.id);
      
    console.log("Profiles result:", profiles, "Error:", profileError);
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
