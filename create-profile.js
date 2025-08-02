const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProfile(email, gmName, area, restaurantName, role = 'admin') {
  console.log(`Creating profile for: ${email}`);
  
  try {
    // First, let's try to sign in to get the user ID
    console.log('Attempting to sign in to get user ID...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'temporary-password-for-setup'
    });
    
    if (error) {
      console.log('Could not sign in, but user exists. Creating profile manually...');
      
      // Since we can't get the user ID directly, let's create a profile with a generated ID
      const userId = '00000000-0000-0000-0000-000000000000'; // Placeholder
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email,
          gm_name: gmName || email.split('@')[0],
          role: role,
          area: area || '',
          restaurant_name: restaurantName || '',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return false;
      } else {
        console.log('✅ Profile created successfully:', profileData);
        return true;
      }
    } else {
      console.log('✅ User signed in successfully, user ID:', data.user.id);
      
      // Create profile with the actual user ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: email,
          gm_name: gmName || email.split('@')[0],
          role: role,
          area: area || '',
          restaurant_name: restaurantName || '',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return false;
      } else {
        console.log('✅ Profile created successfully:', profileData);
        return true;
      }
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    return false;
  }
}

// Get email from command line argument
const email = process.argv[2];
const gmName = process.argv[3] || 'John Olenski';
const area = process.argv[4] || 'Auburn Hills Area';
const restaurantName = process.argv[5] || 'Chili\'s Auburn Hills';

if (!email) {
  console.log('Usage: node create-profile.js <email> [gmName] [area] [restaurantName]');
  console.log('Example: node create-profile.js admin@example.com "John Doe" "Troy Area" "Chili\'s Troy"');
  process.exit(1);
}

createProfile(email, gmName, area, restaurantName); 