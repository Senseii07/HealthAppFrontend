'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Sliders, LogOut, Plus, Edit2, Trash2, 
  Settings, Lock, User, Sparkles, Shield, Search, 
  Check, X, Activity, CheckSquare, Utensils, Calendar, 
  RefreshCw, BookOpen, AlertCircle, Sparkle, Dumbbell, Flower2
} from 'lucide-react';
import { authService } from '../../services/api';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

export default function SuperuserPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'users' | 'features' | 'meals' | 'routines'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [featuresList, setFeaturesList] = useState<any[]>([]);
  const [mealsList, setMealsList] = useState<any[]>([]);
  const [routinesList, setRoutinesList] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
    profile: {
      name: '',
      age: '',
      height: '',
      weight: '',
      fitness_level: 'Beginner',
      goals: '',
      typical_cycle_length: 28,
      typical_period_length: 5,
    }
  });
  const [userModalError, setUserModalError] = useState('');

  // Feature Edit Modal State
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [featureForm, setFeatureForm] = useState({
    name: '',
    code: '',
    description: '',
    is_enabled: true
  });
  const [featureModalError, setFeatureModalError] = useState('');

  // Meal Modal State
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealModalMode, setMealModalMode] = useState<'create' | 'edit'>('create');
  const [editingMealId, setEditingMealId] = useState<number | null>(null);
  const [mealForm, setMealForm] = useState({
    week_number: 1,
    day_of_week: 0,
    meal_type: 'Breakfast',
    name: '',
    description: '',
    recipe_link: '',
    calories: '',
    carbs_g: '',
    protein_g: '',
    fat_g: '',
    ingredients: '',
    is_pcos_friendly: true
  });
  const [mealModalError, setMealModalError] = useState('');

  // Routine Modal State
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineModalMode, setRoutineModalMode] = useState<'create' | 'edit'>('create');
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [routineForm, setRoutineForm] = useState({
    category: 'Workout',
    title: '',
    subtitle: '',
    difficulty: 'Beginner',
    duration_minutes: 15,
    description: '',
    steps: '',
    video_url: '',
    image_url: '',
    is_active: true
  });
  const [routineModalError, setRoutineModalError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('pcos_auth_token');
    const isSuper = localStorage.getItem('pcos_is_superuser');
    if (token && isSuper === 'true') {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      const [users, features, meals, routines] = await Promise.all([
        authService.superuserGetUsers(),
        authService.superuserGetFeatures(),
        authService.superuserGetMeals(),
        authService.superuserGetRoutines()
      ]);
      setUsersList(users);
      setFeaturesList(features);
      setMealsList(meals);
      setRoutinesList(routines);
    } catch (e) {
      console.error("Failed to load admin dashboard data", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await authService.superuserLogin({ username, password });
      setIsAuthenticated(true);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setLoginError(
        err.response?.data?.error || 
        'Login failed. Make sure you are using a superuser account.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('pcos_is_superuser');
    }
  };

  // User CRUD handlers
  const openCreateUserModal = () => {
    setUserModalMode('create');
    setEditingUserId(null);
    setUserModalError('');
    setUserForm({
      username: '',
      email: '',
      password: '',
      is_superuser: false,
      profile: {
        name: '',
        age: '',
        height: '',
        weight: '',
        fitness_level: 'Beginner',
        goals: '',
        typical_cycle_length: 28,
        typical_period_length: 5,
      }
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (user: any) => {
    setUserModalMode('edit');
    setEditingUserId(user.id);
    setUserModalError('');
    setUserForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      is_superuser: user.is_superuser || false,
      profile: {
        name: user.profile?.name || '',
        age: user.profile?.age || '',
        height: user.profile?.height || '',
        weight: user.profile?.weight || '',
        fitness_level: user.profile?.fitness_level || 'Beginner',
        goals: user.profile?.goals || '',
        typical_cycle_length: user.profile?.typical_cycle_length || 28,
        typical_period_length: user.profile?.typical_period_length || 5,
      }
    });
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setLoading(true);

    try {
      const payload: any = {
        username: userForm.username,
        email: userForm.email,
        is_superuser: userForm.is_superuser,
        profile: {
          name: userForm.profile.name || userForm.username,
          age: userForm.profile.age ? parseInt(userForm.profile.age.toString()) : null,
          height: userForm.profile.height ? parseFloat(userForm.profile.height.toString()) : null,
          weight: userForm.profile.weight ? parseFloat(userForm.profile.weight.toString()) : null,
          fitness_level: userForm.profile.fitness_level,
          goals: userForm.profile.goals,
          typical_cycle_length: parseInt(userForm.profile.typical_cycle_length.toString()),
          typical_period_length: parseInt(userForm.profile.typical_period_length.toString()),
        }
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (userModalMode === 'create') {
        if (!userForm.password) {
          setUserModalError('Password is required for new users.');
          setLoading(false);
          return;
        }
        await authService.superuserCreateUser(payload);
      } else if (editingUserId) {
        await authService.superuserUpdateUser(editingUserId, payload);
      }

      setShowUserModal(false);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setUserModalError(
        Object.entries(err.response?.data || {})
          .map(([key, val]: any) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ') || 'Failed to save user.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      try {
        await authService.superuserDeleteUser(id);
        fetchAdminData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete user.');
      }
    }
  };

  // Feature Toggle Handlers
  const handleToggleFeature = async (feature: any) => {
    try {
      await authService.superuserUpdateFeature(feature.id, {
        name: feature.name,
        code: feature.code,
        is_enabled: !feature.is_enabled,
        description: feature.description
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
      alert('Failed to toggle feature status.');
    }
  };

  const openEditFeatureModal = (feature: any) => {
    setEditingFeatureId(feature.id);
    setFeatureModalError('');
    setFeatureForm({
      name: feature.name,
      code: feature.code,
      description: feature.description,
      is_enabled: feature.is_enabled
    });
    setShowFeatureModal(true);
  };

  const handleFeatureFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeatureModalError('');
    setLoading(true);

    try {
      if (editingFeatureId) {
        await authService.superuserUpdateFeature(editingFeatureId, featureForm);
      }
      setShowFeatureModal(false);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setFeatureModalError('Failed to update feature.');
    } finally {
      setLoading(false);
    }
  };

  // Meal Plan CRUD Handlers
  const openCreateMealModal = () => {
    setMealModalMode('create');
    setEditingMealId(null);
    setMealModalError('');
    setMealForm({
      week_number: 1,
      day_of_week: 0,
      meal_type: 'Breakfast',
      name: '',
      description: '',
      recipe_link: '',
      calories: '',
      carbs_g: '',
      protein_g: '',
      fat_g: '',
      ingredients: '',
      is_pcos_friendly: true
    });
    setShowMealModal(true);
  };

  const openEditMealModal = (meal: any) => {
    setMealModalMode('edit');
    setEditingMealId(meal.id);
    setMealModalError('');
    setMealForm({
      week_number: meal.week_number,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name || '',
      description: meal.description || '',
      recipe_link: meal.recipe_link || '',
      calories: meal.calories || '',
      carbs_g: meal.carbs_g || '',
      protein_g: meal.protein_g || '',
      fat_g: meal.fat_g || '',
      ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : '',
      is_pcos_friendly: meal.is_pcos_friendly !== false
    });
    setShowMealModal(true);
  };

  const handleMealFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMealModalError('');
    setLoading(true);

    try {
      const parsedIngredients = mealForm.ingredients
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(Boolean);

      const payload: any = {
        week_number: parseInt(mealForm.week_number.toString()),
        day_of_week: parseInt(mealForm.day_of_week.toString()),
        meal_type: mealForm.meal_type,
        name: mealForm.name,
        description: mealForm.description,
        recipe_link: mealForm.recipe_link || null,
        calories: mealForm.calories ? parseInt(mealForm.calories.toString()) : null,
        carbs_g: mealForm.carbs_g ? parseFloat(mealForm.carbs_g.toString()) : null,
        protein_g: mealForm.protein_g ? parseFloat(mealForm.protein_g.toString()) : null,
        fat_g: mealForm.fat_g ? parseFloat(mealForm.fat_g.toString()) : null,
        ingredients: parsedIngredients,
        is_pcos_friendly: mealForm.is_pcos_friendly
      };

      if (mealModalMode === 'create') {
        await authService.superuserCreateMeal(payload);
      } else if (editingMealId) {
        await authService.superuserUpdateMeal(editingMealId, payload);
      }

      setShowMealModal(false);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setMealModalError(
        Object.entries(err.response?.data || {})
          .map(([key, val]: any) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ') || 'Failed to save meal plan.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to permanently delete meal suggestion "${name}"?`)) {
      try {
        await authService.superuserDeleteMeal(id);
        fetchAdminData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete meal plan.');
      }
    }
  };

  // Routine CRUD Handlers
  const openCreateRoutineModal = () => {
    setRoutineModalMode('create');
    setEditingRoutineId(null);
    setRoutineModalError('');
    setRoutineForm({
      category: 'Workout',
      title: '',
      subtitle: '',
      difficulty: 'Beginner',
      duration_minutes: 15,
      description: '',
      steps: '',
      video_url: '',
      image_url: '',
      is_active: true
    });
    setShowRoutineModal(true);
  };

  const openEditRoutineModal = (routine: any) => {
    setRoutineModalMode('edit');
    setEditingRoutineId(routine.id);
    setRoutineModalError('');
    setRoutineForm({
      category: routine.category,
      title: routine.title || '',
      subtitle: routine.subtitle || '',
      difficulty: routine.difficulty || 'Beginner',
      duration_minutes: routine.duration_minutes || 15,
      description: routine.description || '',
      steps: Array.isArray(routine.steps) ? routine.steps.join('\n') : '',
      video_url: routine.video_url || '',
      image_url: routine.image_url || '',
      is_active: routine.is_active !== false
    });
    setShowRoutineModal(true);
  };

  const handleRoutineFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoutineModalError('');
    setLoading(true);

    try {
      const parsedSteps = routineForm.steps
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload: any = {
        category: routineForm.category,
        title: routineForm.title,
        subtitle: routineForm.subtitle || `${routineForm.duration_minutes} mins • ${routineForm.difficulty}`,
        difficulty: routineForm.difficulty,
        duration_minutes: parseInt(routineForm.duration_minutes.toString()),
        description: routineForm.description,
        steps: parsedSteps,
        video_url: routineForm.video_url || null,
        image_url: routineForm.image_url || null,
        is_active: routineForm.is_active
      };

      if (routineModalMode === 'create') {
        await authService.superuserCreateRoutine(payload);
      } else if (editingRoutineId) {
        await authService.superuserUpdateRoutine(editingRoutineId, payload);
      }

      setShowRoutineModal(false);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setRoutineModalError(
        Object.entries(err.response?.data || {})
          .map(([key, val]: any) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ') || 'Failed to save routine.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to permanently delete routine "${title}"?`)) {
      try {
        await authService.superuserDeleteRoutine(id);
        fetchAdminData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete routine.');
      }
    }
  };

  // Searching & Filtering
  const filteredUsers = usersList.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.profile?.name && user.profile?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMeals = mealsList.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || meal.meal_type.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const filteredRoutines = routinesList.filter(routine => {
    const matchesSearch = routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || routine.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const getFeatureIcon = (code: string) => {
    switch (code) {
      case 'meals': return Utensils;
      case 'checklist': return CheckSquare;
      case 'tracker': return Calendar;
      case 'chat': return Sparkles;
      default: return Activity;
    }
  };

  const getDayName = (val: number) => {
    const found = DAYS_OF_WEEK.find(d => d.value === val);
    return found ? found.label : 'Monday';
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Syncing Admin Session...</span>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-outline-variant/30 shadow-[0_20px_40px_-10px_rgba(68,102,79,0.06)] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-primary-fixed rounded-2xl text-on-primary-fixed-variant mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="font-quicksand text-2xl font-bold text-primary tracking-tight">Super User Portal</h1>
              <p className="text-xs text-on-surface-variant/80 font-medium">
                PCOS Companion System Administrator Log In
              </p>
            </div>

            {loginError && (
              <div className="p-4 bg-error-container text-on-error-container text-xs rounded-2xl border border-error/20 leading-relaxed">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-outline tracking-wider uppercase pl-1">Admin Username</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-5 h-5 text-outline" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter administrator username"
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-2xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-outline tracking-wider uppercase pl-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-outline" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-2xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {loading ? 'Authenticating...' : 'Enter Control Panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant/30 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-quicksand text-md font-bold text-on-surface">PCOS Admin</h2>
            <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 flex flex-col justify-start">
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
              activeTab === 'users'
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                : 'text-on-surface-variant hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('meals'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
              activeTab === 'meals'
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                : 'text-on-surface-variant hover:bg-white/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Meal Plans (Foods)</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('routines'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
              activeTab === 'routines'
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                : 'text-on-surface-variant hover:bg-white/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Workout & Yoga</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('features'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
              activeTab === 'features'
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                : 'text-on-surface-variant hover:bg-white/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Feature Flags</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-outline-variant/30 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-outline hover:text-error hover:bg-error-container/20 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface">
              {activeTab === 'users' && 'User Accounts'}
              {activeTab === 'meals' && 'Meal Plans (Foods)'}
              {activeTab === 'routines' && 'Workout & Yoga Routines'}
              {activeTab === 'features' && 'Feature Flags'}
            </h1>
            <p className="text-xs text-on-surface-variant/80 font-medium">
              {activeTab === 'users' && 'Register, view, configure profiles, or delete registered wellness accounts.'}
              {activeTab === 'meals' && 'Add, update, or remove meal options, recipe URLs, and calorie calculations.'}
              {activeTab === 'routines' && 'Manage exercise, yoga and meditation routines, sequential training steps, and metadata.'}
              {activeTab === 'features' && 'Instantly toggle on/off feature modules of the PCOS companion web application.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={refreshing}
              className="p-3 bg-white border border-outline-variant/30 rounded-xl shadow-sm text-outline hover:text-primary transition-colors flex items-center justify-center animate-none"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'users' && (
              <button
                onClick={openCreateUserModal}
                className="px-5 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm flex items-center gap-2 hover:opacity-95 transition-all text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            )}

            {activeTab === 'meals' && (
              <button
                onClick={openCreateMealModal}
                className="px-5 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm flex items-center gap-2 hover:opacity-95 transition-all text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Meal Suggestion</span>
              </button>
            )}

            {activeTab === 'routines' && (
              <button
                onClick={openCreateRoutineModal}
                className="px-5 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm flex items-center gap-2 hover:opacity-95 transition-all text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Routine</span>
              </button>
            )}
          </div>
        </header>

        {/* Stats Cards Section (Wow Factor Aesthetics) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Total Users</span>
            <span className="text-2xl font-bold text-primary mt-1 flex items-center gap-2"><Users className="w-5 h-5 text-outline" /> {usersList.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Meal Suggestions</span>
            <span className="text-2xl font-bold text-primary mt-1 flex items-center gap-2"><Utensils className="w-5 h-5 text-outline" /> {mealsList.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Wellness Routines</span>
            <span className="text-2xl font-bold text-primary mt-1 flex items-center gap-2"><Activity className="w-5 h-5 text-outline" /> {routinesList.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Enabled Features</span>
            <span className="text-2xl font-bold text-primary mt-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-outline" /> 
              {featuresList.filter(f => f.is_enabled).length} / {featuresList.length}
            </span>
          </div>
        </section>

        {/* TAB: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="relative max-w-md flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search username, email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-outline-variant/30 focus:border-primary/30 focus:outline-none transition-all text-xs font-medium shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] text-outline font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">User / Profile Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">PCOS Parameters</th>
                      <th className="py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-outline font-semibold">
                          No users found matching the query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-background/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-on-surface">{user.username}</div>
                            {user.profile?.name && (
                              <div className="text-[10px] text-outline mt-0.5 capitalize">{user.profile.name}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-mono">
                            {user.email || <span className="text-[10px] text-outline italic">No email</span>}
                          </td>
                          <td className="py-4 px-6">
                            {user.is_superuser ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[9px] uppercase tracking-wider border border-secondary-container/60">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-[9px] uppercase tracking-wider border border-primary-fixed/20">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant leading-relaxed">
                            {user.profile ? (
                              <div className="space-y-0.5">
                                <div>Age: <span className="font-semibold text-on-surface">{user.profile.age || '—'}</span> | Fit: <span className="font-semibold text-on-surface">{user.profile.fitness_level || '—'}</span></div>
                                <div>Cycle: <span className="font-semibold text-on-surface">{user.profile.typical_cycle_length}d</span> (Period: <span className="font-semibold text-on-surface">{user.profile.typical_period_length}d</span>)</div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-outline italic">Profile not initialized</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditUserModal(user)}
                                className="p-2 text-outline hover:text-primary hover:bg-primary-fixed/30 rounded-lg transition-all"
                                title="Edit User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEALS PLAN (FOODS) CRUD */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full max-w-md flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-outline-variant/30 focus:border-primary/30 focus:outline-none transition-all text-xs font-medium shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline font-bold uppercase">Filter:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:border-primary/30 shadow-sm"
                >
                  <option value="all">All Meal Types</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] text-outline font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Week / Day / Type</th>
                      <th className="py-4 px-6">Meal Name</th>
                      <th className="py-4 px-6">Nutritional Details</th>
                      <th className="py-4 px-6">PCOS Status</th>
                      <th className="py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-xs">
                    {filteredMeals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-outline font-semibold">
                          No meal plans registered in database.
                        </td>
                      </tr>
                    ) : (
                      filteredMeals.map((meal) => (
                        <tr key={meal.id} className="hover:bg-background/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-on-surface">Week {meal.week_number}</div>
                            <div className="text-[10px] text-outline mt-0.5">{getDayName(meal.day_of_week)} • <span className="capitalize font-bold text-secondary">{meal.meal_type}</span></div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-on-surface">{meal.name}</div>
                            {meal.description && (
                              <div className="text-[10px] text-outline mt-0.5 max-w-xs truncate">{meal.description}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-medium">
                            <div className="space-y-0.5">
                              <div>Cals: <span className="font-bold text-on-surface">{meal.calories || '—'} kcal</span></div>
                              <div className="text-[10px] text-outline">Carbs: {meal.carbs_g || '0'}g | Prot: {meal.protein_g || '0'}g | Fat: {meal.fat_g || '0'}g</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {meal.is_pcos_friendly ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-[9px] uppercase tracking-wider border border-primary-fixed/20">
                                <Check className="w-3 h-3" /> PCOS Friendly
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold text-[9px] uppercase tracking-wider border border-error/20">
                                <X className="w-3 h-3" /> Standard
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditMealModal(meal)}
                                className="p-2 text-outline hover:text-primary hover:bg-primary-fixed/30 rounded-lg transition-all"
                                title="Edit Meal"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeal(meal.id, meal.name)}
                                className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                                title="Delete Meal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: WORKOUT & YOGA CRUD */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full max-w-md flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Search routines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-outline-variant/30 focus:border-primary/30 focus:outline-none transition-all text-xs font-medium shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline font-bold uppercase">Filter:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:border-primary/30 shadow-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="workout">Workout</option>
                  <option value="yoga">Yoga</option>
                  <option value="meditation">Meditation</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] text-outline font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Category / Info</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Difficulty / Duration</th>
                      <th className="py-4 px-6">Steps Count</th>
                      <th className="py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-xs">
                    {filteredRoutines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-outline font-semibold">
                          No wellness routines configured.
                        </td>
                      </tr>
                    ) : (
                      filteredRoutines.map((routine) => (
                        <tr key={routine.id} className="hover:bg-background/40 transition-colors">
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border ${
                              routine.category === 'Workout' 
                                ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary-fixed/20'
                                : routine.category === 'Yoga'
                                  ? 'bg-secondary-container text-on-secondary-container border-secondary-container/50'
                                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed/30'
                            }`}>
                              {routine.category === 'Workout' && <Dumbbell className="w-3 h-3" />}
                              {routine.category === 'Yoga' && <Flower2 className="w-3 h-3" />}
                              {routine.category === 'Meditation' && <Sparkle className="w-3 h-3" />}
                              {routine.category}
                            </span>
                            {!routine.is_active && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-outline-variant/30 text-outline text-[9px] font-bold uppercase tracking-wider border border-outline-variant/50">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-on-surface">
                            {routine.title}
                            {routine.subtitle && (
                              <div className="text-[10px] text-outline font-medium mt-0.5">{routine.subtitle}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-on-surface-variant">
                            {routine.duration_minutes} mins • <span className="font-bold text-on-surface">{routine.difficulty}</span>
                          </td>
                          <td className="py-4 px-6 font-mono text-outline font-semibold">
                            {Array.isArray(routine.steps) ? routine.steps.length : 0} steps
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditRoutineModal(routine)}
                                className="p-2 text-outline hover:text-primary hover:bg-primary-fixed/30 rounded-lg transition-all"
                                title="Edit Routine"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoutine(routine.id, routine.title)}
                                className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                                title="Delete Routine"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FEATURE TOGGLES */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuresList.map((feature) => {
              const Icon = getFeatureIcon(feature.code);
              return (
                <div 
                  key={feature.id}
                  className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex items-start gap-4 hover:border-primary-fixed/40 transition-all duration-200"
                >
                  <div className={`p-3.5 rounded-xl ${feature.is_enabled ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-low text-outline'} flex-shrink-0 transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-quicksand text-sm font-bold text-on-surface flex items-center gap-2">
                          {feature.name}
                          <span className="text-[9px] font-mono bg-surface-container-low text-outline-variant/90 border border-outline-variant/30 px-1.5 py-0.5 rounded uppercase">{feature.code}</span>
                        </h3>
                      </div>
                      
                      {/* Modern Toggle Switch */}
                      <button
                        onClick={() => handleToggleFeature(feature)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          feature.is_enabled ? 'bg-primary' : 'bg-outline-variant/60'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            feature.is_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      {feature.description || 'No description provided.'}
                    </p>
                    
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openEditFeatureModal(feature)}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configure Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* USER CREATE / EDIT MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-none">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 p-6 md:p-8">
            <header className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="font-quicksand text-xl font-bold text-on-surface">
                {userModalMode === 'create' ? 'Create New User Account' : 'Edit User Profile Settings'}
              </h2>
              <button 
                onClick={() => setShowUserModal(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-xl text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {userModalError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 leading-relaxed font-semibold">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleUserFormSubmit} className="space-y-6">
              
              {/* SECTION: Account Settings */}
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-1.5 mb-4">Account Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm((prev: any) => ({ ...prev, username: e.target.value }))}
                      placeholder="username"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Email Address</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((prev: any) => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">
                      {userModalMode === 'create' ? 'Password *' : 'Change Password (leave blank if unchanged)'}
                    </label>
                    <input
                      type="password"
                      required={userModalMode === 'create'}
                      value={userForm.password}
                      onChange={(e) => setUserForm((prev: any) => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  
                  {/* Superuser Flag */}
                  <div className="flex items-center gap-2 pl-1 pt-6">
                    <input
                      type="checkbox"
                      id="is_superuser"
                      checked={userForm.is_superuser}
                      onChange={(e) => setUserForm((prev: any) => ({ ...prev, is_superuser: e.target.checked }))}
                      className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <label htmlFor="is_superuser" className="text-xs font-bold text-outline cursor-pointer select-none">
                      Grants Superuser Privileges
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION: PCOS & Wellness Profile */}
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-1.5 mb-4">PCOS / Wellness Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Full Name</label>
                    <input
                      type="text"
                      value={userForm.profile.name}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, name: e.target.value }
                      }))}
                      placeholder="Name logged on Home Screen"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Age</label>
                    <input
                      type="number"
                      value={userForm.profile.age}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, age: e.target.value }
                      }))}
                      placeholder="Years"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={userForm.profile.height}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, height: e.target.value }
                      }))}
                      placeholder="e.g. 165.5"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={userForm.profile.weight}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, weight: e.target.value }
                      }))}
                      placeholder="e.g. 62.3"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Fitness Level</label>
                    <select
                      value={userForm.profile.fitness_level}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, fitness_level: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-semibold text-on-surface"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Typical Cycle Length (days)</label>
                    <input
                      type="number"
                      required
                      value={userForm.profile.typical_cycle_length}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, typical_cycle_length: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Typical Period Length (days)</label>
                    <input
                      type="number"
                      required
                      value={userForm.profile.typical_period_length}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, typical_period_length: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Goals & Notes</label>
                    <textarea
                      rows={3}
                      value={userForm.profile.goals}
                      onChange={(e) => setUserForm((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, goals: e.target.value }
                      }))}
                      placeholder="e.g. Lose weight, regulate cycle, manage insulin resistance..."
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-primary/10"
                >
                  {loading ? 'Saving...' : 'Save User Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEATURE EDIT MODAL */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-outline-variant/30 p-6">
            <header className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-5">
              <h2 className="font-quicksand text-lg font-bold text-on-surface">Configure Feature Flag</h2>
              <button 
                onClick={() => setShowFeatureModal(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-xl text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {featureModalError && (
              <div className="mb-4 p-4 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 leading-relaxed font-semibold">
                {featureModalError}
              </div>
            )}

            <form onSubmit={handleFeatureFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-outline uppercase pl-1">Feature Name</label>
                <input
                  type="text"
                  required
                  value={featureForm.name}
                  onChange={(e) => setFeatureForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-outline uppercase pl-1">System Code Key (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={featureForm.code}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent text-xs font-mono opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-outline uppercase pl-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFeatureModal(false)}
                  className="px-6 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-primary/10"
                >
                  {loading ? 'Updating...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEAL CREATE / EDIT MODAL */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 p-6 md:p-8 animate-none">
            <header className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="font-quicksand text-xl font-bold text-on-surface">
                {mealModalMode === 'create' ? 'Add Meal Suggestion' : 'Edit Meal Configuration'}
              </h2>
              <button 
                onClick={() => setShowMealModal(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-xl text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {mealModalError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 leading-relaxed font-semibold">
                {mealModalError}
              </div>
            )}

            <form onSubmit={handleMealFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Rotation Week *</label>
                  <input
                    type="number"
                    required
                    value={mealForm.week_number}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, week_number: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Day of Week *</label>
                  <select
                    value={mealForm.day_of_week}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, day_of_week: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-semibold text-on-surface"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Meal Slot *</label>
                  <select
                    value={mealForm.meal_type}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, meal_type: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-semibold text-on-surface"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Meal Title *</label>
                  <input
                    type="text"
                    required
                    value={mealForm.name}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Avocado Toast with Poached Egg"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Description</label>
                  <textarea
                    rows={2}
                    value={mealForm.description}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide description of the dish..."
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Recipe Link (Optional URL)</label>
                  <input
                    type="url"
                    value={mealForm.recipe_link}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, recipe_link: e.target.value }))}
                    placeholder="https://example.com/recipe"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={mealForm.calories}
                      onChange={(e) => setMealForm((prev: any) => ({ ...prev, calories: e.target.value }))}
                      placeholder="kcal"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={mealForm.carbs_g}
                      onChange={(e) => setMealForm((prev: any) => ({ ...prev, carbs_g: e.target.value }))}
                      placeholder="grams"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={mealForm.protein_g}
                      onChange={(e) => setMealForm((prev: any) => ({ ...prev, protein_g: e.target.value }))}
                      placeholder="grams"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Fats (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={mealForm.fat_g}
                      onChange={(e) => setMealForm((prev: any) => ({ ...prev, fat_g: e.target.value }))}
                      placeholder="grams"
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Ingredients (Separated by commas)</label>
                  <textarea
                    rows={2}
                    value={mealForm.ingredients}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="e.g. Avocado, Whole wheat toast, Egg, Salt, Black Pepper"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pl-1 pt-2">
                  <input
                    type="checkbox"
                    id="is_pcos_friendly"
                    checked={mealForm.is_pcos_friendly}
                    onChange={(e) => setMealForm((prev: any) => ({ ...prev, is_pcos_friendly: e.target.checked }))}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_pcos_friendly" className="text-xs font-bold text-outline cursor-pointer select-none">
                    Mark as PCOS Friendly & Low-GI
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30 justify-end">
                <button
                  type="button"
                  onClick={() => setShowMealModal(false)}
                  className="px-6 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-primary/10"
                >
                  {loading ? 'Saving...' : 'Save Meal Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROUTINE CREATE / EDIT MODAL */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 p-6 md:p-8 animate-none">
            <header className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="font-quicksand text-xl font-bold text-on-surface">
                {routineModalMode === 'create' ? 'Create New Wellness Routine' : 'Edit Routine Configuration'}
              </h2>
              <button 
                onClick={() => setShowRoutineModal(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-xl text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {routineModalError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 leading-relaxed font-semibold">
                {routineModalError}
              </div>
            )}

            <form onSubmit={handleRoutineFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Category *</label>
                  <select
                    value={routineForm.category}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-semibold text-on-surface"
                  >
                    <option value="Workout">Workout</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Meditation">Meditation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Difficulty Level *</label>
                  <select
                    value={routineForm.difficulty}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-semibold text-on-surface"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    value={routineForm.duration_minutes}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, duration_minutes: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Routine Title *</label>
                  <input
                    type="text"
                    required
                    value={routineForm.title}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Strength Training, Balancing Flow"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={routineForm.subtitle}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. 15 mins • Beginner Level"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Overview Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={routineForm.description}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description outlining focus, instructions or muscle targets..."
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase pl-1">Training Steps (one per line) *</label>
                  <textarea
                    rows={4}
                    required
                    value={routineForm.steps}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, steps: e.target.value }))}
                    placeholder="Step 1: Warm up for 5 mins&#10;Step 2: Squats 3 sets of 10 reps&#10;Step 3: Lunges 3 sets of 8 reps"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium font-mono leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Video Resource Link</label>
                    <input
                      type="url"
                      value={routineForm.video_url}
                      onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Image Thumbnail Link</label>
                    <input
                      type="url"
                      value={routineForm.image_url}
                      onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-1 pt-2">
                  <input
                    type="checkbox"
                    id="routine_active"
                    checked={routineForm.is_active}
                    onChange={(e) => setRoutineForm((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <label htmlFor="routine_active" className="text-xs font-bold text-outline cursor-pointer select-none">
                    Mark Routine as Active and Visible
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRoutineModal(false)}
                  className="px-6 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-primary/10"
                >
                  {loading ? 'Saving...' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
