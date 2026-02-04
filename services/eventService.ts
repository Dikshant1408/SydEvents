
import { Event, EventStatus } from "../types";
import { scrapeEvents as apiScrapeEvents } from "./geminiService";

/**
 * Merges freshly scraped events with the existing database.
 * Logic:
 * - New: Not found in current list.
 * - Updated: Found but time/venue/details changed.
 * - Inactive: Was in current list (not imported) but missing from latest scrape.
 * - Imported: Keep status but update details if changed.
 */
export const syncEventsWithSource = async (currentEvents: Event[], city: string = "Sydney"): Promise<Event[]> => {
  const scrapedData = await apiScrapeEvents(city);
  const now = new Date().toISOString();
  
  // Create a map for quick lookup of incoming data
  const incomingMap = new Map(scrapedData.map(item => [item.title, item]));
  const existingTitlesInScrape = new Set(scrapedData.map(item => item.title));

  const updatedList = currentEvents.map(existing => {
    const incoming = incomingMap.get(existing.title);

    if (incoming) {
      // Check for changes to mark as 'updated'
      const isChanged = 
        incoming.dateTime !== existing.dateTime || 
        incoming.venueName !== existing.venueName ||
        incoming.description !== existing.description;

      // Determine new status
      let newStatus: EventStatus = existing.status;
      if (existing.status !== 'imported' && isChanged) {
        newStatus = 'updated';
      }

      return {
        ...existing,
        ...incoming,
        status: newStatus,
        lastScrapedTime: now
      } as Event;
    }

    // If existing event is NOT in the new scrape results
    // We mark it as 'inactive' unless it was already 'imported' (we might want to keep imported ones)
    // or if it's already 'inactive'.
    if (existing.status !== 'imported' && existing.status !== 'inactive') {
      return {
        ...existing,
        status: 'inactive' as EventStatus,
        lastScrapedTime: now
      };
    }

    return existing;
  });

  // Identify brand new events (in scrape but not in existing list)
  const existingTitles = new Set(currentEvents.map(e => e.title));
  const newEvents: Event[] = scrapedData
    .filter(item => item.title && !existingTitles.has(item.title))
    .map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      status: 'new' as EventStatus,
      lastScrapedTime: now
    } as Event));

  return [...updatedList, ...newEvents];
};
