import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, Settings, Users, BarChart3, CheckSquare, Calendar, Clock, AlertTriangle, TrendingUp, Edit3, Plus, Trash2, Eye } from 'lucide-react';

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

// Default Task Data (Admin can edit these)
const defaultTaskData = {
  daily: [
    'Walk the line during busy periods',
    "Review yesterday's sales vs goal",
    'Check labor vs sales targets',
    'Review guest satisfaction scores',
    'Inspect food quality and presentation',
    'Check cleanliness standards',
    'Review safety compliance',
    'Monitor team member performance',
    'Update daily communication log',
    'Review inventory levels',
    "Plan next day's priorities"
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
    "Plan next week's focus areas",
    'Complete weekly team meeting',
    'Review compliance requirements',
    'Update operational procedures'
  ],
  biweekly: ['Complete comprehensive operational review'],
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
    "Plan next month's goals",
    'Submit monthly reports'
  ],
  quarterly: [
    'Complete quarterly business planning',
    'Conduct comprehensive team reviews',
    'Review and update all policies',
    'Plan quarterly training initiatives',
    'Complete competitive analysis',
    "Set next quarter's objectives"
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

// Role definitions
const roleHierarchy = {
  admin: { level: 3, name: 'Area Manager', canEdit: true, canViewAll: true },
  'gm(p)': { level: 2, name: 'GM/Managing Partner', canEdit: false, canViewAll: false },
  gm: { level: 1, name: 'General Manager', canEdit: false, canViewAll: false }
};

const ChiliHeadTracker = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [language, setLanguage] = useState('en');
  const [taskData, setTaskData] = useState(defaultTaskData);
  const [taskCompletions, setTaskCompletions] = useState({});
  const [delegations, setDelegations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editingTasks, setEditingTasks] = useState(false);
  const [newTask, setNewTask] = useState('');
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
    let unsubscribe = null;

    const checkUser = async () => {
      console.log('Checking user session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error fetching session:', error.message);
        }

        if (session?.user) {
          console.log('User session found:', session.user);
          setUser(session.user);
          await loadUserProfile(session.user);
          await loadUserData(session.user);
        } else {
          console.log('No user session found');
        }
      } catch (err) {
        console.error('checkUser() failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change detected:', event);
      try {
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
      } catch (err) {
        console.error('Error during onAuthStateChange:', err);
      }
    });

    unsubscribe = () => subscription.unsubscribe();

    const timeout = setTimeout(() => {
      setLoading(false);
      console.warn('Forced loading false due to timeout');
    }, 10000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeout);
    };
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
            gm_name: currentUser.user_metadata?.gm_name || '',
            area: '',
            restaurant_name: '',
            role: role
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
      setIsAdmin(profileData.role === 'admin');
    } catch (error) {
      console.error('loadUserProfile failed:', error);
    }
  };

  const loadUserData = async (user) => {
    // Placeholder: load delegations, completions, etc.
    console.log('Loading data for:', user.email);
  };

  if (loading) {
    return <div>Loading ChiliHead…</div>;
  }

  return <div>ChiliHead Tracker Loaded</div>; // Replace with actual UI logic
};

export default ChiliHeadTracker;
