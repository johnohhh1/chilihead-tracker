const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('Checking users in database...\n');
  
  try {
    // Check profiles table
    console.log('📋 Users in profiles table:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, gm_name, role, area, restaurant_name, created_at');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.email} (${profile.gm_name}) - Role: ${profile.role}`);
          console.log(`   Area: ${profile.area || 'Not set'}`);
          console.log(`   Restaurant: ${profile.restaurant_name || 'Not set'}`);
          console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
          console.log('');
        });
      } else {
        console.log('No users found in profiles table');
      }
    }

    // Check auth.users (we can't directly query this, but we can try to get session info)
    console.log('🔐 Auth system status:');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth error:', authError);
    } else {
      console.log('Current session:', session ? 'Active' : 'None');
    }

  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers(); 