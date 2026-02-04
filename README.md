# SydEvents Pro — Technical Assessment

A high-performance, AI-driven event discovery and management platform built for the Sydney market. This project demonstrates modern frontend engineering, real-time data extraction via Large Language Models (LLMs), and a sophisticated administrative workflow.

---

## 🚀 Project Overview

SydEvents Pro is designed as a full-cycle event platform. It doesn't just display data; it manages the **discovery pipeline**. 

- **Consumer Feed**: A premium, responsive interface for users to discover verified events, get personalized recommendations via an AI assistant, and subscribe to categories.
- **Operational Pipeline**: A restricted "Admin" environment where raw event data is scraped using AI, audited for quality, and then "imported" into the public distribution channel.

## 🛠 Technical Stack

- **Core**: React 19 (Hooks, Context), TypeScript (Strict Mode).
- **Styling**: Tailwind CSS (JIT mode) for a bespoke "SaaS-grade" visual language.
- **Intelligence Layer**: 
  - **Gemini 3.0 Pro**: Powers the structured extraction of event data from unstructured web-like contexts.
  - **Gemini 3.0 Flash**: Drives the real-time chat assistant for low-latency recommendations.
- **Persistence**: A Repository Pattern abstraction over `LocalStorage` to simulate a stateful backend with high reliability.
- **Authentication**: Dual-path system using Google Identity Services (GIS) for standard users and a secure Developer Bypass for evaluation.

## ✨ Key Architectural Features

### 1. Automated "AI Scraper"
Located in `services/eventService.ts`, the platform uses a "Sync Engine" that:
- Calls Gemini to discover real-world event data.
- Performs a **Heuristic Merge**: It compares incoming data with the existing store to identify if events are `new`, `updated`, or `inactive`.
- Ensures data integrity through structured JSON schema enforcement.

### 2. Operational Control Center (Dashboard)
- **KPI Metrics**: Real-time business analytics (Pipeline Capacity, Lead Conversion, etc.).
- **Audit Logging**: Every event published to the feed is timestamped and signed by the importing admin with metadata notes.
- **Lead Capture**: A professional CRM-lite view to manage user expressions of interest.

### 3. Context-Aware AI Assistant
The `ChatAssistant` component doesn't just chat; it's integrated with the event store. It uses the current list of events as a context window to provide 100% relevant local recommendations. It also features a **Subscription Heuristic** that identifies user interests and suggests category sign-ups.

## 🛡️ Evaluation Instructions (For Reviewers)

### Reviewer Login (Admin Access)
To allow immediate evaluation of the **Admin Dashboard** and **Scraping Engine** without requiring you to configure a local Google Cloud Project:
1. Look for the **"Reviewer Login"** button in the top navigation bar.
2. Clicking this grants full `admin` privileges instantly.
3. You can then navigate to the "Dashboard" and click **"Initiate Sync"** to see the AI scraper in action.

### Production Google Auth
The app is fully prepped for production. If you wish to test real Google OAuth:
1. Open `services/authService.ts`.
2. Replace `GOOGLE_CLIENT_ID` with your valid GCP Client ID.
3. Ensure your origin is whitelisted in the Google Cloud Console.

## 🏗 Coding Standards
- **Repository Pattern**: All database interactions are encapsulated in `dbService.ts`.
- **Type Safety**: End-to-end TypeScript interfaces ensure data consistency from scraping to rendering.
- **UX Excellence**: Implemented glass-morphism, transient toast notifications, and smooth scroll transitions for a "Product-First" feel.

---
*Developed as a professional technical submission • 2024*
