import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Edit3, Plus, Trash2, Shield } from 'lucide-react';

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

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
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

  return <div>ChiliHead App Loading...</div>;
};

export default ChiliHeadTracker;
