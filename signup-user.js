const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function signupUser(email, password) {
  console.log(`Signing up user: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          gm_name: 'John Olenski',
          area: 'Auburn Hills Area',
          restaurant_name: 'Chili\'s Auburn Hills',
          role: 'admin'
        }
      }
    });
    
    console.log('Sign up result:', { data, error });
    
    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('✅ User already exists. Trying to sign in...');
        
        // Try to sign in with the new password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
          console.log('💡 Try using the password reset link that was sent to your email.');
        } else {
          console.log('✅ Sign in successful!');
          console.log('User ID:', signInData.user.id);
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();
          
          if (profileError) {
            console.log('❌ Profile not found:', profileError.message);
          } else {
            console.log('✅ Profile found:', profile);
          }
        }
      } else {
        console.log('❌ Sign up failed:', error.message);
      }
    } else {
      console.log('✅ Sign up successful!');
      console.log('User ID:', data.user.id);
      
      if (data.session) {
        console.log('✅ User is automatically signed in!');
      } else {
        console.log('📧 Please check your email for confirmation link.');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get email and password from command line arguments
const email = process.argv[2] || 'johnolenski@gmail.com';
const password = process.argv[3] || 'ChiliHead2024!';

if (!email) {
  console.log('Usage: node signup-user.js <email> [password]');
  console.log('Example: node signup-user.js johnolenski@gmail.com "MyPassword123"');
  process.exit(1);
}

signupUser(email, password); 