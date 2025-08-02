const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database...\n');
  
  try {
    // First, let's try to sign up a new user to test the trigger
    console.log('Testing user registration...');
    const { data, error } = await supabase.auth.signUp({
      email: 'test-trigger@example.com',
      password: 'testpassword123',
      options: {
        data: {
          gm_name: 'Test User',
          area: 'Test Area',
          restaurant_name: 'Test Restaurant',
          role: 'admin'
        }
      }
    });
    
    console.log('Sign up result:', { data, error });
    
    if (data?.user) {
      console.log('✅ User created successfully');
      console.log('User ID:', data.user.id);
      
      // Check if profile was created automatically
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile not created automatically:', profileError.message);
        console.log('This means the database trigger is not working.');
      } else {
        console.log('✅ Profile created automatically:', profile);
      }
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 