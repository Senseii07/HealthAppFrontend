'use client';

import React, { useState } from 'react';
import { authService, API_BASE_URL } from '../services/api';
import { Lock, User, Settings, Check } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [savedUrlMsg, setSavedUrlMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ username, password });
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your credentials or backend server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    if (apiUrl.trim()) {
      localStorage.setItem('pcos_api_url', apiUrl.trim());
      setSavedUrlMsg(true);
      setTimeout(() => {
        setSavedUrlMsg(false);
        window.location.reload(); // Reload to apply new URL
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-container-padding py-stack-gap-lg">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] border border-outline-variant/30 shadow-[0_20px_40px_-10px_rgba(68,102,79,0.06)] p-8 md:p-10 relative overflow-hidden">
        {/* Soft Decorative Ambient Blurs */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-quicksand text-3xl font-bold text-primary tracking-tight">PCOS Companion</h1>
            <p className="font-body-md text-body-md text-on-surface-variant/80">
              A private, loving gift to support your wellness journey.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container text-xs rounded-2xl border border-error/20 leading-relaxed">
              {error}
            </div>
          )}

          {!showSettings ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-outline tracking-wider uppercase pl-1">Username</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-5 h-5 text-outline" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. admin"
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-2xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Entering...' : 'Log In'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-outline tracking-wider uppercase pl-1">API Base URL</label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8000/api/"
                    className="w-full px-4 py-3.5 bg-surface-container-low rounded-2xl border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-sm font-mono"
                  />
                  <p className="text-[10px] text-outline pl-1 leading-relaxed">
                    Set this to your local server IP (e.g. <code>http://127.0.0.1:8000/api/</code>) or your hosted Render URL.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-2xl text-xs hover:bg-surface-container-high transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveApiUrl}
                  className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                >
                  {savedUrlMsg ? (
                    <>
                      <Check className="w-4 h-4" /> Saved!
                    </>
                  ) : (
                    'Save & Reload'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Settings Toggle Footer */}
          <div className="pt-4 border-t border-outline-variant/30 flex justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-outline hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
            >
              <Settings className="w-4 h-4" />
              {showSettings ? 'Back to Login' : 'Configure Server Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
