import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvzlwkmdoueswvcagkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdnpsd2ttZG91ZXN3dmNhZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTkzNjgsImV4cCI6MjA5Mzk3NTM2OH0.tQQ-YKBtU6rUeOY6qk6dyQJLxkdfi20j290XCGtHxWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const email = `test_uploader_${Date.now()}@gmail.com`;
  const password = "Password123!";
  
  console.log(`Step 1: Signing up test user: ${email}...`);
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (signUpError) {
      console.error("SignUp Error:", signUpError.message);
      return;
    }
    
    const user = signUpData.user;
    if (!user) {
      console.error("No user returned from signup.");
      return;
    }
    console.log("Success! Signed up user ID:", user.id);

    console.log(`Step 2: Querying Profiles table for new user...`);
    const { data: profile, error: profileErr } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    console.log("Profiles query result:", profile, "Error:", profileErr);

    console.log(`Step 3: Attempting to upload a dummy png file to 'avatar' bucket under folder '${user.id}'...`);
    const filePath = `${user.id}/test_avatar.png`;
    const fileContent = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('avatar')
      .upload(filePath, fileContent, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadErr) {
      console.error("Upload Error:", uploadErr.message, "Full error details:", uploadErr);
    } else {
      console.log("Upload Success! File path in bucket:", uploadData.path);
      
      console.log("Step 4: Getting public URL...");
      const { data: publicUrlData } = supabase.storage
        .from('avatar')
        .getPublicUrl(filePath);
      console.log("Public URL:", publicUrlData.publicUrl);
      
      console.log("Step 5: Cleaning up (deleting the uploaded test file)...");
      const { data: deleteData, error: deleteErr } = await supabase.storage
        .from('avatar')
        .remove([filePath]);
      if (deleteErr) {
        console.error("Delete Error:", deleteErr.message);
      } else {
        console.log("Cleanup Success! Deleted:", deleteData);
      }
    }
    
  } catch (err) {
    console.error("Unhandled Exception:", err);
  }
}

run();
