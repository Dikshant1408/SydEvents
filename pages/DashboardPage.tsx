
import React, { useState, useMemo, useEffect } from 'react';
import { Event, EventStatus, TicketLead } from '../types';
import { syncEventsWithSource } from '../services/eventService';
import ImportModal from '../components/ImportModal';

interface DashboardPageProps {
  events: Event[];
  leads: TicketLead[];
  onUpdateEvents: (events: Event[]) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ events, leads, onUpdateEvents }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'leads'>('events');
  const [isScraping, setIsScraping] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('Sydney');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [importEvent, setImportEvent] = useState<Event | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Tooltip state
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  const stats = useMemo(() => ({
    total: events.length,
    new: events.filter(e => e.status === 'new').length,
    leads: leads.length,
    imported: events.filter(e => e.status === 'imported').length
  }), [events, leads]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(events.map(e => e.category))).filter(Boolean).sort();
    return ['All', ...uniqueCategories];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                           e.venueName.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'All' || e.city === cityFilter;
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      
      const eventDate = new Date(e.dateTime).getTime();
      const afterStart = dateRange.start ? eventDate >= new Date(dateRange.start).getTime() : true;
      const beforeEnd = dateRange.end ? eventDate <= new Date(dateRange.end).getTime() : true;

      return matchesSearch && matchesCity && matchesStatus && matchesCategory && afterStart && beforeEnd;
    });
  }, [events, search, cityFilter, statusFilter, categoryFilter, dateRange]);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const updatedList = await syncEventsWithSource(events, cityFilter === 'All' ? 'Sydney' : cityFilter);
      onUpdateEvents(updatedList);
      setToast({ message: 'Pipeline synchronized with source providers.', type: 'success' });
    } catch (err) {
      console.error("Manual scrape failed", err);
    } finally {
      setIsScraping(false);
    }
  };

  const handleImportSubmit = (notes: string) => {
    if (!importEvent) return;
    const updatedEvents = events.map(e => {
      if (e.id === importEvent.id) {
        return {
          ...e,
          status: 'imported' as EventStatus,
          importedAt: new Date().toISOString(),
          importedBy: 'Evaluation Admin',
          importNotes: notes
        };
      }
      return e;
    });
    onUpdateEvents(updatedEvents);
    setImportEvent(null);
    setToast({ message: 'Event successfully published to consumer feed.', type: 'success' });
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'updated': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      case 'imported': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 h-full flex flex-col relative">
      {/* Dynamic Notification Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Tooltip implementation */}
      {hoveredEvent && (
        <div 
          className="fixed z-[999] bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 w-72 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Location Context</div>
          <div className="flex items-start space-x-2 mb-3">
            <svg className="w-4 h-4 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            <span className="text-xs font-medium leading-relaxed">{hoveredEvent.venueAddress}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Source Trace</div>
          <div className="text-[10px] text-slate-400 font-mono break-all line-clamp-2">{hoveredEvent.originalUrl}</div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Operational Control</h1>
            <p className="text-slate-500 font-medium">Manage the automated event extraction pipeline and lead generation.</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pipeline
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Lead Capture
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pipeline Capacity', value: stats.total, color: 'text-indigo-600', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { label: 'Unprocessed New', value: stats.new, color: 'text-blue-600', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Active Leads', value: stats.leads, color: 'text-emerald-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { label: 'Live Distribution', value: stats.imported, color: 'text-slate-900', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={s.icon} strokeWidth="2" /></svg>
              </div>
            </div>
          ))}
        </div>
        
        {activeTab === 'events' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
               <div className="flex items-center space-x-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                 <select 
                   value={cityFilter}
                   onChange={(e) => setCityFilter(e.target.value)}
                   className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer hover:text-indigo-600"
                 >
                   <option value="Sydney">Sydney</option>
                   <option value="Melbourne">Melbourne</option>
                   <option value="Brisbane">Brisbane</option>
                   <option value="All">All Cities</option>
                 </select>
               </div>
               <div className="h-4 w-px bg-slate-200"></div>
               <div className="flex items-center space-x-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">State</span>
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'All')}
                   className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer hover:text-indigo-600"
                 >
                   <option value="All">All</option>
                   <option value="new">New</option>
                   <option value="updated">Updated</option>
                   <option value="imported">Imported</option>
                   <option value="inactive">Inactive</option>
                 </select>
               </div>
               <div className="h-4 w-px bg-slate-200"></div>
               <div className="flex items-center space-x-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vertical</span>
                 <select 
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer hover:text-indigo-600 max-w-[140px]"
                 >
                   {categories.map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                 </select>
               </div>
            </div>

            <div className="relative flex-grow max-w-md">
              <input 
                type="text" 
                placeholder="Search repository..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button 
              onClick={handleScrape}
              disabled={isScraping}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 group ${
                isScraping 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isScraping ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              )}
              <span>{isScraping ? 'Syncing...' : 'Initiate Sync'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-grow min-h-0 overflow-hidden">
        {activeTab === 'events' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="flex-grow bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-auto max-h-[calc(100vh-420px)]">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduling</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map(event => (
                      <tr 
                        key={event.id} 
                        onClick={() => setSelectedEventId(event.id)}
                        onMouseEnter={() => setHoveredEvent(event)}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onMouseMove={(e) => setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 })}
                        className={`group cursor-pointer hover:bg-slate-50 transition-colors ${selectedEventId === event.id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-4">
                            <img src={event.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100" />
                            <div>
                              <div className="text-sm font-black text-slate-900 line-clamp-1">{event.title}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{event.category} • {event.venueName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-black text-slate-700">{new Date(event.dateTime).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-5">
                          {event.status !== 'imported' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setImportEvent(event); }}
                              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95"
                            >
                              IMPORT
                            </button>
                          ) : (
                            <div className="text-emerald-500 flex items-center space-x-1">
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                               <span className="text-[10px] font-black uppercase tracking-widest">Distributed</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                          <div className="text-slate-400">
                             <p className="text-sm font-black uppercase tracking-widest mb-1">Queue Empty</p>
                             <p className="text-xs font-medium">No entities matching current filter criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:w-96 flex-shrink-0">
               {selectedEvent ? (
                 <div className="bg-white rounded-3xl border border-slate-200 p-7 sticky top-2 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative mb-5 group">
                      <img src={selectedEvent.imageUrl} alt="" className="w-full h-48 rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border bg-white shadow-sm ${getStatusColor(selectedEvent.status)}`}>
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight">{selectedEvent.title}</h2>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-6">{selectedEvent.description}</p>
                    
                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2.5" /></svg>
                        </div>
                        <span className="font-bold">{selectedEvent.venueName}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" /></svg>
                        </div>
                        <span className="font-bold">{new Date(selectedEvent.dateTime).toLocaleString('en-AU', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {selectedEvent.status === 'imported' && (
                      <div className="mt-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Publish Audit Log</span>
                        <p className="text-xs text-emerald-800 italic font-medium leading-relaxed">"{selectedEvent.importNotes || 'No metadata notes.'}"</p>
                        <div className="mt-3 flex justify-between items-center pt-3 border-t border-emerald-100/50">
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">By: {selectedEvent.importedBy}</span>
                          <span className="text-[9px] text-emerald-500 font-bold">{new Date(selectedEvent.importedAt!).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" /></svg>
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-500">Inspector Panel</p>
                    <p className="text-xs font-medium mt-1">Select an entity to review automated extraction metadata and source origins.</p>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-auto max-h-[calc(100vh-320px)]">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture Timestamp</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Identification</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Consent Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5 text-xs text-slate-500 font-bold">{new Date(lead.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">@</div>
                            <span className="text-sm font-black text-slate-900">{lead.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600 font-bold">{lead.eventTitle}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${lead.consent ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {lead.consent ? 'Active Opt-in' : 'Restricted'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr><td colSpan={4} className="py-32 text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-300">No leads captured for the current period.</p>
                      </td></tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>

      {importEvent && (
        <ImportModal 
          eventName={importEvent.title} 
          onClose={() => setImportEvent(null)} 
          onSubmit={handleImportSubmit} 
        />
      )}
    </div>
  );
};

export default DashboardPage;
