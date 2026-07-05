'use client';

import React, { useState, useEffect } from 'react';
import { wellnessService } from '../services/api';
import { Calendar, AlertCircle, Plus, Sparkles, Activity, Trash2, Check } from 'lucide-react';

export default function Tracker() {
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Period Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [flowLevel, setFlowLevel] = useState('Medium');
  const [periodNotes, setPeriodNotes] = useState('');

  // Symptom Form State
  const [symptomDate, setSymptomDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptomName, setSymptomName] = useState('Cramps');
  const [severity, setSeverity] = useState('Mild');
  const [symptomNotes, setSymptomNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const logs = await wellnessService.getCycleLogs();
      setPeriods(logs);
      
      const pred = await wellnessService.getCyclePredictions();
      setPredictions(pred);

      const symp = await wellnessService.getSymptomLogs();
      setSymptoms(symp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await wellnessService.logCycle({
        start_date: startDate,
        end_date: endDate || null,
        flow_level: flowLevel,
        notes: periodNotes
      });
      setPeriodNotes('');
      setEndDate('');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await wellnessService.logSymptom({
        date: symptomDate,
        symptom_name: symptomName,
        severity: severity,
        notes: symptomNotes
      });
      setSymptomNotes('');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSymptom = async (id: number) => {
    if (!window.confirm('Delete this symptom log?')) return;
    try {
      await wellnessService.deleteSymptom(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePeriod = async (id: number) => {
    if (!window.confirm('Delete this period log?')) return;
    try {
      await wellnessService.deleteCycleLog(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="py-2">
        <h2 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface">
          Cycle & Symptom Tracker
        </h2>
        <p className="text-sm text-on-surface-variant/80 font-medium mt-1">
          Monitor your menstrual phases, log symptom severity, and view intelligent cycle predictions.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-80 bg-white rounded-[2rem] border border-outline-variant/20">
          <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Loading tracking metrics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Predictions Panel (Left Side - Bento Card) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Predictions Display Card */}
            <div className="bg-secondary-fixed/20 p-8 rounded-[2rem] border border-secondary-fixed-dim/20 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-secondary" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-xl shadow-sm text-secondary">
                    <Sparkles className="w-5 h-5 fill-secondary/15" />
                  </span>
                  <h3 className="font-quicksand text-lg font-bold text-on-secondary-container">Hormonal Predictions</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/70 p-5 rounded-2xl border border-secondary-fixed-dim/15">
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Average Cycle Length</span>
                    <span className="text-3xl font-bold text-secondary font-quicksand block mt-1">
                      {predictions.average_cycle_length || 28} <span className="text-sm opacity-70">days</span>
                    </span>
                  </div>
                  <div className="bg-white/70 p-5 rounded-2xl border border-secondary-fixed-dim/15">
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Period Duration Target</span>
                    <span className="text-3xl font-bold text-secondary font-quicksand block mt-1">
                      {predictions.typical_period_length || 5} <span className="text-sm opacity-70">days</span>
                    </span>
                  </div>
                </div>

                {/* Predictions Timeline */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Upcoming predicted periods</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {predictions.predictions?.map((pred: any, idx: number) => (
                      <div key={idx} className="bg-white/90 p-4 rounded-2xl border border-secondary-fixed-dim/20 flex flex-col justify-center text-center space-y-1">
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Cycle Prediction {idx + 1}</span>
                        <span className="text-xs font-bold text-on-surface">
                          {new Date(pred.predicted_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-outline">
                          to {new Date(pred.predicted_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Logs List */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/25 pb-4">
                <span className="p-2 bg-surface-container-low text-primary rounded-xl">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="font-quicksand text-lg font-bold">Menstrual Log History</h3>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {periods.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/25">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                        Period log (Flow: {log.flow_display})
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        {new Date(log.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {log.end_date ? ` to ${new Date(log.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ' (Ongoing)'}
                      </span>
                      {log.notes && <p className="text-[10px] text-outline italic font-medium">Notes: {log.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      {log.duration_days && (
                        <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-xl">
                          {log.duration_days} days
                        </span>
                      )}
                      <button
                        onClick={() => handleDeletePeriod(log.id)}
                        className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {periods.length === 0 && (
                  <div className="text-center py-8 text-xs text-outline font-medium">
                    No periods logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Logged Symptoms List */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/25 pb-4">
                <span className="p-2 bg-surface-container-low text-tertiary rounded-xl">
                  <Activity className="w-5 h-5" />
                </span>
                <h3 className="font-quicksand text-lg font-bold">Logged Symptoms</h3>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {symptoms.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/25">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">{log.symptom_display}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          log.severity === 'Severe' 
                            ? 'bg-error-container text-on-error-container' 
                            : log.severity === 'Moderate' 
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' 
                              : 'bg-primary-fixed text-on-primary-fixed-variant'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-outline block">
                        Logged on {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {log.notes && <p className="text-[10px] text-outline italic font-medium">Notes: {log.notes}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteSymptom(log.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
                {symptoms.length === 0 && (
                  <div className="text-center py-8 text-xs text-outline font-medium">
                    No symptoms logged yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Logging Action Forms (Right Side - 4 Columns) */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Period Logger Form */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <h3 className="font-quicksand text-lg font-bold text-on-surface">Log a Period</h3>
              <form onSubmit={handleLogPeriod} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">End Date (optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Flow Level</label>
                  <select
                    value={flowLevel}
                    onChange={(e) => setFlowLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  >
                    <option value="Spotting">Spotting</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Notes</label>
                  <input
                    type="text"
                    value={periodNotes}
                    onChange={(e) => setPeriodNotes(e.target.value)}
                    placeholder="e.g. Cramps began today"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Save Log'}
                </button>
              </form>
            </div>

            {/* Symptom Logger Form */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
              <h3 className="font-quicksand text-lg font-bold text-on-surface">Log a Symptom</h3>
              <form onSubmit={handleLogSymptom} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={symptomDate}
                    onChange={(e) => setSymptomDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Symptom</label>
                  <select
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  >
                    <option value="Cramps">Cramps</option>
                    <option value="Bloating">Bloating</option>
                    <option value="Acne">Acne</option>
                    <option value="Fatigue">Fatigue</option>
                    <option value="Headache">Headache</option>
                    <option value="Mood Swings">Mood Swings</option>
                    <option value="Insomnia">Insomnia</option>
                    <option value="Cravings">Cravings</option>
                    <option value="Backache">Backache</option>
                    <option value="Nausea">Nausea</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Notes</label>
                  <input
                    type="text"
                    value={symptomNotes}
                    onChange={(e) => setSymptomNotes(e.target.value)}
                    placeholder="e.g. Mild bloating after meals"
                    className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-xs font-semibold focus:bg-white border border-transparent focus:border-primary/20 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-tertiary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Save Symptom'}
                </button>
              </form>
            </div>

          </section>

        </div>
      )}
    </div>
  );
}
