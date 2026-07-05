'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Droplets, Smile, Pill, Dumbbell, Calendar, 
  Flower2, Plus, ArrowRight, Settings, Moon, User, Heart, ChevronRight 
} from 'lucide-react';
import { wellnessService, authService } from '../services/api';

interface DashboardProps {
  data: any;
  profile: any;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
  onProfileUpdate: () => void;
}

export default function Dashboard({ data, profile, onRefresh, setActiveTab, onProfileUpdate }: DashboardProps) {
  const [updating, setUpdating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Settings Form State
  const [name, setName] = useState(profile?.profile?.name || '');
  const [age, setAge] = useState(profile?.profile?.age || '');
  const [height, setHeight] = useState(profile?.profile?.height || '');
  const [weight, setWeight] = useState(profile?.profile?.weight || '');
  const [fitnessLevel, setFitnessLevel] = useState(profile?.profile?.fitness_level || 'Beginner');
  const [goals, setGoals] = useState(profile?.profile?.goals || '');
  const [cycleLength, setCycleLength] = useState(profile?.profile?.typical_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState(profile?.profile?.typical_period_length || 5);
  
  const habits = data?.habits || {};
  const cycle = data?.cycle || {};
  const meals = data?.meals || [];
  const quote = data?.quote || {};
  const suggestedRoutine = data?.suggested_routine || {};

  // Calculate completion percentage
  // We track 5 goals: Water intake, Sleep logged, Exercise, Yoga, Meditation
  const waterGoal = habits.water_goal_ml || 2000;
  const waterIntake = habits.water_intake_ml || 0;
  const isWaterDone = waterIntake >= waterGoal;
  
  const goalsList = [
    isWaterDone,
    habits.sleep_hours !== null && habits.sleep_hours > 0,
    habits.exercise_completed,
    habits.yoga_completed,
    habits.meditation_completed
  ];
  
  const completedGoalsCount = goalsList.filter(Boolean).length;
  const completionPercentage = Math.round((completedGoalsCount / goalsList.length) * 100);

  // SVG Progress Circle Calculations
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;
  const getWeeklyCalendar = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekDays = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayDiff + i);
      const isToday = date.toDateString() === today.toDateString();
      weekDays.push({
        label: dayLabels[i],
        dateNum: date.getDate(),
        isToday,
      });
    }
    return weekDays;
  };
  const weekDays = getWeeklyCalendar();

  const handleQuickWaterLog = async () => {
    if (updating || !habits.id) return;
    setUpdating(true);
    try {
      await wellnessService.updateHabitLog(habits.id, {
        water_intake_ml: (habits.water_intake_ml || 0) + 250
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickToggleHabit = async (field: string, currentVal: boolean) => {
    if (updating || !habits.id) return;
    setUpdating(true);
    try {
      const updateData: any = {};
      updateData[field] = !currentVal;
      await wellnessService.updateHabitLog(habits.id, updateData);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await authService.updateProfile({
        email: profile.email,
        profile: {
          name,
          age: age ? parseInt(age.toString()) : null,
          height: height ? parseFloat(height.toString()) : null,
          weight: weight ? parseFloat(weight.toString()) : null,
          fitness_level: fitnessLevel,
          goals,
          typical_cycle_length: parseInt(cycleLength.toString()),
          typical_period_length: parseInt(periodLength.toString())
        }
      });
      setShowSettingsModal(false);
      onProfileUpdate();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  // Determine current cycle status description
  const getCycleStatusText = () => {
    if (cycle.in_period) {
      return `Menstrual Phase (Day ${cycle.period_day})`;
    }
    if (cycle.days_until_next !== null) {
      if (cycle.days_until_next <= 7) return `Late Luteal Phase (PMS)`;
      if (cycle.days_until_next <= 14) return `Mid Luteal Phase`;
      return `Follicular/Ovulatory Phase`;
    }
    return 'Track your period to see cycle phase';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h2 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface">
            Hello, {profile?.profile?.name || profile?.username || 'Maya'}
          </h2>
          <p className="text-sm text-on-surface-variant/80 font-medium">
            Your wellness journey is on track today. 💖
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-3.5 bg-white border border-outline-variant/30 rounded-2xl shadow-sm hover:bg-surface-container-low transition-colors text-outline hover:text-primary"
            title="Profile & Cycle Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('checklist')}
            className="px-6 py-3.5 bg-primary text-on-primary font-bold rounded-2xl shadow-md shadow-primary/20 active:scale-95 duration-200 text-xs uppercase tracking-wider"
          >
            Log Activity
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Wellness Hero Card (Sage Green / Cream) */}
        <section className="lg:col-span-8 bg-white rounded-[2rem] p-8 md:p-10 bento-card border border-primary-fixed/20 shadow-sm overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-fixed/30 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-center justify-between">
            <div className="space-y-5 text-center sm:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-[10px] uppercase tracking-widest">
                {getCycleStatusText()}
              </span>
              <div className="space-y-1">
                <h3 className="metric-display text-primary font-quicksand">{completionPercentage}%</h3>
                <p className="text-lg font-bold text-on-surface-variant">Daily Habits Checked</p>
              </div>
              <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                {completionPercentage === 100 
                  ? "Incredible work! You've checked off all your wellness tasks for today."
                  : completionPercentage >= 50
                    ? "Great momentum! Staying hydrated and completed routines help regulate blood sugar."
                    : "Nourish your body today. Take a quick stretch, drink a glass of water, and relax."}
              </p>
              <div className="flex gap-3 justify-center sm:justify-start pt-2">
                <button 
                  onClick={() => setActiveTab('checklist')} 
                  className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
                >
                  View Habits
                </button>
                <button 
                  onClick={() => setActiveTab('chat')} 
                  className="px-6 py-3 bg-surface-container-low text-primary rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                >
                  Ask Assistant
                </button>
              </div>
            </div>
            
            {/* SVG Circle Progress */}
            <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle 
                  className="text-surface-container-low" 
                  cx="96" 
                  cy="96" 
                  fill="transparent" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth={strokeWidth}
                />
                <circle 
                  className="text-primary transition-all duration-700" 
                  cx="96" 
                  cy="96" 
                  fill="transparent" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                  strokeWidth={strokeWidth}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flower2 className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Log Action Grid (Right Column) */}
        <section className="lg:col-span-4 grid grid-cols-2 gap-4">
          {/* Log Water */}
          <div 
            onClick={handleQuickWaterLog}
            className="bg-primary-fixed/30 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 bento-card border border-primary-fixed/20 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
              <Droplets className="w-6 h-6 fill-primary/10" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-on-surface">Log Water</span>
              <span className="block text-[10px] text-outline">{waterIntake}ml / {waterGoal}ml</span>
            </div>
          </div>

          {/* Log Exercise */}
          <div 
            onClick={() => handleQuickToggleHabit('exercise_completed', habits.exercise_completed)}
            className={`p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 bento-card border cursor-pointer ${
              habits.exercise_completed 
                ? 'bg-secondary-container/50 border-secondary-container' 
                : 'bg-white border-outline-variant/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              habits.exercise_completed ? 'bg-secondary text-white' : 'bg-surface-container-low text-secondary'
            }`}>
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-on-surface">Exercise</span>
              <span className="block text-[10px] text-outline">{habits.exercise_completed ? 'Completed!' : 'Tap to log'}</span>
            </div>
          </div>

          {/* Log Yoga */}
          <div 
            onClick={() => handleQuickToggleHabit('yoga_completed', habits.yoga_completed)}
            className={`p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 bento-card border cursor-pointer ${
              habits.yoga_completed 
                ? 'bg-primary-fixed/40 border-primary-fixed/30' 
                : 'bg-white border-outline-variant/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              habits.yoga_completed ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-primary'
            }`}>
              <Flower2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-on-surface">Yoga Session</span>
              <span className="block text-[10px] text-outline">{habits.yoga_completed ? 'Done' : 'Tap to log'}</span>
            </div>
          </div>

          {/* Log Meditation */}
          <div 
            onClick={() => handleQuickToggleHabit('meditation_completed', habits.meditation_completed)}
            className={`p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 bento-card border cursor-pointer ${
              habits.meditation_completed 
                ? 'bg-tertiary-fixed/40 border-tertiary-fixed/30' 
                : 'bg-white border-outline-variant/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              habits.meditation_completed ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-low text-tertiary'
            }`}>
              <Moon className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-on-surface">Meditation</span>
              <span className="block text-[10px] text-outline">{habits.meditation_completed ? 'Relaxed' : 'Tap to log'}</span>
            </div>
          </div>
        </section>

        {/* Cycle Tracker Panel (Lavender Bento) */}
        <section className="lg:col-span-6 bg-secondary-fixed/20 rounded-[2rem] p-8 md:p-10 bento-card border border-secondary-fixed-dim/20 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-quicksand text-xl font-bold">Cycle Calendar</h3>
            </div>
            <button onClick={() => setActiveTab('tracker')} className="text-secondary font-bold text-xs uppercase tracking-wider hover:underline">
              View history
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="space-y-3.5 text-left flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold text-secondary/70 uppercase tracking-[0.2em] mb-1">
                  Estimated start
                </p>
                <h4 className="font-quicksand text-4xl font-bold text-on-secondary-container">
                  {cycle.in_period 
                    ? `Period Day ${cycle.period_day}`
                    : cycle.days_until_next !== null
                      ? `${cycle.days_until_next} Days`
                      : 'N/A'}
                </h4>
                <p className="font-quicksand text-headline-sm text-headline-sm text-secondary font-bold">
                  {cycle.in_period ? 'Active Flow' : 'Left'}
                </p>
              </div>
              
              <p className="text-xs text-on-secondary-container/80 font-medium bg-white/40 px-4 py-2 rounded-xl inline-block">
                Day {cycle.in_period ? cycle.period_day : (28 - (cycle.days_until_next || 5))} of 28
              </p>

              <div className="flex gap-1.5 pt-1">
                {[...Array(5)].map((_, i) => {
                  const isPassed = cycle.in_period ? i === 0 : i < 3;
                  return (
                    <div 
                      key={i} 
                      className={`w-10 h-3 rounded-full ${
                        isPassed ? 'bg-secondary shadow-sm shadow-secondary/10' : 'bg-white/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Dynamic 7-day Weekly Grid */}
            <div className="flex-grow w-full grid grid-cols-7 gap-2 select-none md:pl-4">
              {weekDays.map((wd, i) => {
                let borderClass = 'bg-white/60 text-secondary';
                if (wd.isToday) {
                  borderClass = 'bg-secondary text-white font-bold shadow-lg shadow-secondary/30 scale-110';
                } else if (cycle.in_period) {
                  const flowDayIdx = cycle.period_day - 1;
                  const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const diff = i - currentDayIdx;
                  if (diff >= -flowDayIdx && diff < (5 - flowDayIdx)) {
                    borderClass = 'bg-secondary-container/80 text-on-secondary-container font-bold border border-secondary/20';
                  }
                }
                
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-secondary/60">{wd.label}</span>
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center transition-all text-xs font-bold ${borderClass}`}>
                      {wd.dateNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Nutrition Panel (Sage Green Bento) */}
        <section className="lg:col-span-3 bg-primary-fixed/20 rounded-[2rem] p-6 bento-card border border-primary-fixed/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-quicksand text-sm font-bold">Nutrition</h3>
            </div>
            <button onClick={() => setActiveTab('meals')} className="text-primary font-bold text-xs uppercase tracking-wider hover:underline">
              Plan
            </button>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {meals.slice(0, 2).map((meal: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/80 rounded-2xl border border-primary-fixed/20 shadow-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">{meal.meal_type}</span>
                  <span className="text-xs font-bold text-on-surface truncate block">{meal.name}</span>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-xs font-bold text-primary block">{meal.calories || 'N/A'}</span>
                  <span className="text-[8px] text-outline uppercase tracking-wider block">kcal</span>
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="text-center py-6 text-xs text-outline font-medium">
                No meals loaded.
              </div>
            )}
            
            {/* Plan Dinner Dashed Shortcut */}
            <button 
              onClick={() => setActiveTab('meals')}
              className="w-full py-3 mt-2 rounded-2xl border border-dashed border-primary/20 text-primary font-bold hover:bg-white/40 transition-colors flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider bg-transparent"
            >
              <Plus className="w-4 h-4" /> Plan Dinner
            </button>
          </div>
        </section>

        {/* Sleep Tracker Panel (Indigo/Navy Bento) */}
        <section className="lg:col-span-3 bg-secondary/10 rounded-[2rem] p-6 bento-card border border-secondary/25 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary">
                <Moon className="w-4.5 h-4.5 fill-secondary/15" />
              </div>
              <h3 className="font-quicksand text-sm font-bold text-secondary">Sleep Tracker</h3>
            </div>
            {habits.sleep_hours !== null && (
              <span className="text-[9px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-lg">
                {habits.sleep_hours}h logged
              </span>
            )}
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div>
              <span className="text-3xl font-bold font-quicksand text-on-surface block">
                {habits.sleep_hours !== null ? `${habits.sleep_hours} hrs` : 'No logs'}
              </span>
              <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">
                Daily Target: 8.0 hrs
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden border border-outline-variant/35 relative">
              <div 
                className="h-full bg-secondary transition-all duration-300 shadow-inner animate-pulse"
                style={{ width: `${Math.min(100, ((habits.sleep_hours || 0) / 8) * 100)}%` }}
              />
            </div>

            {/* Quick Log Inline Form */}
            <div className="flex gap-2 items-center">
              <input 
                type="number" 
                step="0.1"
                placeholder="Hrs"
                id="dashboard-sleep-input"
                className="w-16 px-2 py-2 bg-white border border-outline-variant/30 rounded-xl text-xs text-center font-bold text-on-surface focus:outline-none"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    if (!isNaN(val) && val > 0 && habits.id) {
                      await wellnessService.updateHabitLog(habits.id, { sleep_hours: val });
                      (e.target as HTMLInputElement).value = '';
                      onRefresh();
                    }
                  }
                }}
              />
              <button 
                onClick={async () => {
                  const el = document.getElementById('dashboard-sleep-input') as HTMLInputElement;
                  const val = parseFloat(el.value);
                  if (!isNaN(val) && val > 0 && habits.id) {
                    await wellnessService.updateHabitLog(habits.id, { sleep_hours: val });
                    el.value = '';
                    onRefresh();
                  }
                }}
                className="flex-1 py-2 bg-secondary text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors"
              >
                Log
              </button>
            </div>
          </div>
        </section>

        {/* Featured AI Insight Card with circular sleep progression */}
        <section className="lg:col-span-12 bg-tertiary-fixed/30 rounded-[2.5rem] p-8 md:p-10 bento-card border border-tertiary-fixed-dim/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="w-24 h-24 text-tertiary" />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center gap-3 text-tertiary">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 fill-tertiary/10" />
                </div>
                <span className="font-bold uppercase tracking-[0.2em] text-xs">Featured AI Insight</span>
              </div>
              <h4 className="font-quicksand text-3xl font-bold text-on-tertiary-container leading-tight">
                Optimizing Sleep for Insulin Sensitivity
              </h4>
              <p className="text-sm text-on-tertiary-fixed-variant leading-relaxed opacity-90 max-w-2xl font-medium">
                Maya, based on your logs, your energy levels correlate directly with your sleep habits. Getting 7 to 9 hours of quality restful sleep can significantly improve insulin sensitivity, a key factor in managing PCOS symptoms and stabilizing your hormones. Try winding down tonight with box breathing!
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-tertiary text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-tertiary/20 hover:opacity-95 transition-all"
                >
                  Explore full wellness guide <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Circular Sleep progress widget */}
            <div className="hidden md:flex justify-center flex-shrink-0">
              <div className="w-44 h-44 rounded-full border-[10px] border-white/50 flex items-center justify-center relative shadow-inner bg-white/20">
                <div className="absolute inset-0 rounded-full border-[10px] border-tertiary border-t-transparent -rotate-45"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-tertiary font-quicksand">
                    {habits.sleep_hours !== null && habits.sleep_hours > 0 ? `${habits.sleep_hours}h` : '7.2h'}
                  </p>
                  <p className="text-[9px] font-bold text-tertiary/60 uppercase tracking-wider">Avg Sleep</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Profile & Cycle settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/30 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="mb-6">
              <h3 className="font-quicksand text-2xl font-bold text-primary">Wellness Profile Settings</h3>
              <p className="text-xs text-outline mt-1 font-medium">Personalize goals, habits targets, and period cycles.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="e.g. Maya Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Age (years)</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="e.g. 26"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Fitness Level</label>
                  <select 
                    value={fitnessLevel} 
                    onChange={e => setFitnessLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Height (cm)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={height} 
                    onChange={e => setHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="e.g. 165"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={weight} 
                    onChange={e => setWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="e.g. 62"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Avg Cycle Length (days)</label>
                  <input 
                    type="number" 
                    value={cycleLength} 
                    onChange={e => setCycleLength(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Avg Period Length (days)</label>
                  <input 
                    type="number" 
                    value={periodLength} 
                    onChange={e => setPeriodLength(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20"
                    placeholder="5"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Wellness/Diet Goals</label>
                  <textarea 
                    value={goals} 
                    onChange={e => setGoals(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white focus:outline-none border border-transparent focus:border-primary/20 resize-none"
                    placeholder="Describe meal preferences, cycle regulation goals, stress limits..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-3.5 bg-surface-container-low text-on-surface-variant rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="flex-1 py-3.5 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
