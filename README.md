# Realtime Coaching Feed Application ⚡

### 🔗 **Live Demo URL**: [https://live-coaching-feed.vercel.app](https://live-coaching-feed.vercel.app)

A professional, aesthetic realtime application designed to allow coaches to broadcast feeds instantly to players/users without refreshing the page.

## Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Socket.IO Client, Lucide React
- **Backend**: Node.js, Express, Socket.IO
- **Database**: PostgreSQL
- **Cache**: Redis

## Features
- **Realtime Updates**: New feeds appear instantly via WebSockets (Socket.IO).
- **Redis Caching**: Feeds are heavily cached in Redis. New feeds automatically invalidate the cache.
- **Deduplication**: Socket events are tracked via connection sets and UUIDs to prevent duplicated feeds.
- **Premium UI**: Built with Tailwind CSS, dark mode support, and micro-animations for an elevated user experience.

## Quick Start

### 1. Infrastructure (Database & Cache)
If you have Docker installed, spin up PostgreSQL and Redis:
```bash
docker-compose up -d
```
*(Alternatively, update `backend/.env` to point to your existing PostgreSQL/Redis instances).*

### 2. Backend API
1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:3001`):
   ```bash
   npm run dev
   ```

### 3. Frontend Web App
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Start the development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

## Usage
- **Home (`/`)**: View live feeds. A green status indicator shows active Socket.IO connection.
- **Admin (`/admin`)**: Form to create and broadcast new coaching feeds instantly.