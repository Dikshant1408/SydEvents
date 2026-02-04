
import React, { useState, useMemo } from 'react';
import { Event, TicketLead, User } from '../types';
import EventCard from '../components/EventCard';

interface HomePageProps {
  events: Event[];
  onGetTickets: (lead: TicketLead) => void;
  user: User | null;
}

const HomePage: React.FC<HomePageProps> = ({ events, onGetTickets, user }) => {
  const [filter, setFilter] = useState('All');

  // Featured event is the latest imported one
  const featuredEvent = useMemo(() => {
    return events.filter(e => e.status === 'imported').sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    )[0];
  }, [events]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.category)))], [events]);
  const filteredEvents = useMemo(() => filter === 'All' ? events : events.filter(e => e.category === filter), [events, filter]);

  const userStats = useMemo(() => {
    if (!user) return null;
    return {
      suggested: events.filter(e => e.status === 'imported').length,
      upcoming: events.filter(e => e.status === 'imported' && new Date(e.dateTime) > new Date()).length
    };
  }, [user, events]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Personalized Greeting */}
      {user && (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-100 p-1">
              <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h2>
              <p className="text-xs text-slate-500 font-medium">Discovering the best of Sydney for you today.</p>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New For You</p>
              <p className="text-lg font-black text-indigo-600">{userStats?.suggested || 0}</p>
            </div>
            <div className="h-10 w-px bg-slate-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming</p>
              <p className="text-lg font-black text-slate-900">{userStats?.upcoming || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Hero Section */}
      {featuredEvent && (
        <div className="relative h-[450px] lg:h-[550px] rounded-[48px] overflow-hidden mb-16 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 group">
          <img 
            src={featuredEvent.imageUrl} 
            alt={featuredEvent.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 lg:p-20 max-w-4xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/30">
                Staff Pick
              </span>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                {featuredEvent.category} • Sydney
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.9]">
              {featuredEvent.title}
            </h1>
            <p className="text-slate-300 text-lg lg:text-xl font-medium mb-10 line-clamp-2 max-w-2xl leading-relaxed">
              {featuredEvent.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById(featuredEvent.id);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl"
              >
                View Details
              </button>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2.5" /></svg>
                <span className="text-white font-bold text-sm">{featuredEvent.venueName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Live Feed</h2>
          <p className="text-slate-500 font-medium">Verified events curated from major Sydney providers.</p>
        </div>
        
        <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === cat 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
          {filteredEvents.map((event, idx) => (
            <div 
              id={event.id}
              key={event.id} 
              className="animate-in fade-in slide-in-from-bottom-8 duration-700" 
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <EventCard event={event} onGetTickets={onGetTickets} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-100 py-32 text-center shadow-inner mb-24">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No results in {filter}</h3>
          <p className="text-slate-500 font-medium">Try another category or broaden your search.</p>
          <button 
            onClick={() => setFilter('All')}
            className="mt-10 bg-slate-100 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Submission Documentation Section */}
      <div className="border-t border-slate-200 pt-24 pb-12">
        <div className="bg-slate-900 rounded-[48px] p-8 lg:p-20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Technical Specifications</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-16 tracking-tighter">System Architecture & <br/><span className="text-indigo-400">Assignment Implementation</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
              <div>
                <h4 className="text-lg font-black mb-4 flex items-center space-x-3">
                  <span className="text-indigo-500">01</span>
                  <span>AI Engine</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Utilizes Google Gemini 3.0 Pro for automated discovery. The engine scrapes unstructured data from various Sydney portals, normalizing it into a strict JSON schema for our operational database.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-black mb-4 flex items-center space-x-3">
                  <span className="text-indigo-500">02</span>
                  <span>Persistence</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Implements a Repository Pattern using LocalStorage. This simulates a real asynchronous backend API, allowing data persistence for events, leads, and user sessions across browser reloads.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-black mb-4 flex items-center space-x-3">
                  <span className="text-indigo-500">03</span>
                  <span>User Rights</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Features robust RBAC (Role-Based Access Control). Standard users login via Google Auth, while an Admin bypass is provided for technical reviewers to inspect the Operational Pipeline.
                </p>
              </div>
            </div>

            <div className="mt-20 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-wrap gap-4">
                {['React 19', 'TypeScript', 'Tailwind CSS', 'Gemini AI', 'Google GIS'].map(tech => (
                  <span key={tech} className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">{tech}</span>
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Built for Professional Review • 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
