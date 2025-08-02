import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Calendar, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Real Supabase client - PRODUCTION
const supabaseUrl = 'https://fhzbzzlgryvnlnewjcev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemJ6emxncnl2bmxuZXdqY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDIwNDEsImV4cCI6MjA2OTExODA0MX0.bGxcW7aXddZ2SPfJd9_YqhhRpEnkIn0BKum3kO5SAog';
const supabase = createClient(supabaseUrl, supabaseKey);

// Official Chili's Brand Colors
const colors = {
  chiliRed: 'rgb(237, 28, 36)',
  chiliRedAlt: 'rgb(232, 27, 35)',
  chiliNavy: 'rgb(34, 35, 91)',
  chiliNavyAlt: 'rgb(23, 37, 84)',
  chiliYellow: 'rgb(255, 198, 11)',
  chiliYellowAlt: 'rgb(254, 198, 13)',
  chiliGreen: 'rgb(116, 158, 51)',
  chiliGreenAlt: 'rgb(108, 192, 74)',
  chiliCream: 'rgb(248, 247, 245)',
  chiliBrown: 'rgb(60, 58, 53)',
  chiliGray: 'rgb(161, 159, 154)'
};

// ChiliHead 5-Pillar Colors
const chiliheadColors = {
  senseOfBelonging: colors.chiliYellow,
  clearDirection: colors.chiliYellowAlt,
  preparation: colors.chiliRed,
  support: colors.chiliRedAlt,
  accountability: colors.chiliNavy
};

// ChiliHead 5-Pillar Labels
const chiliheadLabels = {
  senseOfBelonging: 'SENSE OF BELONGING',
  clearDirection: 'CLEAR DIRECTION',
  preparation: 'PREPARATION',
  support: 'SUPPORT',
  accountability: 'ACCOUNTABILITY'
};

// Fiscal Calendar Functions
const getFiscalInfo = () => {
  const today = new Date('2025-08-02'); // Current date: August 2nd, 2025 (Saturday)
  
  // Calculate current fiscal week (Thursday to Wednesday)
  const getCurrentFiscalWeek = (date) => {
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    // Calculate days back to most recent Thursday
    let daysBack;
    if (dayOfWeek === 0) daysBack = 3; // Sunday: go back 3 days to Thursday
    else if (dayOfWeek === 1) daysBack = 4; // Monday: go back 4 days to Thursday
    else if (dayOfWeek === 2) daysBack = 5; // Tuesday: go back 5 days to Thursday
    else if (dayOfWeek === 3) daysBack = 6; // Wednesday: go back 6 days to Thursday
    else if (dayOfWeek === 4) daysBack = 0; // Thursday: same day
    else if (dayOfWeek === 5) daysBack = 1; // Friday: go back 1 day to Thursday
    else if (dayOfWeek === 6) daysBack = 2; // Saturday: go back 2 days to Thursday
    
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - daysBack);
    return weekStart;
  };
  
  // Since we know we're in Week 1 of P2 on Aug 2, 2025
  // P1 had 5 weeks, so this is week 6 overall
  const currentPeriod = 2;
  const currentWeekInPeriod = 1;
  
  // Period structure: P1=5wks, P2=4wks, P3=4wks, P4=5wks, P5=4wks, P6=4wks, P7=5wks, P8=4wks, P9=4wks, P10=5wks, P11=4wks, P12=4wks
  const periodWeeks = [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4];
  
  const weekStart = getCurrentFiscalWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Add 6 days to get Wednesday
  
  return {
    fiscalYear: 26,
    period: currentPeriod,
    week: currentWeekInPeriod,
    totalWeeks: periodWeeks[currentPeriod - 1],
    weekStart: weekStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
    weekEnd: weekEnd.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  };
};

const fiscalInfo = getFiscalInfo();

// Helper function to get relative dates
const getRelativeDate = (daysFromToday) => {
  const date = new Date('2025-08-02');
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};

// Task Data
const taskData = {
  daily: [
    'Walk the line during busy periods',
    'Review yesterday\'s sales vs goal',
    'Check labor vs sales targets',
    'Review guest satisfaction scores',
    'Inspect food quality and presentation',
    'Check cleanliness standards',
    'Review safety compliance',
    'Monitor team member performance',
    'Update daily communication log',
    'Review inventory levels',
    'Plan next day\'s priorities'
  ],
  weekly: [
    'Complete weekly P&L review',
    'Conduct team member coaching sessions',
    'Review and update schedules',
    'Complete food safety audit',
    'Analyze sales trends and patterns',
    'Review customer feedback and complaints',
    'Conduct inventory management review',
    'Update training plans and progress',
    'Review maintenance and repairs needed',
    'Evaluate promotional effectiveness',
    'Plan next week\'s focus areas',
    'Complete weekly team meeting',
    'Review compliance requirements',
    'Update operational procedures'
  ],
  monthly: [
    'Complete monthly business review',
    'Conduct formal performance reviews',
    'Review and update SOPs',
    'Complete comprehensive audit',
    'Analyze monthly financial performance',
    'Plan team member development',
    'Review vendor performance',
    'Update emergency procedures',
    'Complete regulatory compliance review',
    'Plan next month\'s goals',
    'Submit monthly reports'
  ]
};

// Michigan DMA Areas
const michiganAreas = [
  'Woods Area',
  'Peters Area',
  'Troy Area',
  'Southfield Area',
  'Dearborn Area',
  'Other Area'
];

// Real authentication functions
const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

// Role mapping to match database schema
const mapRoleToDb = (role) => {
  const roleMap = {
    'General Manager': 'gm',
    'Managing Partner': 'managing_partner', 
    'Director of Operations': 'director',
    'Administrator': 'admin'
  };
  return roleMap[role] || 'gm';
};

const signUpUser = async (email, password, profile) => {
  // Use proper user metadata for trigger to handle profile creation
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        gm_name: profile.name,
        role: mapRoleToDb(profile.role),
        area: profile.area,
        restaurant_name: profile.restaurant
      }
    }
  });
  
  return { data, error };
};

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

const ChiliHeadTracker = () => {
  // User management
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // App state - ALL HOOKS MUST BE DECLARED FIRST
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && session.user) {
        const { data: profileData, error: profileError } = await getProfile(session.user.id);
        
        if (!profileError && profileData) {
          setUser(session.user);
          setProfile(profileData);
          setIsLoggedIn(true);
        }
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        const { data: profileData, error: profileError } = await getProfile(session.user.id);
        
        if (!profileError && profileData) {
          setUser(session.user);
          setProfile(profileData);
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsLoggedIn(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [showSignup, setShowSignup] = useState(false);
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    area: '',
    restaurant: '',
    role: 'General Manager'
  });
  const [currentView, setCurrentView] = useState('home');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [language, setLanguage] = useState('en');
  const [selectedDelegationId, setSelectedDelegationId] = useState(null);
  const [delegationStatusFilter, setDelegationStatusFilter] = useState('all');
  const [editForm, setEditForm] = useState({
    taskDescription: '',
    assignedTo: '',
    dueDate: '',
    followUpDate: '',
    priority: 'medium',
    status: 'planning',
    chiliheadProgress: {
      senseOfBelonging: { completed: false, notes: '', expanded: false },
      clearDirection: { completed: false, notes: '', expanded: false },
      preparation: { completed: false, notes: '', expanded: false },
      support: { completed: false, notes: '', expanded: false },
      accountability: { completed: false, notes: '', expanded: false }
    }
  });
  
  // Data state
  const [taskCompletions, setTaskCompletions] = useState({});
  const [delegations, setDelegations] = useState([
    {
      id: 1,
      task_description: 'Complete inventory audit for kitchen prep station',
      assigned_to: 'Sarah (ATL)',
      due_date: getRelativeDate(3), // Due in 3 days (August 5th)
      status: 'active',
      created_at: getRelativeDate(-2), // Created 2 days ago (July 31st)
      chilihead_progress: {
        senseOfBelonging: { completed: true, notes: 'Gave Sarah ownership of entire prep inventory process' },
        clearDirection: { completed: true, notes: 'Success = 100% accuracy, completed by 2pm' },
        preparation: { completed: false, notes: '' },
        support: { completed: false, notes: '' },
        accountability: { completed: true, notes: 'Will check in at 1pm and final review at 2pm' }
      }
    },
    {
      id: 2,
      task_description: 'Train new team member on POS system',
      assigned_to: 'Mike (Server)',
      due_date: getRelativeDate(1), // Due tomorrow (August 3rd)
      status: 'planning',
      created_at: getRelativeDate(-3), // Created 3 days ago (July 30th)
      chilihead_progress: {
        senseOfBelonging: { completed: true, notes: 'Made Mike the expert trainer for new hires' },
        clearDirection: { completed: false, notes: '' },
        preparation: { completed: false, notes: '' },
        support: { completed: false, notes: '' },
        accountability: { completed: false, notes: '' }
      }
    }
  ]);
  
  // Form states
  const [delegationForm, setDelegationForm] = useState({
    taskDescription: '',
    assignedTo: '',
    dueDate: '',
    followUpDate: '',
    priority: 'medium',
    status: 'planning',
    chiliheadProgress: {
      senseOfBelonging: { completed: false, notes: '', expanded: false },
      clearDirection: { completed: false, notes: '', expanded: false },
      preparation: { completed: false, notes: '', expanded: false },
      support: { completed: false, notes: '', expanded: false },
      accountability: { completed: false, notes: '', expanded: false }
    }
  });

  // Task completion handlers
  const toggleTask = (taskIndex) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${selectedFrequency}_${today}`;
    const taskKey = `task_${taskIndex}`;
    const isCompleted = !taskCompletions[key]?.[taskKey];

    setTaskCompletions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [taskKey]: isCompleted
      }
    }));
  };

  // Delegation handlers
  const createDelegation = () => {
    if (!delegationForm.taskDescription || !delegationForm.assignedTo) {
      alert('Please fill in required fields');
      return;
    }

    const newDelegation = {
      id: Date.now(),
      task_description: delegationForm.taskDescription,
      assigned_to: delegationForm.assignedTo,
      due_date: delegationForm.dueDate || null,
      follow_up_date: delegationForm.followUpDate || null,
      priority: delegationForm.priority,
      status: delegationForm.status,
      created_at: new Date().toISOString(),
      chilihead_progress: delegationForm.chiliheadProgress
    };

    setDelegations(prev => [newDelegation, ...prev]);
    setDelegationForm({
      taskDescription: '',
      assignedTo: '',
      dueDate: '',
      followUpDate: '',
      priority: 'medium',
      status: 'planning',
      chiliheadProgress: {
        senseOfBelonging: { completed: false, notes: '', expanded: false },
        clearDirection: { completed: false, notes: '', expanded: false },
        preparation: { completed: false, notes: '', expanded: false },
        support: { completed: false, notes: '', expanded: false },
        accountability: { completed: false, notes: '', expanded: false }
      }
    });
    setCurrentView('delegation');
    alert('🌶️ Delegation created successfully!');
  };

  const navigateToDelegation = (delegationId) => {
    setSelectedDelegationId(delegationId);
    setCurrentView('editDelegation');
  };

  const navigateToStatusFilter = (status) => {
    setDelegationStatusFilter(status);
    setCurrentView('delegation');
  };

  const updateDelegation = (updatedDelegation) => {
    setDelegations(prev => prev.map(d => 
      d.id === updatedDelegation.id ? updatedDelegation : d
    ));
    setCurrentView('delegation');
    alert('🌶️ Delegation updated successfully!');
  };

  // Login Screen - must be after all hooks are declared
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.chiliCream }}>
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.chiliNavy }}>
              🌶️ ChiliHead Commitment Tracker
            </h1>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>
              Excellence Through Leadership & Accountability
            </p>
            <p className="text-sm mt-2 font-medium" style={{ color: colors.chiliRed }}>
              {showSignup ? 'Create New Account' : 'Sign In'}
            </p>
          </div>
          
          <div className="space-y-4">
            {!showSignup ? (
              // Login Form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <button
                  onClick={async () => {
                    const { data, error } = await signInUser(loginForm.email, loginForm.password);
                    
                    if (error) {
                      alert(`❌ Login failed: ${error.message}`);
                      return;
                    }
                    
                    if (data.user) {
                      // Get profile from Supabase
                      const { data: profileData, error: profileError } = await getProfile(data.user.id);
                      
                      if (profileError) {
                        alert('❌ Could not load profile data.');
                        return;
                      }
                      
                      setUser(data.user);
                      setProfile(profileData);
                      setIsLoggedIn(true);
                      alert(`🌶️ Welcome ${profileData.gm_name}!`);
                    }
                  }}
                  className="w-full py-2 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.chiliRed }}
                >
                  Login
                </button>
              </div>
            ) : (
              // Signup Form
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      placeholder="John Doe"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      placeholder="john.doe@chilis.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Area
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      value={signupForm.area}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, area: e.target.value }))}
                    >
                      <option value="">Select Area</option>
                      <option value="Woods Area">Woods Area</option>
                      <option value="Peters Area">Peters Area</option>
                      <option value="Ruddock Area">Ruddock Area</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Role
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      value={signupForm.role}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                                                 <option value="General Manager">General Manager</option>
                           <option value="Managing Partner">Managing Partner</option>
                           <option value="Director of Operations">Director of Operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    placeholder="Restaurant/Location Name"
                    value={signupForm.restaurant}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, restaurant: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      placeholder="Create password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.chiliRed }}
                      placeholder="Confirm password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    if (!signupForm.name || !signupForm.email || !signupForm.area || !signupForm.restaurant || !signupForm.password) {
                      alert('❌ Please fill in all fields');
                      return;
                    }
                    if (signupForm.password !== signupForm.confirmPassword) {
                      alert('❌ Passwords do not match');
                      return;
                    }
                    
                    // Create user in real Supabase
                    const { data, error } = await signUpUser(signupForm.email, signupForm.password, {
                      name: signupForm.name,
                      area: signupForm.area,
                      restaurant: signupForm.restaurant,
                      role: signupForm.role
                    });
                    
                    if (error) {
                      alert(`❌ Signup failed: ${error.message}`);
                      return;
                    }
                    
                    alert('🌶️ Account created successfully! Check your email to confirm, then you can login.');
                    setShowSignup(false);
                    setSignupForm({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      name: '',
                      area: '',
                      restaurant: '',
                      role: 'General Manager'
                    });
                  }}
                  className="w-full py-2 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.chiliGreen }}
                >
                  Create Account
                </button>
              </div>
            )}
            
            <div className="text-center">
              <button
                onClick={() => setShowSignup(!showSignup)}
                className="text-xs underline hover:opacity-70"
                style={{ color: colors.chiliNavy }}
              >
                {showSignup ? 'Back to Login' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Utility functions
  const getCompletionStats = (frequency) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${frequency}_${today}`;
    const tasks = taskData[frequency] || [];
    const completed = Object.values(taskCompletions[key] || {}).filter(Boolean).length;
    return { completed, total: tasks.length };
  };

  const getActiveDelegations = () => {
    return delegations.filter(d => d.status === 'active' && !d.completed);
  };

  const getOverdueDelegations = () => {
    const today = new Date();
    return delegations.filter(d => 
      d.status === 'active' && 
      !d.completed && 
      d.due_date && 
      new Date(d.due_date) < today
    );
  };



  // Home Screen
  if (currentView === 'home') {
    const dailyStats = getCompletionStats('daily');
    const activeDelegationsCount = getActiveDelegations().length;

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="text-white p-6" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">🌶️ My ChiliHead Commitment Tracker</h1>
              <p className="text-yellow-100">Welcome back, {profile?.gm_name || 'GM'}!</p>
              <p className="text-yellow-200 text-sm">{profile?.role} • {profile?.area}</p>
            </div>
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to logout?')) {
                  alert(`👋 Goodbye ${profile?.gm_name || 'User'}! Logging out...`);
                  await supabase.auth.signOut();
                  setUser(null);
                  setProfile(null);
                  setIsLoggedIn(false);
                  setLoginForm({ email: '', password: '' });
                  setCurrentView('home');
                }
              }}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
          <p className="text-center text-yellow-100 text-lg font-medium">Excellence Through Leadership & Accountability</p>
        </div>

        {/* Fiscal Info */}
        <div className="bg-white border-b-4 border-opacity-90 p-4 text-center" style={{ borderColor: colors.chiliNavy }}>
          <p className="font-bold text-lg" style={{ color: colors.chiliNavy }}>
            Fiscal Period {fiscalInfo.period} • Week {fiscalInfo.week} of {fiscalInfo.totalWeeks}
          </p>
          <p className="text-sm" style={{ color: colors.chiliBrown }}>
            Week of {fiscalInfo.weekStart} - {fiscalInfo.weekEnd}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliRed }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliRed }}>
              {Math.round((dailyStats.completed / dailyStats.total) * 100) || 0}%
            </h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Today's Progress</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliGreen }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{activeDelegationsCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Active Delegations</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliYellow }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>P{fiscalInfo.period}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Current Period</p>
          </div>
        </div>

        {/* Main Menu */}
        <div className="p-6 space-y-4">
          <button
            onClick={() => { setSelectedFrequency('daily'); setCurrentView('tasks'); }}
            className="w-full bg-white rounded-lg p-6 text-left shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <CheckSquare size={32} style={{ color: colors.chiliNavy }} className="mr-4" />
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>Daily Tasks</h3>
                <p style={{ color: colors.chiliBrown }}>Today's Tasks</p>
                <p className="text-sm font-medium" style={{ color: colors.chiliRed }}>
                  {dailyStats.completed}/{dailyStats.total} complete
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full bg-white rounded-lg p-6 text-left shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <BarChart3 size={32} style={{ color: colors.chiliNavy }} className="mr-4" />
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>GM Performance Dashboard</h3>
                <p style={{ color: colors.chiliBrown }}>Complete Overview & Reports</p>
                <p className="text-sm font-medium" style={{ color: colors.chiliRed }}>View reports</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('delegation')}
            className="w-full bg-white rounded-lg p-6 text-left shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Users size={32} style={{ color: colors.chiliNavy }} className="mr-4" />
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>ChiliHead Delegation</h3>
                <p style={{ color: colors.chiliBrown }}>Delegation Hub</p>
                <p className="text-sm font-medium" style={{ color: colors.chiliRed }}>
                  {activeDelegationsCount} active delegations
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Language Selector */}
        <div className="p-6">
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliNavy }}>
            <div className="flex items-center">
              <Settings size={20} style={{ color: colors.chiliNavy }} className="mr-3" />
              <div>
                <label className="font-medium" style={{ color: colors.chiliNavy }}>Language / Idioma</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="ml-3 px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tasks View
  if (currentView === 'tasks') {
    const tasks = taskData[selectedFrequency] || [];
    const today = new Date().toISOString().split('T')[0];
    const key = `${selectedFrequency}_${today}`;
    const stats = getCompletionStats(selectedFrequency);
    const progress = (stats.completed / stats.total) * 100;

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
                      <button onClick={() => setCurrentView('home')} className="mr-4 cursor-pointer hover:opacity-70 transition-opacity">
            <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
              {selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Tasks
            </h1>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Period {fiscalInfo.period} • Week {fiscalInfo.week}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white m-4 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: colors.chiliNavy }}>
              {stats.completed}/{stats.total} Tasks Completed
            </h2>
            <span className="text-2xl font-bold" style={{ color: colors.chiliRed }}>
              {Math.round(progress) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress || 0}%`, 
                backgroundColor: progress === 100 ? colors.chiliGreen : colors.chiliRed 
              }}
            />
          </div>
          {progress === 100 && (
            <div className="mt-4 text-center">
              <p className="text-2xl">🔥🙌🔥</p>
              <p className="text-lg font-bold" style={{ color: colors.chiliGreen }}>
                YOU CRUSHED TODAY!
              </p>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                All {selectedFrequency} operations complete - high five yourself! 🙌
              </p>
            </div>
          )}
        </div>

        {/* Frequency Selector */}
        <div className="mx-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(taskData).map(freq => (
              <button
                key={freq}
                onClick={() => setSelectedFrequency(freq)}
                className={`px-4 py-2 rounded-md font-medium cursor-pointer ${
                  selectedFrequency === freq 
                    ? 'text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
                style={selectedFrequency === freq ? { backgroundColor: colors.chiliRed } : {}}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="mx-4 mb-4 space-y-2">
          {tasks.map((task, index) => {
            const taskKey = `task_${index}`;
            const isCompleted = taskCompletions[key]?.[taskKey] || false;
            
            return (
              <div
                key={index}
                className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                  isCompleted ? 'bg-green-50' : ''
                }`}
                style={{ borderColor: isCompleted ? colors.chiliGreen : colors.chiliGray }}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleTask(index)}
                    className="mr-3 w-5 h-5 rounded"
                    style={{ accentColor: colors.chiliGreen }}
                  />
                  <span
                    className={`${isCompleted ? 'line-through' : ''}`}
                    style={{ color: isCompleted ? colors.chiliGray : colors.chiliNavy }}
                  >
                    {task}
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="p-4">
          <button
            onClick={() => {
              const completedTasks = tasks.filter((_, index) => {
                const taskKey = `task_${index}`;
                return taskCompletions[key]?.[taskKey];
              });
              const emailBody = `ChiliHead ${selectedFrequency} Task Report\n\nCompleted Tasks (${completedTasks.length}/${tasks.length}):\n\n${completedTasks.map((task, i) => `✅ ${task}`).join('\n')}\n\nGenerated by ChiliHead Commitment Tracker`;
              window.open(`mailto:?subject=ChiliHead ${selectedFrequency} Task Report&body=${encodeURIComponent(emailBody)}`);
            }}
            className="w-full py-3 px-4 rounded-md text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.chiliRed }}
          >
            📧 Submit Verification
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    const dailyStats = getCompletionStats('daily');
    const weeklyStats = getCompletionStats('weekly');
    const monthlyStats = getCompletionStats('monthly');
    const activeDelegationsCount = getActiveDelegations().length;
    const overdueDelegationsCount = getOverdueDelegations().length;

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('home')} className="mr-4 cursor-pointer hover:opacity-70 transition-opacity">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                🌶️ GM Performance Dashboard
              </h1>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                {profile?.gm_name || 'GM'} • Period {fiscalInfo.period} Week {fiscalInfo.week}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const reportContent = `🌶️ ChiliHead GM Performance Report
GM: ${profile?.gm_name || 'GM'}
Date: ${new Date().toLocaleDateString()}
Period: ${fiscalInfo.period} Week: ${fiscalInfo.week}

📋 Today's Operations:
Daily Tasks: ${dailyStats.completed}/${dailyStats.total} (${Math.round((dailyStats.completed/dailyStats.total)*100) || 0}%)

📈 Strategic Leadership Development:
Weekly Tasks: ${weeklyStats.completed}/${weeklyStats.total} (${Math.round((weeklyStats.completed/weeklyStats.total)*100) || 0}%)
Monthly Tasks: ${monthlyStats.completed}/${monthlyStats.total} (${Math.round((monthlyStats.completed/monthlyStats.total)*100) || 0}%)

👥 ChiliHead Delegation Report:
Active Delegations: ${activeDelegationsCount}
Overdue Delegations: ${overdueDelegationsCount}

Delegations:
${delegations.map(d => `• ${d.task_description} (Assigned to: ${d.assigned_to}, Status: ${d.status})`).join('\n')}`;
              
              const blob = new Blob([reportContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ChiliHead_Report_${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90"
            style={{ backgroundColor: colors.chiliRed }}
          >
            📄 Print Report
          </button>
        </div>

        {/* Today's Operations */}
        <div className="m-4">
          <div 
            className={`p-6 rounded-lg shadow-md text-white ${
              dailyStats.completed === dailyStats.total && dailyStats.total > 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-white'
            }`}
          >
            <h2 className={`text-xl font-bold mb-4 ${dailyStats.completed === dailyStats.total && dailyStats.total > 0 ? 'text-white' : ''}`} 
                style={dailyStats.completed !== dailyStats.total || dailyStats.total === 0 ? { color: colors.chiliNavy } : {}}>
              📋 Today's Operations
            </h2>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-3xl font-bold ${dailyStats.completed === dailyStats.total && dailyStats.total > 0 ? 'text-white' : ''}`}
                   style={dailyStats.completed !== dailyStats.total || dailyStats.total === 0 ? { color: colors.chiliRed } : {}}>
                  {Math.round((dailyStats.completed / dailyStats.total) * 100) || 0}%
                </p>
                <p className={`${dailyStats.completed === dailyStats.total && dailyStats.total > 0 ? 'text-green-100' : ''}`}
                   style={dailyStats.completed !== dailyStats.total || dailyStats.total === 0 ? { color: colors.chiliBrown } : {}}>
                  {dailyStats.completed}/{dailyStats.total} tasks completed
                </p>
              </div>
              {dailyStats.completed === dailyStats.total && dailyStats.total > 0 && (
                <div className="text-center">
                  <p className="text-4xl mb-2">🔥🙌🔥</p>
                  <p className="text-lg font-bold">YOU CRUSHED TODAY!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ChiliHead Delegation Report */}
        <div className="m-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                👥 ChiliHead Delegation Report
              </h2>
              <button
                onClick={() => setCurrentView('newDelegation')}
                className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90"
                style={{ backgroundColor: colors.chiliRed }}
              >
                + New Delegation
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button 
                onClick={() => navigateToStatusFilter('all')}
                className="text-center p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <p className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{delegations.length}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Total Delegations</p>
              </button>
              <button 
                onClick={() => navigateToStatusFilter('active')}
                className="text-center p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <p className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>{activeDelegationsCount}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Active Delegations</p>
              </button>
              <button 
                onClick={() => navigateToStatusFilter('overdue')}
                className="text-center p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <p className="text-2xl font-bold" style={{ color: colors.chiliRed }}>{overdueDelegationsCount}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Overdue Delegations</p>
              </button>
            </div>

            <div className="space-y-4">
              {delegations.map(delegation => {
                const progress = delegation.chilihead_progress;
                const completedSteps = Object.values(progress).filter(step => step.completed).length;
                const isOverdue = delegation.due_date && new Date(delegation.due_date) < new Date() && delegation.status === 'active';
                
                return (
                  <button
                    key={delegation.id}
                    onClick={() => navigateToDelegation(delegation.id)}
                    className={`w-full text-left p-4 rounded-lg border-l-4 hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                    style={{ borderColor: isOverdue ? colors.chiliRed : colors.chiliGreen }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium" style={{ color: colors.chiliNavy }}>
                        {delegation.task_description}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          delegation.status === 'active' ? 'bg-green-100 text-green-800' :
                          delegation.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {delegation.status}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: colors.chiliBrown }}>
                      Assigned to: {delegation.assigned_to}
                    </p>
                    {delegation.due_date && (
                      <p className={`text-sm mb-2 ${isOverdue ? 'text-red-600' : ''}`} style={!isOverdue ? { color: colors.chiliBrown } : {}}>
                        Due: {new Date(delegation.due_date).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    )}
                    <div className="flex items-center">
                      <span className="text-sm mr-2" style={{ color: colors.chiliBrown }}>
                        ChiliHead Progress:
                      </span>
                      <div className="flex space-x-1">
                        {Object.entries(chiliheadColors).map(([pillar, color]) => (
                          <div
                            key={pillar}
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{
                              backgroundColor: progress[pillar]?.completed ? color : colors.chiliGray
                            }}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm" style={{ color: colors.chiliBrown }}>
                        {completedSteps}/5
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Delegation Hub
  if (currentView === 'delegation') {
    const activeDelegationsCount = getActiveDelegations().length;
    const dueSoonCount = delegations.filter(d => {
      if (!d.due_date || d.completed) return false;
      const dueDate = new Date(d.due_date);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= new Date();
    }).length;
    const overdueCount = getOverdueDelegations().length;

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('home')} className="mr-4 cursor-pointer hover:opacity-70 transition-opacity">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
              🌶️ ChiliHead Delegation Report
            </h1>
          </div>
          <button
            onClick={() => setCurrentView('newDelegation')}
            className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: colors.chiliRed }}
          >
            + New Delegation
          </button>
        </div>

        {/* Statistics */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setDelegationStatusFilter('active')}
            className="bg-white rounded-lg p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer text-left" 
            style={{ borderColor: colors.chiliGreen }}
          >
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{activeDelegationsCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Active</p>
          </button>
          <button 
            onClick={() => setDelegationStatusFilter('due_soon')}
            className="bg-white rounded-lg p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer text-left" 
            style={{ borderColor: colors.chiliYellow }}
          >
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>{dueSoonCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Due Soon</p>
          </button>
          <button 
            onClick={() => setDelegationStatusFilter('overdue')}
            className="bg-white rounded-lg p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer text-left" 
            style={{ borderColor: colors.chiliRed }}
          >
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliRed }}>{overdueCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Overdue</p>
          </button>
        </div>

        {/* Delegation List */}
        <div className="p-4">
          <div className="space-y-4">
            {delegations.filter(delegation => {
              if (delegationStatusFilter === 'all') return true;
              if (delegationStatusFilter === 'active') return delegation.status === 'active' && !delegation.completed;
              if (delegationStatusFilter === 'overdue') {
                return delegation.due_date && new Date(delegation.due_date) < new Date() && delegation.status === 'active';
              }
              if (delegationStatusFilter === 'due_soon') {
                if (!delegation.due_date || delegation.completed) return false;
                const dueDate = new Date(delegation.due_date);
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                return dueDate <= threeDaysFromNow && dueDate >= new Date();
              }
              return delegation.status === delegationStatusFilter;
            }).map(delegation => {
              const progress = delegation.chilihead_progress;
              const completedSteps = Object.values(progress).filter(step => step.completed).length;
              const isOverdue = delegation.due_date && new Date(delegation.due_date) < new Date() && delegation.status === 'active';
              
              return (
                <button
                  key={delegation.id}
                  onClick={() => navigateToDelegation(delegation.id)}
                  className={`w-full text-left bg-white p-6 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                  style={{ borderColor: isOverdue ? colors.chiliRed : colors.chiliGreen }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2" style={{ color: colors.chiliNavy }}>
                        {delegation.task_description}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: colors.chiliBrown }}>
                        Assigned to: <span className="font-medium">{delegation.assigned_to}</span>
                      </p>
                      {delegation.due_date && (
                        <p className={`text-sm mb-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`} 
                           style={!isOverdue ? { color: colors.chiliBrown } : {}}>
                          Due: {new Date(delegation.due_date).toLocaleDateString()}
                          {isOverdue && ' (Overdue!)'}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        delegation.status === 'active' ? 'bg-green-100 text-green-800' :
                        delegation.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {delegation.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.chiliNavy }}>
                        ChiliHead Progress
                      </span>
                      <span className="text-sm" style={{ color: colors.chiliBrown }}>
                        {completedSteps}/5 completed
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {Object.entries(chiliheadColors).map(([pillar, color]) => (
                        <div
                          key={pillar}
                          className="flex-1 h-2 rounded-full"
                          style={{
                            backgroundColor: progress[pillar]?.completed ? color : colors.chiliGray
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs" style={{ color: colors.chiliBrown }}>
                    Created: {new Date(delegation.created_at).toLocaleDateString()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Initialize edit form when delegation is selected
  const initializeEditForm = (delegation) => {
    setEditForm({
      taskDescription: delegation.task_description,
      assignedTo: delegation.assigned_to,
      dueDate: delegation.due_date || '',
      followUpDate: delegation.follow_up_date || '',
      priority: delegation.priority || 'medium',
      status: delegation.status,
      chiliheadProgress: delegation.chilihead_progress
    });
  };

  // Edit Delegation Form
  if (currentView === 'editDelegation' && selectedDelegationId) {
    const delegation = delegations.find(d => d.id === selectedDelegationId);
    if (!delegation) {
      setCurrentView('delegation');
      return null;
    }

    // Initialize form if not already done
    if (editForm.taskDescription === '' || editForm.taskDescription !== delegation.task_description) {
      initializeEditForm(delegation);
    }

    const completedSteps = Object.values(editForm.chiliheadProgress).filter(step => step.completed).length;

    const saveChanges = () => {
      const updatedDelegation = {
        ...delegation,
        task_description: editForm.taskDescription,
        assigned_to: editForm.assignedTo,
        due_date: editForm.dueDate || null,
        follow_up_date: editForm.followUpDate || null,
        priority: editForm.priority,
        status: editForm.status,
        chilihead_progress: editForm.chiliheadProgress
      };
      updateDelegation(updatedDelegation);
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('delegation')} className="mr-4">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                🌶️ Edit Delegation
              </h1>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                ChiliHead Progress: {completedSteps}/5 completed
              </p>
            </div>
          </div>
          <button
            onClick={saveChanges}
            className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90"
            style={{ backgroundColor: colors.chiliGreen }}
          >
            Save Changes
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                  Task Description *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': colors.chiliRed }}
                  value={editForm.taskDescription}
                  onChange={(e) => setEditForm(prev => ({ ...prev, taskDescription: e.target.value }))}
                  placeholder="Describe the task to be delegated..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Assigned To *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="e.g. Sarah (ATL)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ChiliHead 5-Pillar Commitment */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
              🌶️ ChiliHead Commitment (5 Pillars)
            </h2>
            
            {Object.entries(chiliheadColors).map(([pillar, color]) => {
              const pillarData = editForm.chiliheadProgress[pillar];
              const pillarDescriptions = {
                senseOfBelonging: 'Make them feel valued and included',
                clearDirection: 'They know exactly what success looks like',
                preparation: 'They have everything needed to succeed',
                support: 'Ongoing help and resources available',
                accountability: 'Follow-up expectations are crystal clear'
              };
              const pillarPrompts = {
                senseOfBelonging: 'How did you give them ownership? What area of responsibility?',
                clearDirection: 'What does good look like? How will they know they succeeded?',
                preparation: 'What resources, training, or tools do they need?',
                support: 'How will you support them? Who can they ask for help?',
                accountability: 'When will you check in? How will you follow up?'
              };

              return (
                <div key={pillar} className="mb-4 border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 text-white"
                    style={{ backgroundColor: color }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{chiliheadLabels[pillar]}</h3>
                        <p className="text-sm opacity-90">{pillarDescriptions[pillar]}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {pillarData?.completed && (
                          <span className="text-2xl">✅</span>
                        )}
                        <button
                          onClick={() => {
                            const newProgress = { ...editForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              expanded: !newProgress[pillar]?.expanded
                            };
                            setEditForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm font-medium hover:bg-opacity-30"
                        >
                          {pillarData?.expanded ? 'Collapse' : 'Work On This'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {pillarData?.expanded && (
                    <div className="p-4 bg-gray-50">
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                          {pillarPrompts[pillar]}
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': color }}
                          value={pillarData?.notes || ''}
                          onChange={(e) => {
                            const newProgress = { ...editForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              notes: e.target.value
                            };
                            setEditForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          placeholder={`Enter your notes for ${chiliheadLabels[pillar].toLowerCase()}...`}
                        />
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pillarData?.completed || false}
                          onChange={(e) => {
                            const newProgress = { ...editForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              completed: e.target.checked
                            };
                            setEditForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          className="mr-2 w-5 h-5"
                          style={{ accentColor: color }}
                        />
                        <span className="font-medium" style={{ color: colors.chiliNavy }}>
                          Mark as complete
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // New Delegation Form
  if (currentView === 'newDelegation') {
    const completedSteps = Object.values(delegationForm.chiliheadProgress).filter(step => step.completed).length;

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('delegation')} className="mr-4">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                🌶️ New Delegation
              </h1>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                ChiliHead Progress: {completedSteps}/5 completed
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                  Task Description *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': colors.chiliRed }}
                  value={delegationForm.taskDescription}
                  onChange={(e) => setDelegationForm(prev => ({ ...prev, taskDescription: e.target.value }))}
                  placeholder="Describe the task to be delegated..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Assign To *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={delegationForm.assignedTo}
                    onChange={(e) => setDelegationForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Team member name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={delegationForm.priority}
                    onChange={(e) => setDelegationForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={delegationForm.dueDate}
                    onChange={(e) => setDelegationForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={delegationForm.followUpDate}
                    onChange={(e) => setDelegationForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ChiliHead 5-Pillar Commitment */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
              🌶️ ChiliHead Commitment (5 Pillars)
            </h2>
            
            {Object.entries(chiliheadColors).map(([pillar, color]) => {
              const pillarData = delegationForm.chiliheadProgress[pillar];
              const pillarLabels = {
                senseOfBelonging: 'SENSE OF BELONGING',
                clearDirection: 'CLEAR DIRECTION',
                preparation: 'PREPARATION',
                support: 'SUPPORT',
                accountability: 'ACCOUNTABILITY'
              };
              const pillarDescriptions = {
                senseOfBelonging: 'Make them feel valued and included',
                clearDirection: 'They know exactly what success looks like',
                preparation: 'They have everything needed to succeed',
                support: 'Ongoing help and resources available',
                accountability: 'Follow-up expectations are crystal clear'
              };
              const pillarPrompts = {
                senseOfBelonging: 'How did you give them ownership? What area of responsibility?',
                clearDirection: 'What does good look like? How will they know they succeeded?',
                preparation: 'What resources, training, or tools do they need?',
                support: 'How will you support them? Who can they ask for help?',
                accountability: 'When will you check in? How will you follow up?'
              };

              return (
                <div key={pillar} className="mb-4 border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 text-white"
                    style={{ backgroundColor: color }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{pillarLabels[pillar]}</h3>
                        <p className="text-sm opacity-90">{pillarDescriptions[pillar]}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {pillarData.completed && (
                          <span className="text-2xl">✅</span>
                        )}
                        <button
                          onClick={() => {
                            const newProgress = { ...delegationForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              expanded: !newProgress[pillar].expanded
                            };
                            setDelegationForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm font-medium hover:bg-opacity-30"
                        >
                          {pillarData.expanded ? 'Collapse' : 'Work On This'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {pillarData.expanded && (
                    <div className="p-4 bg-gray-50">
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.chiliNavy }}>
                          {pillarPrompts[pillar]}
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': color }}
                          value={pillarData.notes}
                          onChange={(e) => {
                            const newProgress = { ...delegationForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              notes: e.target.value
                            };
                            setDelegationForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          placeholder={`Enter your notes for ${pillarLabels[pillar].toLowerCase()}...`}
                        />
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pillarData.completed}
                          onChange={(e) => {
                            const newProgress = { ...delegationForm.chiliheadProgress };
                            newProgress[pillar] = {
                              ...newProgress[pillar],
                              completed: e.target.checked
                            };
                            setDelegationForm(prev => ({ ...prev, chiliheadProgress: newProgress }));
                          }}
                          className="mr-2 w-5 h-5"
                          style={{ accentColor: color }}
                        />
                        <span className="font-medium" style={{ color: colors.chiliNavy }}>
                          Mark as complete
                        </span>
                      </label>
                    </div>
                  )}

                  {pillarData.completed && !pillarData.expanded && pillarData.notes && (
                    <div className="p-3 bg-green-50 border-t">
                      <p className="text-sm" style={{ color: colors.chiliBrown }}>
                        <strong>Notes:</strong> {pillarData.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setDelegationForm(prev => ({ ...prev, status: 'planning' }));
                createDelegation();
              }}
              className="flex-1 py-3 px-4 rounded-md border-2 font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                borderColor: colors.chiliNavy, 
                color: colors.chiliNavy,
                backgroundColor: 'white'
              }}
            >
              💾 Save as Draft
            </button>
            <button
              onClick={() => {
                if (!delegationForm.dueDate) {
                  alert('Please set a due date to activate delegation');
                  return;
                }
                if (completedSteps === 0) {
                  alert('Please complete at least 1 ChiliHead step to activate delegation');
        return;
      }
                setDelegationForm(prev => ({ ...prev, status: 'active' }));
                createDelegation();
              }}
              disabled={!delegationForm.dueDate || completedSteps === 0}
              className="flex-1 py-3 px-4 rounded-md text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.chiliRed }}
            >
              🚀 Activate Delegation
            </button>
          </div>

          {/* Requirements Notice */}
          <div className="bg-yellow-50 border-l-4 p-4 rounded" style={{ borderColor: colors.chiliYellow }}>
            <div className="flex">
              <AlertTriangle size={20} style={{ color: colors.chiliYellow }} className="mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium" style={{ color: colors.chiliNavy }}>
                  Activation Requirements
                </h3>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>
                  To activate a delegation, you need: (1) At least 1 ChiliHead step completed, and (2) A due date set.
                  You can save as draft anytime to continue working on it later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChiliHeadTracker;