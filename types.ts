
export type EventStatus = 'new' | 'updated' | 'inactive' | 'imported';

export interface Event {
  id: string;
  title: string;
  dateTime: string;
  venueName: string;
  venueAddress: string;
  city: string;
  description: string;
  category: string;
  imageUrl: string;
  sourceName: string;
  originalUrl: string;
  lastScrapedTime: string;
  status: EventStatus;
  importedAt?: string;
  importedBy?: string;
  importNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: 'admin' | 'user';
}

export interface TicketLead {
  id: string;
  email: string;
  consent: boolean;
  eventId: string;
  eventTitle: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserPreferences {
  categories: string[];
  lastNotificationCheck: string;
}

export interface Notification {
  id: string;
  message: string;
  eventId: string;
  timestamp: string;
  read: boolean;
}
