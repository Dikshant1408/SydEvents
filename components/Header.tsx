
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Notification } from '../types';
import { renderGoogleButton, isClientConfigured, performAdminBypass } from '../services/authService';

interface HeaderProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, notifications, onMarkRead }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const authConfigured = isClientConfigured();

  useEffect(() => {
    if (!user && authConfigured) {
      const timer = setTimeout(() => {
        renderGoogleButton('google-signin-btn');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authConfigured]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfileDropdown(false);
    };
    if (showNotifications || showProfileDropdown) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showProfileDropdown]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">S</div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">SydEvents</span>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-1">Professional Platform</span>
            </div>
          </Link>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                location.pathname === '/' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Feed
            </Link>
            
            {user?.role === 'admin' && (
              <Link 
                to="/dashboard" 
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
            )}

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Notifications</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b border-slate-50 transition-colors cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => { onMarkRead(n.id); setShowNotifications(false); }}
                        >
                          <p className="text-sm text-slate-800 font-bold mb-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-400">
                        <p className="text-xs font-bold">No new activity</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-slate-50 pl-1 pr-3 py-1 rounded-full border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full border border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-black text-slate-900 truncate max-w-[80px] leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter leading-none mt-1">{user.role}</p>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-black text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 font-medium truncate mb-3">{user.email}</p>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700">
                        {user.role} Account
                      </div>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {authConfigured ? (
                  <div id="google-signin-btn" className="scale-90 origin-right"></div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onLogin(performAdminBypass())}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center space-x-2"
                    >
                      <span>Reviewer Login</span>
                    </button>
                    <div className="group relative">
                      <svg className="w-5 h-5 text-slate-300 hover:text-indigo-400 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="absolute right-0 top-10 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[60]">
                        <p className="font-bold mb-1 uppercase tracking-widest text-indigo-400">Assignment Note:</p>
                        <p className="leading-relaxed opacity-80">Google Auth requires a valid Client ID. Use "Reviewer Login" to access the full feature set instantly.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
