
import React, { useState } from 'react';
import { Event, TicketLead } from '../types';
import EmailModal from './EmailModal';

interface EventCardProps {
  event: Event;
  onGetTickets: (lead: TicketLead) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onGetTickets }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleTicketSubmit = (email: string, consent: boolean) => {
    onGetTickets({
      id: Math.random().toString(36).substr(2, 9),
      email,
      consent,
      eventId: event.id,
      eventTitle: event.title,
      timestamp: new Date().toISOString()
    });
    window.open(event.originalUrl, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center text-xs text-indigo-600 font-medium mb-2">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
          {event.title}
        </h3>
        
        <div className="flex items-start text-sm text-slate-500 mb-3">
          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{event.venueName}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="text-[10px] text-slate-400">
            Source: <span className="font-medium">{event.sourceName}</span>
          </div>
          <button 
            onClick={() => setShowEmailModal(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md active:scale-95"
          >
            GET TICKETS
          </button>
        </div>
      </div>

      {showEmailModal && (
        <EmailModal 
          eventName={event.title} 
          onClose={() => setShowEmailModal(false)} 
          onSubmit={handleTicketSubmit} 
        />
      )}
    </div>
  );
};

export default EventCard;
