'use client';

import React, { useState, useEffect } from 'react';
import { wellnessService } from '../services/api';
import { Calendar as CalendarIcon, Save, Droplet, Plus, Moon, Scale, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistProps {
  onRefresh: () => void;
}

export default function Checklist({ onRefresh }: ChecklistProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitLog, setHabitLog] = useState<any>(null);

  // Form states
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<number>(2000);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);
  const [yogaCompleted, setYogaCompleted] = useState<boolean>(false);
  const [meditationCompleted, setMeditationCompleted] = useState<boolean>(false);
  const [mood, setMood] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  const fetchLogForDate = async () => {
    setLoading(true);
    try {
      const data = await wellnessService.getHabitsByDate(logDate);
      setHabitLog(data);
      
      // Initialize form variables
      setWaterIntake(data.water_intake_ml || 0);
      setWaterGoal(data.water_goal_ml || 2000);
      setSleepHours(data.sleep_hours !== null ? data.sleep_hours.toString() : '');
      setWeight(data.weight !== null ? data.weight.toString() : '');
      setExerciseCompleted(!!data.exercise_completed);
      setYogaCompleted(!!data.yoga_completed);
      setMeditationCompleted(!!data.meditation_completed);
      setMood(data.mood || 3);
      setNotes(data.notes || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogForDate();
  }, [logDate]);

  const handleQuickWaterAdd = (amount: number) => {
    setWaterIntake(prev => prev + amount);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitLog?.id) return;
    setSaving(true);
    try {
      await wellnessService.updateHabitLog(habitLog.id, {
        water_intake_ml: waterIntake,
        water_goal_ml: waterGoal,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        weight: weight ? parseFloat(weight) : null,
        exercise_completed: exerciseCompleted,
        yoga_completed: yogaCompleted,
        meditation_completed: meditationCompleted,
        mood: mood,
        notes: notes
      });
      onRefresh();
      alert('Daily wellness logs updated successfully! 👍');
    } catch (e) {
      console.error(e);
      alert('Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Picker */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h2 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface">
            Daily Habits Checklist
          </h2>
          <p className="text-sm text-on-surface-variant/80 font-medium">
            Check off wellness tasks, track hydration levels, and save observations.
          </p>
        </div>

        {/* Dynamic Date Selector */}
        <div className="relative flex items-center bg-white border border-outline-variant/30 px-4 py-2.5 rounded-2xl shadow-sm">
          <CalendarIcon className="w-4 h-4 text-outline mr-2" />
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="text-xs font-bold text-on-surface focus:outline-none bg-transparent cursor-pointer"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-80 bg-white rounded-[2rem] border border-outline-variant/20">
          <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Retrieving logs for selected date...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Habits & Water Tracker (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Habits Checklist Box */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <h3 className="font-quicksand text-lg font-bold text-on-surface">Habits Targets</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Exercise habit check */}
                <div
                  onClick={() => setExerciseCompleted(!exerciseCompleted)}
                  className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    exerciseCompleted
                      ? 'bg-secondary-container/50 border-secondary-container/60 text-secondary'
                      : 'bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Exercise</span>
                    {exerciseCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-outline" />}
                  </div>
                  <span className="text-xs font-bold text-on-surface">Gentle Movement</span>
                </div>

                {/* Yoga habit check */}
                <div
                  onClick={() => setYogaCompleted(!yogaCompleted)}
                  className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    yogaCompleted
                      ? 'bg-primary-fixed/50 border-primary-fixed/60 text-primary'
                      : 'bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Yoga</span>
                    {yogaCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-outline" />}
                  </div>
                  <span className="text-xs font-bold text-on-surface">Pelvic Flow Routine</span>
                </div>

                {/* Meditation habit check */}
                <div
                  onClick={() => setMeditationCompleted(!meditationCompleted)}
                  className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between h-32 transition-all ${
                    meditationCompleted
                      ? 'bg-tertiary-fixed/50 border-tertiary-fixed/60 text-tertiary'
                      : 'bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Meditation</span>
                    {meditationCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-outline" />}
                  </div>
                  <span className="text-xs font-bold text-on-surface">Cortisol Breathing</span>
                </div>

              </div>
            </div>

            {/* Hydration Tracker Box */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-quicksand text-lg font-bold text-on-surface">Hydration Tracker</h3>
                <span className="text-xs font-bold text-primary bg-primary-fixed/40 px-3 py-1 rounded-xl">
                  {waterIntake}ml logged
                </span>
              </div>

              <div className="space-y-6">
                {/* Water slider input visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-wider">
                    <span>0 ml</span>
                    <span>Goal: {waterGoal} ml</span>
                  </div>
                  <div className="w-full h-4 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/20 relative">
                    <div 
                      className="h-full bg-primary transition-all duration-300 shadow-inner"
                      style={{ width: `${Math.min(100, (waterIntake / waterGoal) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickWaterAdd(250)}
                    className="py-3 bg-surface-container-low text-primary border border-outline-variant/30 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary-fixed/30 hover:border-primary-fixed/40 transition-all"
                  >
                    <Droplet className="w-4 h-4 fill-primary/10" /> +250ml
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickWaterAdd(500)}
                    className="py-3 bg-surface-container-low text-primary border border-outline-variant/30 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary-fixed/30 hover:border-primary-fixed/40 transition-all"
                  >
                    <Droplet className="w-4 h-4 fill-primary/10" /> +500ml
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterIntake(0)}
                    className="py-3 bg-surface-container-low text-outline hover:text-error border border-outline-variant/30 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-error-container/20 hover:border-error/20 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Other logs (Weight, Sleep, Mood, Notes) - 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-5">
              <h3 className="font-quicksand text-lg font-bold text-on-surface">Metrics Logger</h3>

              {/* Sleep log */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-outline">
                  <Moon className="w-4 h-4" />
                  <label className="text-[9px] font-bold uppercase tracking-wider">Sleep (hours)</label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                />
              </div>

              {/* Weight log */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-outline">
                  <Scale className="w-4 h-4" />
                  <label className="text-[9px] font-bold uppercase tracking-wider">Weight (kg)</label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 62.5"
                  className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                />
              </div>

              {/* Mood slider */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider block">Mood (1 to 5)</label>
                <div className="flex items-center justify-between gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/25">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMood(val)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        mood === val
                          ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-110'
                          : 'bg-white text-outline hover:text-on-surface'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* General Day Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Today's Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Stress levels, details about cramps, food cravings..."
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none resize-none"
                />
              </div>

              {/* Save Logs Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/10 hover:opacity-95 disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Checklist'}
              </button>

            </div>

          </div>

        </form>
      )}
    </div>
  );
}
