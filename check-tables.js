const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking database tables...\n');
  
  try {
    // Try different table names that might exist
    const tableNames = ['profiles', 'user_profiles', 'users', 'auth.users'];
    
    for (const tableName of tableNames) {
      console.log(`\n📋 Checking table: ${tableName}`);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error accessing ${tableName}:`, error.message);
        } else {
          console.log(`✅ ${tableName} exists and is accessible`);
          if (data && data.length > 0) {
            console.log('Sample data:', data[0]);
          } else {
            console.log('Table is empty');
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName} does not exist or is not accessible`);
      }
    }

    // Check if we can query the test user we just created
    console.log('\n🔍 Checking for test user profile...');
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'test-trigger@example.com')
      .single();
    
    if (testError) {
      console.log('Test user profile error:', testError.message);
    } else if (testProfile) {
      console.log('✅ Found test user profile:', testProfile);
    } else {
      console.log('❌ Test user profile not found');
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables(); 