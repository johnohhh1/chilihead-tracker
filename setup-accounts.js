const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAccounts() {
  console.log('Setting up ChiliHead Tracker accounts...\n');
  
  const accounts = [
    {
      email: 'Johnolenski@gmail.com',
      password: 'ChiliHeadAdmin2024!',
      gm_name: 'John Olenski',
      role: 'admin',
      area: '',
      restaurant_name: '',
      description: 'Admin Account - Full state visibility'
    },
    {
      email: 'John.olenski@gmail.com',
      password: 'ChiliHeadMP2024!',
      gm_name: 'John Olenski',
      role: 'managing_partner',
      area: 'Ruddock Area',
      restaurant_name: 'Auburn Hills Chili\'s',
      description: 'Managing Partner Account - Auburn Hills Chili\'s'
    }
  ];
  
  for (const account of accounts) {
    console.log(`\n📧 Setting up: ${account.description}`);
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);
    console.log(`Role: ${account.role}`);
    console.log(`Area: ${account.area || 'N/A'}`);
    console.log(`Restaurant: ${account.restaurant_name || 'N/A'}`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            gm_name: account.gm_name,
            role: account.role,
            area: account.area,
            restaurant_name: account.restaurant_name
          }
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log('✅ User already exists');
        } else {
          console.log('❌ Error:', error.message);
        }
      } else {
        console.log('✅ Account created successfully');
        if (data.session) {
          console.log('✅ Automatically signed in');
        } else {
          console.log('📧 Check email for confirmation link');
        }
      }
    } catch (error) {
      console.log('❌ Error creating account:', error.message);
    }
  }
  
  console.log('\n🎯 Setup Complete!');
  console.log('\nNext steps:');
  console.log('1. Check your emails for confirmation links');
  console.log('2. Click the confirmation links');
  console.log('3. Sign in with the credentials above');
  console.log('4. Run the clean database schema in Supabase SQL Editor');
}

setupAccounts(); 