import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvzlwkmdoueswvcagkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdnpsd2ttZG91ZXN3dmNhZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTkzNjgsImV4cCI6MjA5Mzk3NTM2OH0.tQQ-YKBtU6rUeOY6qk6dyQJLxkdfi20j290XCGtHxWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const runWithTimeout = async (promise, timeoutMs = 5000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Supabase request timed out")), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

async function run() {
  console.log("Starting test...");
  try {
    const query = supabase
      .from('Profiles')
      .select('*')
      .limit(1);
      
    const { data, error } = await runWithTimeout(query, 5000);
    console.log("Success data:", data, "error:", error);
  } catch (err) {
    console.error("Caught error:", err.message);
  }
}

run();
