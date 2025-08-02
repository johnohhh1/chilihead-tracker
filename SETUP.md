# ChiliHead Tracker Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## 1. Environment Variables

The app is already configured with Supabase credentials in `.env.local`. Make sure you have:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 2. Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project (the one with URL: `https://fhzbzzlgryvnlnewjcev.supabase.co`)

### Step 2: Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema.sql`
3. Paste and run the SQL script

This will create:
- `profiles` table for user profiles
- `task_completions` table for tracking completed tasks
- `delegations` table for delegation management
- Row Level Security policies
- Automatic profile creation on user signup

### Step 3: Configure Authentication
1. Go to **Authentication > Settings** in your Supabase dashboard
2. Make sure **Email confirmations** are enabled
3. Set your site URL to `http://localhost:3000` for development

## 3. Run the Application

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 4. First User Setup

1. Open the app in your browser
2. Click "Sign Up" to create your first account
3. Fill in your details:
   - Email
   - Password
   - GM Name
   - Area
   - Restaurant Name
   - Role (select "Area Manager" for admin access)

## 5. Admin Access

To get admin privileges, either:
- Sign up with email `johnolenski@gmail.com` (automatically gets admin role)
- Or manually update your role in the Supabase dashboard:
  1. Go to **Table Editor > profiles**
  2. Find your user record
  3. Change `role` from `gm` to `admin`

## 6. Features

### For All Users:
- **Tasks**: View and complete daily/weekly/monthly tasks
- **Delegations**: Create and manage task delegations
- **ChiliHead Progress**: Track progress on the 5 pillars

### For Admins:
- **Task Management**: Add/remove tasks for different frequencies
- **User Management**: View all users in the system
- **Full Access**: View all delegations and completions

## Troubleshooting

### App stuck on loading screen:
- Check browser console for errors
- Verify environment variables are loaded
- Ensure database tables are created

### Authentication errors:
- Check Supabase project settings
- Verify email confirmation is enabled
- Check Row Level Security policies

### Database errors:
- Run the SQL schema again
- Check table permissions
- Verify trigger functions are created

## Development

The app uses:
- React 18
- Supabase for backend
- Lucide React for icons
- Inline styles for theming

To modify tasks, edit the `defaultTaskData` object in `src/App.js`. 