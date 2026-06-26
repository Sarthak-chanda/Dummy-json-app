import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvzlwkmdoueswvcagkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdnpsd2ttZG91ZXN3dmNhZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTkzNjgsImV4cCI6MjA5Mzk3NTM2OH0.tQQ-YKBtU6rUeOY6qk6dyQJLxkdfi20j290XCGtHxWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Querying for user ID: 51c4e39f-a101-4ba7-92be-71f65e99a70b");
  try {
    const { data: profile, error: err1 } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', '51c4e39f-a101-4ba7-92be-71f65e99a70b')
      .maybeSingle();
      
    console.log("Profile:", profile, "Error:", err1);
    
    const { data: addresses, error: err2 } = await supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', '51c4e39f-a101-4ba7-92be-71f65e99a70b');
      
    console.log("Addresses:", addresses, "Error:", err2);
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
