'use client';

import React from 'react';
import { LayoutDashboard, Utensils, CheckSquare, Calendar, Sparkles } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  enabledFeatures?: string[];
}

export default function MobileNav({ activeTab, setActiveTab, enabledFeatures }: MobileNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'checklist', label: 'Habits', icon: CheckSquare },
    { id: 'tracker', label: 'Cycle', icon: Calendar },
    { id: 'chat', label: 'AI', icon: Sparkles },
  ].filter(item => {
    if (item.id === 'dashboard') return true;
    if (enabledFeatures) return enabledFeatures.includes(item.id);
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-6 bg-surface-container-lowest rounded-t-3xl shadow-[0_-4px_20px_0_rgba(68,102,79,0.06)] border-t border-outline-variant/20">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'bg-primary-fixed text-on-primary-fixed-variant font-bold scale-[1.05]'
                : 'text-outline hover:text-on-surface-variant'
            }`}
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
