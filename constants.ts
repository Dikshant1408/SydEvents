
import { Event } from './types';

export const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sydney Opera House Sunset Tour',
    dateTime: '2024-06-15T17:30:00Z',
    venueName: 'Sydney Opera House',
    venueAddress: 'Bennelong Point, Sydney NSW 2000',
    city: 'Sydney',
    description: 'Experience the magic of the Sydney Opera House as the sun sets over the harbor.',
    category: 'Culture',
    imageUrl: 'https://picsum.photos/seed/opera/800/600',
    sourceName: 'Official Opera House',
    originalUrl: 'https://www.sydneyoperahouse.com',
    lastScrapedTime: new Date().toISOString(),
    status: 'imported',
    importedAt: new Date().toISOString(),
    importedBy: 'System Admin'
  },
  {
    id: '2',
    title: 'Bondi Beach Surf Competition',
    dateTime: '2024-06-20T08:00:00Z',
    venueName: 'Bondi Beach',
    venueAddress: 'Bondi Beach, NSW 2026',
    city: 'Sydney',
    description: 'The annual surf championship returns to the iconic Bondi Beach.',
    category: 'Sports',
    imageUrl: 'https://picsum.photos/seed/surf/800/600',
    sourceName: 'Surf NSW',
    originalUrl: 'https://www.surfingnsw.com.au',
    lastScrapedTime: new Date().toISOString(),
    status: 'new'
  },
  {
    id: '3',
    title: 'Darling Harbour Fireworks',
    dateTime: '2024-06-18T21:00:00Z',
    venueName: 'Darling Harbour',
    venueAddress: 'Sydney NSW 2000',
    city: 'Sydney',
    description: 'Weekly firework display lighting up the heart of the city.',
    category: 'Entertainment',
    imageUrl: 'https://picsum.photos/seed/fireworks/800/600',
    sourceName: 'Sydney.com',
    originalUrl: 'https://www.sydney.com',
    lastScrapedTime: new Date().toISOString(),
    status: 'updated'
  }
];

export const APP_NAME = "SydEvents Pro";
