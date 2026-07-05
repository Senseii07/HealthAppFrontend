'use client';

import React from 'react';
import { LayoutDashboard, Utensils, CheckSquare, Calendar, Sparkles, Settings, Lightbulb, LogOut } from 'lucide-react';
import { authService } from '../services/api';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username: string;
  onLogout: () => void;
  profile: any;
  enabledFeatures?: string[];
}

export default function Sidebar({ activeTab, setActiveTab, username, onLogout, profile, enabledFeatures }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'tracker', label: 'Tracker', icon: Calendar },
    { id: 'chat', label: 'AI Insights', icon: Sparkles },
  ].filter(item => {
    if (item.id === 'dashboard') return true;
    if (enabledFeatures) return enabledFeatures.includes(item.id);
    return true;
  });

  const handleLogoutClick = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      onLogout();
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-surface-container-low flex-col py-8 px-6 z-40 border-r border-outline-variant/30 shadow-sm">
      {/* App Logo/Header */}
      <div className="mb-10 px-4">
        <h1 className="font-quicksand text-2xl font-bold text-primary tracking-tight">PCOS Companion</h1>
        <p className="text-[10px] text-outline tracking-widest uppercase font-bold">Wellness Assistant</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-semibold transition-all duration-200 text-left ${
                isActive
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-white/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-xs uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Dynamic Tip / Insight Card */}
      <div className="mt-6 p-5 bg-tertiary-fixed/30 rounded-3xl border border-tertiary-fixed-dim/30">
        <div className="flex items-center gap-2 text-tertiary mb-2">
          <Lightbulb className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Quick Tip</span>
        </div>
        <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed font-medium">
          Magnesium intake is linked to better cycle regularity. Try adding organic pumpkin seeds to your salads today!
        </p>
      </div>

      {/* Footer / Profile & Settings */}
      <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-white shadow-sm flex-shrink-0">
          <div className="font-quicksand text-sm font-bold text-on-secondary-container uppercase">
            {username.slice(0, 2)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate capitalize">{profile?.profile?.name || username}</p>
          <p className="text-[10px] text-outline truncate font-medium">
            {profile?.profile?.fitness_level || 'Beginner'} Level
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          title="Log Out"
          className="p-2 text-outline hover:text-error rounded-xl hover:bg-error-container/20 transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
}
