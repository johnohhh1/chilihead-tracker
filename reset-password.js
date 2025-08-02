const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword(email) {
  console.log(`Sending password reset email to: ${email}`);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3002'
    });
    
    if (error) {
      console.error('❌ Error sending reset email:', error.message);
      return false;
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Check your email for the reset link.');
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node reset-password.js <email>');
  console.log('Example: node reset-password.js your-email@example.com');
  process.exit(1);
}

resetPassword(email); 