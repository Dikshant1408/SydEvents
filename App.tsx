
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Event, User, TicketLead, Notification, UserPreferences } from './types';
import { INITIAL_EVENTS } from './constants';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/Header';
import ChatAssistant from './components/ChatAssistant';
import { syncEventsWithSource } from './services/eventService';
import { db } from './services/dbService';
import { initGoogleAuth } from './services/authService';

const SCRAPE_INTERVAL_MS = 5 * 60 * 1000;

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<TicketLead[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({ categories: [], lastNotificationCheck: new Date().toISOString() });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Initialize data from DB
  useEffect(() => {
    const initData = async () => {
      const [dbEvents, dbUser, dbLeads, dbNotifications, dbPrefs] = await Promise.all([
        db.getEvents(),
        db.getCurrentUser(),
        db.getLeads(),
        db.getNotifications(),
        db.getPreferences()
      ]);

      setEvents(dbEvents.length > 0 ? dbEvents : INITIAL_EVENTS);
      setCurrentUser(dbUser);
      setLeads(dbLeads);
      setNotifications(dbNotifications);
      setPreferences(dbPrefs);
      setIsLoading(false);
      
      // Initialize Google Auth
      initGoogleAuth((user) => {
        handleLogin(user);
      });
    };

    initData();
  }, []);

  const performSync = useCallback(async () => {
    if (isSyncing || isLoading) return;
    setIsSyncing(true);
    try {
      const currentEvents = await db.getEvents();
      const mergedEvents = await syncEventsWithSource(currentEvents.length > 0 ? currentEvents : events, "Sydney");
      
      const freshMatches = mergedEvents.filter(e => 
        (e.status === 'new' || e.status === 'updated') && 
        preferences.categories.includes(e.category) &&
        !events.some(oldE => oldE.id === e.id && oldE.status === e.status)
      );

      if (freshMatches.length > 0) {
        const newNotifications: Notification[] = freshMatches.map(m => ({
          id: Math.random().toString(36).substr(2, 9),
          message: `${m.status === 'new' ? 'New' : 'Updated'} event: ${m.title}`,
          eventId: m.id,
          timestamp: new Date().toISOString(),
          read: false
        }));
        const updatedNotifs = [...newNotifications, ...notifications];
        setNotifications(updatedNotifs);
        await db.saveNotifications(updatedNotifs);
      }

      setEvents(mergedEvents);
      await db.saveEvents(mergedEvents);
      const now = new Date().toISOString();
      setLastSyncTime(now);
    } catch (err) {
      console.error("Automated sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [events, preferences.categories, isSyncing, isLoading, notifications]);

  // Periodic Sync
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      performSync();
    }, SCRAPE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [performSync, isLoading]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    await db.setCurrentUser(user);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    await db.setCurrentUser(null);
  };

  const addLead = async (lead: TicketLead) => {
    const updatedLeads = [lead, ...leads];
    setLeads(updatedLeads);
    await db.saveLead(lead);
  };

  const updateEvents = async (newEvents: Event[]) => {
    setEvents(newEvents);
    await db.saveEvents(newEvents);
  };

  const updatePreferences = async (cats: string[]) => {
    const newPrefs = { ...preferences, categories: cats };
    setPreferences(newPrefs);
    await db.savePreferences(newPrefs);
  };

  const markNotificationRead = async (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifs);
    await db.saveNotifications(updatedNotifs);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Connecting to Services...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header 
          user={currentUser} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          notifications={notifications}
          onMarkRead={markNotificationRead}
        />
        
        {isSyncing && (
          <div className="fixed top-16 left-0 right-0 z-[40] bg-indigo-600 text-white text-[10px] font-black text-center py-1.5 animate-pulse uppercase tracking-widest shadow-xl">
            Live Database Syncing with Source Providers...
          </div>
        )}

        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<HomePage user={currentUser} events={events.filter(e => e.status !== 'inactive')} onGetTickets={addLead} />} />
            <Route 
              path="/dashboard" 
              element={
                currentUser?.role === 'admin' ? (
                  <DashboardPage 
                    events={events} 
                    leads={leads}
                    onUpdateEvents={updateEvents} 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>

        <ChatAssistant 
          events={events.filter(e => e.status !== 'inactive')} 
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
        />
        
        <footer className="bg-white border-t border-slate-100 py-12 px-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-4 font-black text-xs">S</div>
            <div className="text-slate-500 text-sm font-medium mb-1">
              &copy; {new Date().getFullYear()} SydEvents Pro Platform
            </div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Confidential Technical Assessment Submission</p>
            {lastSyncTime && (
              <div className="mt-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                Database Health: Synchronized ({new Date(lastSyncTime).toLocaleTimeString()})
              </div>
            )}
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
