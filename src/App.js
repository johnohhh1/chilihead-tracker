import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Calendar, Clock, AlertTriangle, TrendingUp, Edit3, Plus, Trash2, Eye, Shield } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

// Task Data - YOUR CUSTOMIZED LISTS
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
    'Make sure Next weeks Scedule is started and on track by Monday PM',
    'Update Gust Count in Forecast for Menulink',
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
    'prepare and send you D.O. their powerpoint recap',
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

// Michigan DMA Areas - YOUR AREAS
const michiganAreas = [
  'Woods Area',
  'Peters Area',
  'Northern Area',
  'Placeholder Area',
  'Another Area',
  'Other Area'
];

const ChiliHeadTracker = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // User profile state
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // App state
  const [currentView, setCurrentView] = useState('home');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [language, setLanguage] = useState('en');
  
  // Data state
  const [taskData, setTaskData] = useState(defaultTaskData);
  const [taskCompletions, setTaskCompletions] = useState({});
  const [delegations, setDelegations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  
  // Admin state
  const [editingTasks, setEditingTasks] = useState(false);
  const [editingFrequency, setEditingFrequency] = useState('daily');
  const [newTaskText, setNewTaskText] = useState('');
  
  // Form states
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

  // Check user session on component mount
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

    // Listen for auth changes
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile
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
        // Create profile - auto-assign admin role to johnolenski@gmail.com
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
      
      // Load admin data if admin
      if (profileData?.role === 'admin' || profileData?.can_view_all) {
        await loadAdminData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Load admin data
  const loadAdminData = async () => {
    try {
      // Load all users for admin dashboard
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError) {
        setAllUsers(users || []);
      }

      // Load all task completions for overview
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select(`
          *,
          profiles!inner(gm_name, area, restaurant_name)
        `)
        .order('completion_date', { ascending: false });

      if (!completionsError) {
        setAllCompletions(completions || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Load user data
  const loadUserData = async (currentUser) => {
    try {
      // Load task completions
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

      // Load delegations
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

  // Authentication handlers
  const handleSignUp = async (e) => {
    e.preventDefault();
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

  const handleSignIn = async (e) => {
    e.preventDefault();
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

  // Task completion handlers
  const toggleTask = async (taskIndex) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${selectedFrequency}_${today}`;
    const taskKey = `task_${taskIndex}`;
    const isCompleted = !taskCompletions[key]?.[taskKey];

    // Update local state immediately
    setTaskCompletions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [taskKey]: isCompleted
      }
    }));

    // Save to Supabase
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

  // Admin task management
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

  const editTask = (frequency, index, newText) => {
    const updatedTasks = {
      ...taskData,
      [frequency]: taskData[frequency].map((task, i) => i === index ? newText : task)
    };
    
    setTaskData(updatedTasks);
  };

  // Delegation handlers
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

  const getFiscalInfo = () => ({
    period: 1,
    week: 4,
    totalWeeks: 5,
    weekStart: '7/16/2025',
    weekEnd: '7/22/2025'
  });

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
        <div className="text-white text-2xl font-bold">🌶️ Loading ChiliHead...</div>
      </div>
    );
  }

  // Show authentication screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.chiliNavy }}>🌶️ ChiliHead</h1>
            <p className="text-lg" style={{ color: colors.chiliBrown }}>Michigan DMA GM Tracker</p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': colors.chiliRed }}
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
                style={{ '--tw-ring-color': colors.chiliRed }}
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
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={authForm.gmName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, gmName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Role</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={authForm.role}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="gm">General Manager</option>
                    <option value="gm(p)">GM/Managing Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.chiliNavy }}>Area</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.chiliRed }}
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
                    style={{ '--tw-ring-color': colors.chiliRed }}
                    value={authForm.restaurantName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, restaurantName: e.target.value }))}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.chiliRed }}
            >
              🌶️ {isSignUp ? 'Join Michigan DMA ChiliHeads' : 'Sign In'}
            </button>
          </form>

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

  // Admin Dashboard
  if (currentView === 'admin' && isAdmin) {
    const todayCompletions = allCompletions.filter(c => c.completion_date === new Date().toISOString().split('T')[0]);
    const dailyCompletions = todayCompletions.filter(c => c.frequency === 'daily');
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setCurrentView('home')} className="mr-4">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                🛡️ Master Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                Michigan DMA Overview • {allUsers.length} Total GMs
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingTasks(!editingTasks)}
            className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90 flex items-center"
            style={{ backgroundColor: colors.chiliRed }}
          >
            <Edit3 size={16} className="mr-2" />
            {editingTasks ? 'Exit Edit Mode' : 'Edit Task Lists'}
          </button>
        </div>

        {/* Task List Editor */}
        {editingTasks && (
          <div className="m-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
                📝 Edit Task Lists
              </h2>
              
              {/* Frequency Selector */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(taskData).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setEditingFrequency(freq)}
                      className={`px-4 py-2 rounded-md font-medium ${
                        editingFrequency === freq 
                          ? 'text-white' 
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                      style={editingFrequency === freq ? { backgroundColor: colors.chiliRed } : {}}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)} ({taskData[freq].length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Task */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder={`Add new ${editingFrequency} task...`}
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': colors.chiliRed }}
                />
                <button
                  onClick={addTask}
                  className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90"
                  style={{ backgroundColor: colors.chiliGreen }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {taskData[editingFrequency].map((task, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm">{task}</span>
                    <button
                      onClick={() => removeTask(editingFrequency, index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GM Overview */}
        <div className="m-4">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.chiliNavy }}>
              👥 GM Performance Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{allUsers.length}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Total GMs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>
                  {allUsers.filter(u => u.role === 'gm(p)').length}
                </p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>GM/Partners</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliRed }}>
                  {dailyCompletions.length}
                </p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Active Today</p>
              </div>
            </div>

            {/* GM List */}
            <div className="space-y-3">
              {allUsers.map(gmUser => {
                const gmDailyCompletion = dailyCompletions.filter(c => c.user_id === gmUser.id);
                const completionRate = gmDailyCompletion.length > 0 ? 
                  Math.round((gmDailyCompletion.filter(c => c.completed).length / taskData.daily.length) * 100) : 0;
                
                return (
                  <div key={gmUser.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium" style={{ color: colors.chiliNavy }}>
                        {gmUser.gm_name}
                        {gmUser.role === 'admin' && ' 🛡️'}
                        {gmUser.role === 'gm(p)' && ' ⭐'}
                      </h3>
                      <p className="text-sm" style={{ color: colors.chiliBrown }}>
                        {gmUser.area} • {gmUser.restaurant_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: completionRate > 70 ? colors.chiliGreen : colors.chiliRed }}>
                        {completionRate}%
                      </p>
                      <p className="text-sm" style={{ color: colors.chiliBrown }}>Today</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  if (currentView === 'home') {
    const dailyStats = getCompletionStats('daily');
    const activeDelegationsCount = getActiveDelegations().length;
    const fiscalInfo = getFiscalInfo();

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.chiliCream }}>
        {/* Header */}
        <div className="text-white p-6" style={{ background: `linear-gradient(135deg, ${colors.chiliRed}, ${colors.chiliRedAlt}, ${colors.chiliYellow})` }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                🌶️ My ChiliHead Commitment Tracker
                {isAdmin && ' 🛡️'}
              </h1>
              <p className="text-yellow-100">
                Welcome back, {profile?.gm_name || 'GM'}!
                {isAdmin && ' (Master Admin)'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 transition-all"
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

          {/* Admin Panel Access */}
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="w-full bg-white rounded-lg p-6 text-left shadow-md hover:shadow-lg transition-shadow border-2"
              style={{ borderColor: colors.chiliYellow }}
            >
              <div className="flex items-center">
                <Shield size={32} style={{ color: colors.chiliYellow }} className="mr-4" />
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>Master Admin Panel 🛡️</h3>
                  <p style={{ color: colors.chiliBrown }}>Edit Tasks • View All GMs • Michigan DMA Overview</p>
                  <p className="text-sm font-medium" style={{ color: colors.chiliYellow }}>
                    {allUsers.length} Total GMs
                  </p>
                </div>
              </div>
            </button>
          )}
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

  // Tasks View (same as before, but using dynamic taskData)
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
          <button onClick={() => setCurrentView('home')} className="mr-4">
            <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
              {selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Tasks
            </h1>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Period 1 • Week 4</p>
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
                className={`px-4 py-2 rounded-md font-medium ${
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

  // Dashboard View (keeping your existing dashboard)
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
            <button onClick={() => setCurrentView('home')} className="mr-4">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
                🌶️ GM Performance Dashboard
              </h1>
              <p className="text-sm" style={{ color: colors.chiliBrown }}>
                {profile?.gm_name || 'GM'} • Period 1 Week 4
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const reportContent = `🌶️ ChiliHead GM Performance Report
GM: ${profile?.gm_name || 'GM'}
Date: ${new Date().toLocaleDateString()}
Period: 1 Week: 4

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
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{delegations.length}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Total Delegations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>{activeDelegationsCount}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Active Delegations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.chiliRed }}>{overdueDelegationsCount}</p>
                <p className="text-sm" style={{ color: colors.chiliBrown }}>Overdue Delegations</p>
              </div>
            </div>

            {delegations.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} style={{ color: colors.chiliGray }} className="mx-auto mb-4" />
                <p style={{ color: colors.chiliBrown }}>No delegations created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {delegations.map(delegation => {
                  const progress = delegation.chilihead_progress;
                  const completedSteps = Object.values(progress).filter(step => step.completed).length;
                  const isOverdue = delegation.due_date && new Date(delegation.due_date) < new Date() && delegation.status === 'active';
                  
                  return (
                    <div
                      key={delegation.id}
                      className={`p-4 rounded-lg border-l-4 ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Delegation Hub (keeping your existing delegation hub)
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
            <button onClick={() => setCurrentView('home')} className="mr-4">
              <ChevronLeft size={24} style={{ color: colors.chiliNavy }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: colors.chiliNavy }}>
              🌶️ ChiliHead Delegation Report
            </h1>
          </div>
          <button
            onClick={() => setCurrentView('newDelegation')}
            className="px-4 py-2 rounded-md text-white font-medium hover:opacity-90"
            style={{ backgroundColor: colors.chiliRed }}
          >
            + New Delegation
          </button>
        </div>

        {/* Statistics */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliGreen }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliGreen }}>{activeDelegationsCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Active</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliYellow }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliYellow }}>{dueSoonCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Due Soon</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colors.chiliRed }}>
            <h3 className="text-2xl font-bold" style={{ color: colors.chiliRed }}>{overdueCount}</h3>
            <p className="text-sm" style={{ color: colors.chiliBrown }}>Overdue</p>
          </div>
        </div>

        {/* Delegation List */}
        <div className="p-4">
          {delegations.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <Users size={64} style={{ color: colors.chiliGray }} className="mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2" style={{ color: colors.chiliNavy }}>
                Welcome to ChiliHead Delegation!
              </h2>
              <p className="mb-4" style={{ color: colors.chiliBrown }}>
                Use the 5-pillar ChiliHead methodology to create effective delegations.
              </p>
              <button
                onClick={() => setCurrentView('newDelegation')}
                className="px-6 py-3 rounded-md text-white font-medium hover:opacity-90"
                style={{ backgroundColor: colors.chiliRed }}
              >
                Create Your First ChiliHead Delegation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {delegations.map(delegation => {
                const progress = delegation.chilihead_progress;
                const completedSteps = Object.values(progress).filter(step => step.completed).length;
                const isOverdue = delegation.due_date && new Date(delegation.due_date) < new Date() && delegation.status === 'active';
                
                return (
                  <div
                    key={delegation.id}
                    className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${isOverdue ? 'bg-red-50' : ''}`}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // New Delegation Form (keeping your existing form)
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
              🌶️ The ChiliHead Commitment 
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
