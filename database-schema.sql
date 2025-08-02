-- ChiliHead Tracker Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  gm_name TEXT,
  role TEXT DEFAULT 'gm' CHECK (role IN ('gm', 'gm(p)', 'admin')),
  area TEXT,
  restaurant_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Create delegations table
CREATE TABLE IF NOT EXISTS delegations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_description TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date DATE NOT NULL,
  follow_up_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')),
  chilihead_progress JSONB DEFAULT '{
    "senseOfBelonging": {"completed": false, "notes": "", "expanded": false},
    "clearDirection": {"completed": false, "notes": "", "expanded": false},
    "preparation": {"completed": false, "notes": "", "expanded": false},
    "support": {"completed": false, "notes": "", "expanded": false},
    "accountability": {"completed": false, "notes": "", "expanded": false}
  }',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_delegations_created_by ON delegations(created_by);
CREATE INDEX IF NOT EXISTS idx_delegations_assigned_to ON delegations(assigned_to);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Task completions policies
CREATE POLICY "Users can view their own task completions" ON task_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task completions" ON task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task completions" ON task_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task completions" ON task_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Delegations policies
CREATE POLICY "Users can view delegations they created" ON delegations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own delegations" ON delegations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update delegations they created" ON delegations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete delegations they created" ON delegations
  FOR DELETE USING (auth.uid() = created_by);

-- Admin policies (for admin users to view all data)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all task completions" ON task_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all delegations" ON delegations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, gm_name, role, area, restaurant_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gm_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'gm'),
    COALESCE(NEW.raw_user_meta_data->>'area', ''),
    COALESCE(NEW.raw_user_meta_data->>'restaurant_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 