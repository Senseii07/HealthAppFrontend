'use client';

import React, { useState, useEffect } from 'react';
import { authService, wellnessService } from '../services/api';
import Auth from '../components/Auth';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import Dashboard from '../components/Dashboard';
import Meals from '../components/Meals';
import Checklist from '../components/Checklist';
import Tracker from '../components/Tracker';
import Chat from '../components/Chat';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Scoped Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pcos_auth_token');
      const user = localStorage.getItem('pcos_username') || '';
      
      if (token) {
        setIsAuthenticated(true);
        setUsername(user);
      } else {
        setIsAuthenticated(false);
      }
    }
  };

  const fetchDashboardAndProfile = async () => {
    setLoading(true);
    try {
      const [dash, prof, features] = await Promise.all([
        wellnessService.getDashboard(),
        authService.getProfile(),
        authService.getFeatures()
      ]);
      setDashboardData(dash);
      setProfileData(prof);
      const enabled = features
        .filter((f: any) => f.is_enabled)
        .map((f: any) => f.code);
      setEnabledFeatures(enabled);
    } catch (e) {
      console.error("Error fetching initial dashboard/profile data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Bind session expiration listener
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUsername('');
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardAndProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab !== 'dashboard' && enabledFeatures.length > 0 && !enabledFeatures.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, enabledFeatures]);

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setDashboardData(null);
    setProfileData(null);
  };

  const handleRefresh = () => {
    fetchDashboardAndProfile();
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Checking session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Render the selected tab panel
  const renderTabContent = () => {
    if (loading && !dashboardData) {
      return (
        <div className="flex items-center justify-center h-80 bg-white rounded-[2rem] border border-outline-variant/20 shadow-sm">
          <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Syncing wellness status...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={dashboardData} 
            profile={profileData} 
            onRefresh={handleRefresh}
            setActiveTab={setActiveTab}
            onProfileUpdate={handleRefresh}
          />
        );
      case 'meals':
        return <Meals />;
      case 'checklist':
        return <Checklist onRefresh={handleRefresh} />;
      case 'tracker':
        return <Tracker />;
      case 'chat':
        return <Chat />;
      default:
        return <Dashboard data={dashboardData} profile={profileData} onRefresh={handleRefresh} setActiveTab={setActiveTab} onProfileUpdate={handleRefresh} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Desktop Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        username={username}
        onLogout={handleLogout}
        profile={profileData}
        enabledFeatures={enabledFeatures}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        enabledFeatures={enabledFeatures}
      />

      {/* Main Panel Viewport */}
      <main className="md:ml-72 min-h-screen p-6 md:p-10 pb-28 md:pb-12">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
