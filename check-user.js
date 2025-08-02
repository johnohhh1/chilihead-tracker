const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email) {
  console.log(`Checking if user exists: ${email}`);
  
  try {
    // Try to sign in with a dummy password to see if user exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'dummy-password-to-check-if-user-exists'
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ User exists but password is wrong');
        return true;
      } else if (error.message.includes('User not found')) {
        console.log('❌ User does not exist');
        return false;
      } else {
        console.log('❓ Other error:', error.message);
        return null;
      }
    } else {
      console.log('✅ User exists and password is correct');
      return true;
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return null;
  }
}

// Check a specific email (replace with your email)
const emailToCheck = process.argv[2] || 'test@example.com';
checkUser(emailToCheck); 