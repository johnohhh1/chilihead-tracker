const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test profiles table
    console.log('\n1. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('Profiles table accessible, count:', profiles?.length || 0);
    }

    // Test task_completions table
    console.log('\n2. Testing task_completions table...');
    const { data: completions, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .limit(1);
    
    if (completionsError) {
      console.error('Task completions table error:', completionsError);
    } else {
      console.log('Task completions table accessible, count:', completions?.length || 0);
    }

    // Test delegations table
    console.log('\n3. Testing delegations table...');
    const { data: delegations, error: delegationsError } = await supabase
      .from('delegations')
      .select('*')
      .limit(1);
    
    if (delegationsError) {
      console.error('Delegations table error:', delegationsError);
    } else {
      console.log('Delegations table accessible, count:', delegations?.length || 0);
    }

    // Test auth
    console.log('\n4. Testing auth...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth error:', authError);
    } else {
      console.log('Auth working, session:', session ? 'exists' : 'none');
    }

  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 