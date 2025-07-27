import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
<<<<<<< HEAD
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Edit3, Plus, Trash2, Shield } from 'lucide-react';
=======
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Edit3, Plus, Trash2, Shield, Calendar, Clock, AlertTriangle, Target, TrendingUp, Award } from 'lucide-react';

>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
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
const chiliheadColors = {
  senseOfBelonging: 'rgb(255, 235, 59)',
  clearDirection: 'rgb(255, 152, 0)',
  preparation: 'rgb(255, 87, 34)',
  support: 'rgb(244, 67, 54)',
  accountability: 'rgb(63, 81, 181)'
};
const defaultTaskData = {
  daily: [
    'Walk the line during busy periods',
    'Review yesterday\'s sales vs goal',
    'Check labor vs sales targets',
    'Review guest satisfaction scores',
    'Inspect food quality and presentation',
    'Check cleanliness SAFE standards',
    'Review safety compliance',
    'Monitor team member performance',
    'Update daily communication log',
    'Write an Chilihead Recognition each day',
    'Review Prep levels',
    'Plan next day\'s priorities'
  ],
  weekly: [
    'Complete weekly P&L review',
    'Review and update Forecast in Hotscedules',
    'Post TM Schedule Monday',
    'Make sure Next weeks Schedule is started and on track by Monday PM',
    'Update Guest Count in Forecast for Menulink',
    'Conduct team member coaching sessions',
    'Review and update schedules',
    'Complete food safety audit',
    'Analyze sales trends and patterns',
    'Review Guest feedback and complaints',
    'Conduct inventory management review',
    'Update training plans and progress',
    'Review maintenance and repairs needed',
    'Evaluate promotional effectiveness',
    'Plan next week\'s focus areas',
    'Complete weekly team meeting',
    'Review compliance requirements',
    'Update operational procedures'
  ],
  biweekly: [
    'Complete comprehensive operational review'
  ],
  monthly: [
    'Complete monthly business review',
    'Prepare and send your D.O. their powerpoint recap',
    'Conduct Monthly Check-ins',
    'Review and update AORs',
    'Complete comprehensive audit',
    'Analyze monthly financial performance',
    'Plan team member development',
    'Review vendor performance',
    'Update emergency procedures',
    'Complete regulatory compliance review',
    'Plan next month\'s goals',
    'Submit monthly reports'
  ],
  quarterly: [
    'Complete quarterly business planning',
    'Conduct comprehensive team reviews',
    'Review and update all policies',
    'Plan quarterly training initiatives',
    'Complete competitive analysis',
    'Set next quarter\'s objectives'
  ]
};
const michiganAreas = [
  'Woods Area',
  'Peters Area',
  'Northern Area',
  'Placeholder Area',
  'Another Area',
  'Other Area'
];
const ChiliHeadTracker = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDO, setIsDO] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [language, setLanguage] = useState('en');
  const [taskData, setTaskData] = useState(defaultTaskData);
  const [taskCompletions, setTaskCompletions] = useState({});
  const [delegations, setDelegations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  const [editingTasks, setEditingTasks] = useState(false);
  const [editingFrequency, setEditingFrequency] = useState('daily');
  const [newTaskText, setNewTaskText] = useState('');
  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    gmName: '',
    area: '',
    restaurantName: '',
    role: 'gm'
  });
  
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
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user);
        await loadUserData(session.user);
      }
      setLoading(false);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user);
        await loadUserData(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setTaskCompletions({});
        setDelegations([]);
        setIsAdmin(false);
        setIsDO(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const loadUserProfile = async (currentUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }
      let profileData = data;
      
      if (!data) {
        const role = currentUser.email === 'johnolenski@gmail.com' ? 'admin' : 'gm';
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: currentUser.id,
            email: currentUser.email,
            gm_name: currentUser.user_metadata?.gm_name || (currentUser.email === 'johnolenski@gmail.com' ? 'John Olenski' : ''),
            area: currentUser.user_metadata?.area || (currentUser.email === 'johnolenski@gmail.com' ? 'All Areas' : ''),
            restaurant_name: currentUser.user_metadata?.restaurant_name || (currentUser.email === 'johnolenski@gmail.com' ? 'Michigan DMA' : ''),
            role: role,
            can_view_all: currentUser.email === 'johnolenski@gmail.com'
          }])
          .select()
          .single();
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        profileData = newProfile;
      }
      setProfile(profileData);
      setIsAdmin(profileData?.role === 'admin' || profileData?.can_view_all);
      setIsDO(profileData?.role === 'do');
      
      if (profileData?.role === 'admin' || profileData?.can_view_all) {
        await loadAdminData();
      } else if (profileData?.role === 'do') {
        await loadDOData(profileData.area);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const loadDOData = async (area) => {
    try {
      const { data: areaUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('area', area)
        .order('created_at', { ascending: false });
      if (!usersError) {
        setAllUsers(areaUsers || []);
      }
      const areaUserIds = areaUsers?.map(u => u.id) || [];
      if (areaUserIds.length > 0) {
        const { data: completions, error: completionsError } = await supabase
          .from('task_completions')
          .select(`*`)
          .in('user_id', areaUserIds)
          .order('completion_date', { ascending: false });
        if (!completionsError) {
          setAllCompletions(completions || []);
        }
      }
    } catch (error) {
      console.error('Error loading DO data:', error);
    }
  };
  const loadAdminData = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!usersError) {
        setAllUsers(users || []);
      }
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .order('completion_date', { ascending: false });
      if (!completionsError) {
        setAllCompletions(completions || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };
  const loadUserData = async (currentUser) => {
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', currentUser.id);
      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
      } else {
        const formattedTasks = {};
        tasks?.forEach(task => {
          const key = `${task.frequency}_${task.completion_date}`;
          if (!formattedTasks[key]) formattedTasks[key] = {};
          formattedTasks[key][task.task_key] = task.completed;
        });
        setTaskCompletions(formattedTasks);
      }
      const { data: delegationData, error: delegationsError } = await supabase
        .from('delegations')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (delegationsError) {
        console.error('Error loading delegations:', delegationsError);
      } else {
        setDelegations(delegationData || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
<<<<<<< HEAD
  const handleSignUp = async (e) => {
    e.preventDefault();
=======

  const handleSignUp = async () => {
>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            gm_name: authForm.gmName,
            area: authForm.area,
            restaurant_name: authForm.restaurantName,
            role: authForm.role
          }
        }
      });
      if (error) throw error;
      alert('🌶️ Account created successfully! You can now sign in.');
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
  };
<<<<<<< HEAD
  const handleSignIn = async (e) => {
    e.preventDefault();
=======

  const handleSignIn = async () => {
>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password
      });
      if (error) throw error;
    } catch (error) {
      alert('Error signing in: ' + error.message);
    }
  };
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };
  const toggleTask = async (taskIndex) => {
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
    try {
      const { error } = await supabase
        .from('task_completions')
        .upsert({
          user_id: user.id,
          frequency: selectedFrequency,
          task_key: taskKey,
          completion_date: today,
          completed: isCompleted
        });
      if (error) throw error;
    } catch (error) {
      console.error('Error saving task completion:', error);
      alert('Error saving task completion. Please try again.');
    }
  };
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const updatedTasks = {
      ...taskData,
      [editingFrequency]: [...taskData[editingFrequency], newTaskText.trim()]
    };
    
    setTaskData(updatedTasks);
    setNewTaskText('');
    alert('✅ Task added successfully!');
  };
  const removeTask = (frequency, index) => {
    const updatedTasks = {
      ...taskData,
      [frequency]: taskData[frequency].filter((_, i) => i !== index)
    };
    
    setTaskData(updatedTasks);
    alert('🗑️ Task removed successfully!');
  };
  const createDelegation = async () => {
    if (!user || !delegationForm.taskDescription || !delegationForm.assignedTo) {
      alert('Please fill in required fields');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('delegations')
        .insert([{
          user_id: user.id,
          task_description: delegationForm.taskDescription,
          assigned_to: delegationForm.assignedTo,
          due_date: delegationForm.dueDate || null,
          follow_up_date: delegationForm.followUpDate || null,
          priority: delegationForm.priority,
          status: delegationForm.status,
          chilihead_progress: delegationForm.chiliheadProgress
        }])
        .select()
        .single();
      if (error) throw error;
      setDelegations(prev => [data, ...prev]);
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
    } catch (error) {
      console.error('Error creating delegation:', error);
      alert('Error creating delegation. Please try again.');
    }
  };
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
  const getFiscalInfo = () => ({
    period: 1,
    week: 4,
    totalWeeks: 5,
    weekStart: '7/16/2025',
    weekEnd: '7/22/2025'
  });
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
        <div className="text-white text-2xl font-bold">🌶️ Loading ChiliHead...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.chiliNavy }}>🌶️ ChiliHead</h1>
            <p className="text-lg" style={{ color: colors.chiliBrown }}>Michigan DMA GM Tracker</p>
          </div>
<<<<<<< HEAD
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
=======

          <div className="space-y-4">
>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>GM Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    value={authForm.gmName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, gmName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Role</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    value={authForm.role}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="gm">General Manager</option>
                    <option value="gm(p)">GM/Managing Partner</option>
                    <option value="do">Director of Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Area</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    value={authForm.area}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, area: e.target.value }))}
                  >
                    <option value="">Select Area</option>
                    {michiganAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Restaurant Name/Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    value={authForm.restaurantName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, restaurantName: e.target.value }))}
                  />
                </div>
              </>
            )}
            <button
              onClick={isSignUp ? handleSignUp : handleSignIn}
              className="w-full py-3 px-4 rounded-md text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.chiliRed }}
            >
              🌶️ {isSignUp ? 'Join Michigan DMA ChiliHeads' : 'Sign In'}
            </button>
<<<<<<< HEAD
          </form>
=======
          </div>

>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm hover:underline"
              style={{ color: colors.chiliNavy }}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }
<<<<<<< HEAD
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
      <header className="shadow-lg" style={{ backgroundColor: colors.chiliNavy }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🌶️ ChiliHead Tracker</h1>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {profile?.gm_name || user?.email}</span>
              <button onClick={handleSignOut} className="text-white hover:opacity-75">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>
            🌶️ Welcome to ChiliHead Tracker!
          </h2>
          <p>You're successfully logged in as <strong>{profile?.gm_name || user?.email}</strong></p>
          <p className="mt-2">Restaurant: <strong>{profile?.restaurant_name}</strong></p>
          <p className="mt-2">Area: <strong>{profile?.area}</strong></p>
          <p className="mt-4 text-gray-600">Full interface coming soon...</p>
        </div>
      </main>
    </div>
  );
=======

  // Main App Interface - THIS IS WHAT WAS MISSING!
  const renderMainInterface = () => {
    const fiscalInfo = getFiscalInfo();
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <header className="shadow-lg" style={{ backgroundColor: colors.chiliNavy }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">🌶️ ChiliHead Tracker</h1>
                <div className="text-sm text-white opacity-75">
                  {profile?.restaurant_name} | {profile?.area}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-white text-right">
                  <div>Period {fiscalInfo.period} | Week {fiscalInfo.week}/{fiscalInfo.totalWeeks}</div>
                  <div className="opacity-75">{fiscalInfo.weekStart} - {fiscalInfo.weekEnd}</div>
                </div>
                <div className="text-white font-medium">{profile?.gm_name}</div>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:opacity-75 transition-opacity"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="shadow-sm" style={{ backgroundColor: colors.chiliRed }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'home', label: 'Dashboard', icon: BarChart3 },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'delegation', label: 'Delegations', icon: Users },
                ...(isAdmin || isDO ? [{ id: 'analytics', label: 'Analytics', icon: TrendingUp }] : []),
                ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className={`flex items-center space-x-2 py-4 px-2 text-white font-medium border-b-2 transition-colors ${
                    currentView === id ? 'border-white' : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'home' && renderDashboard()}
          {currentView === 'tasks' && renderTasksView()}
          {currentView === 'delegation' && renderDelegationView()}
          {currentView === 'analytics' && (isAdmin || isDO) && renderAnalyticsView()}
          {currentView === 'admin' && isAdmin && renderAdminView()}
        </main>
      </div>
    );
  };

  const renderDashboard = () => {
    const dailyStats = getCompletionStats('daily');
    const weeklyStats = getCompletionStats('weekly');
    const activeDelegations = getActiveDelegations();
    const overdueDelegations = getOverdueDelegations();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.chiliNavy }}>Daily Tasks</h3>
              <CheckSquare style={{ color: colors.chiliGreen }} size={24} />
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: colors.chiliRed }}>
              {dailyStats.completed}/{dailyStats.total}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: colors.chiliGreen,
                  width: `${dailyStats.total > 0 ? (dailyStats.completed / dailyStats.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Weekly Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.chiliNavy }}>Weekly Tasks</h3>
              <Calendar style={{ color: colors.chiliYellow }} size={24} />
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: colors.chiliRed }}>
              {weeklyStats.completed}/{weeklyStats.total}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: colors.chiliYellow,
                  width: `${weeklyStats.total > 0 ? (weeklyStats.completed / weeklyStats.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Active Delegations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.chiliNavy }}>Active Delegations</h3>
              <Users style={{ color: colors.chiliNavy }} size={24} />
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: colors.chiliRed }}>
              {activeDelegations.length}
            </div>
            <div className="text-sm" style={{ color: colors.chiliGray }}>
              Currently tracking
            </div>
          </div>

          {/* Overdue Items */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.chiliNavy }}>Overdue</h3>
              <AlertTriangle style={{ color: colors.chiliRed }} size={24} />
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: colors.chiliRed }}>
              {overdueDelegations.length}
            </div>
            <div className="text-sm" style={{ color: colors.chiliGray }}>
              Need attention
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('tasks')}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
              style={{ borderColor: colors.chiliGreen }}
            >
              <CheckSquare style={{ color: colors.chiliGreen }} size={24} />
              <div className="text-left">
                <div className="font-semibold" style={{ color: colors.chiliNavy }}>Complete Tasks</div>
                <div className="text-sm" style={{ color: colors.chiliGray }}>Mark today's tasks complete</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('delegation')}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
              style={{ borderColor: colors.chiliYellow }}
            >
              <Plus style={{ color: colors.chiliYellow }} size={24} />
              <div className="text-left">
                <div className="font-semibold" style={{ color: colors.chiliNavy }}>New Delegation</div>
                <div className="text-sm" style={{ color: colors.chiliGray }}>Delegate a new task</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('delegation')}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
              style={{ borderColor: colors.chiliNavy }}
            >
              <Users style={{ color: colors.chiliNavy }} size={24} />
              <div className="text-left">
                <div className="font-semibold" style={{ color: colors.chiliNavy }}>Review Delegations</div>
                <div className="text-sm" style={{ color: colors.chiliGray }}>Check progress on delegations</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTasksView = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentTasks = taskData[selectedFrequency] || [];
    const key = `${selectedFrequency}_${today}`;
    const completions = taskCompletions[key] || {};

    return (
      <div className="space-y-6">
        {/* Frequency Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(defaultTaskData).map(frequency => {
              const stats = getCompletionStats(frequency);
              return (
                <button
                  key={frequency}
                  onClick={() => setSelectedFrequency(frequency)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFrequency === frequency
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedFrequency === frequency ? colors.chiliRed : 'transparent'
                  }}
                >
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)} ({stats.completed}/{stats.total})
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold" style={{ color: colors.chiliNavy }}>
              {selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Tasks
            </h3>
            {isAdmin && (
              <button
                onClick={() => setEditingTasks(!editingTasks)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: colors.chiliYellow }}
              >
                <Edit3 size={18} />
                <span>{editingTasks ? 'Done Editing' : 'Edit Tasks'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {currentTasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  completions[`task_${index}`]
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleTask(index)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    completions[`task_${index}`]
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {completions[`task_${index}`] && '✓'}
                </button>
                
                <span
                  className={`flex-1 ${
                    completions[`task_${index}`] ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {task}
                </span>

                {editingTasks && isAdmin && (
                  <button
                    onClick={() => removeTask(selectedFrequency, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {editingTasks && isAdmin && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <button
                  onClick={addTask}
                  className="px-4 py-2 text-white rounded-lg"
                  style={{ backgroundColor: colors.chiliGreen }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDelegationView = () => {
    return (
      <div className="space-y-6">
        {/* Create New Delegation */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>Create New Delegation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Task Description</label>
              <textarea
                value={delegationForm.taskDescription}
                onChange={(e) => setDelegationForm(prev => ({ ...prev, taskDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                rows={3}
                placeholder="Describe the task to be delegated..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Assigned To</label>
              <input
                type="text"
                value={delegationForm.assignedTo}
                onChange={(e) => setDelegationForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                placeholder="Team member name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Due Date</label>
              <input
                type="date"
                value={delegationForm.dueDate}
                onChange={(e) => setDelegationForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Priority</label>
              <select
                value={delegationForm.priority}
                onChange={(e) => setDelegationForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <button
            onClick={createDelegation}
            className="px-6 py-3 text-white font-semibold rounded-lg"
            style={{ backgroundColor: colors.chiliRed }}
          >
            🌶️ Create Delegation
          </button>
        </div>

        {/* Existing Delegations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>Your Delegations</h3>
          
          {delegations.length === 0 ? (
            <div className="text-center py-8" style={{ color: colors.chiliGray }}>
              <Users size={48} className="mx-auto mb-4" />
              <p>No delegations created yet. Create your first delegation above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {delegations.map(delegation => (
                <div key={delegation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold" style={{ color: colors.chiliNavy }}>
                      {delegation.task_description}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        delegation.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : delegation.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {delegation.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm mb-2" style={{ color: colors.chiliGray }}>
                    Assigned to: <strong>{delegation.assigned_to}</strong>
                    {delegation.due_date && (
                      <span className="ml-4">
                        Due: <strong>{new Date(delegation.due_date).toLocaleDateString()}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: colors.chiliGray }}>
                    Status: <strong className="capitalize">{delegation.status}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>
            {isDO ? 'Area Analytics' : 'System Analytics'}
          </h3>
          <div className="text-center py-8" style={{ color: colors.chiliGray }}>
            <BarChart3 size={48} className="mx-auto mb-4" />
            <p>Analytics dashboard coming soon...</p>
            <p className="mt-2">Track team performance and completion rates</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.chiliNavy }}>Admin Dashboard</h3>
          <div className="text-center py-8" style={{ color: colors.chiliGray }}>
            <Shield size={48} className="mx-auto mb-4" />
            <p>Admin controls coming soon...</p>
            <p className="mt-2">Manage users, tasks, and system settings</p>
          </div>
        </div>
      </div>
    );
  };

  return renderMainInterface();
>>>>>>> 933351bacc9277881b262968a0aff87b61503df8
};
export default ChiliHeadTracker;
