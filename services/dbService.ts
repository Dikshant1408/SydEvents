
import { Event, TicketLead, User, Notification, UserPreferences } from '../types';

/**
 * Database Service
 * Mimics a real backend database API with asynchronous operations.
 * Uses LocalStorage as the persistent storage engine.
 */
class DatabaseService {
  private storageKey = (key: string) => `sydevents_db_${key}`;

  async getEvents(): Promise<Event[]> {
    const data = localStorage.getItem(this.storageKey('events'));
    return data ? JSON.parse(data) : [];
  }

  async saveEvents(events: Event[]): Promise<void> {
    localStorage.setItem(this.storageKey('events'), JSON.stringify(events));
  }

  async getLeads(): Promise<TicketLead[]> {
    const data = localStorage.getItem(this.storageKey('leads'));
    return data ? JSON.parse(data) : [];
  }

  async saveLead(lead: TicketLead): Promise<void> {
    const leads = await this.getLeads();
    localStorage.setItem(this.storageKey('leads'), JSON.stringify([lead, ...leads]));
  }

  async getNotifications(): Promise<Notification[]> {
    const data = localStorage.getItem(this.storageKey('notifications'));
    return data ? JSON.parse(data) : [];
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    localStorage.setItem(this.storageKey('notifications'), JSON.stringify(notifications));
  }

  async getPreferences(): Promise<UserPreferences> {
    const data = localStorage.getItem(this.storageKey('preferences'));
    return data ? JSON.parse(data) : { categories: [], lastNotificationCheck: new Date().toISOString() };
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    localStorage.setItem(this.storageKey('preferences'), JSON.stringify(prefs));
  }

  async getCurrentUser(): Promise<User | null> {
    const data = localStorage.getItem(this.storageKey('session_user'));
    return data ? JSON.parse(data) : null;
  }

  async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      localStorage.setItem(this.storageKey('session_user'), JSON.stringify(user));
    } else {
      localStorage.removeItem(this.storageKey('session_user'));
    }
  }
}

export const db = new DatabaseService();
