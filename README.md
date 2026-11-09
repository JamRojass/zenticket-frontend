Zendticket Frontend

Project Overview

Zendticket Frontend is a modern, responsive single-page application built with Vue 3 (Composition APIs), Vite, Pinia (State Management), Vue Router, and Tailwind CSS. It provides the client-facing interfaces, operator desks, waiting room TV displays, touch kiosks, and administrative dashboards for multi-tenant queue management.

Project Structure

ticketing-frontend/
├── index.html
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── api.js
│   ├── assets/
│   │   └── main.css
│   ├── stores/
│   │   └── authStore.js
│   ├── views/
│   │   ├── OperatorView.vue
│   │   ├── LoginView.vue
│   │   ├── DisplayView.vue
│   │   ├── HomeView.vue
│   │   ├── AdminView.vue
│   │   ├── KioskView.vue
│   │   ├── RegisterCompanyView.vue
│   │   └── admin/
│   │       ├── TicketsView.vue
│   │       ├── StaffView.vue
│   │       ├── SettingView.vue
│   │       ├── DisplaysView.vue
│   │       ├── AuditView.vue
│   │       ├── StationsView.vue
│   │       └── AreasView.vue
    └── components/
        ├── ConfirmModal.vue
        └── Navbar.vue


Deployment & Local Setup Guide

Prerequisites

Node.js (v16.0 or higher recommended).

npm or yarn package manager.

A running instance of the Zendticket Backend API.

Step 1: Open the Frontend Project Directory

Navigate into the root directory of your frontend project:

cd ticketing-frontend


Step 2: Install Dependencies

Install all required packages using npm:

npm install


Step 3: Configure Environment Variables

Ensure you have a .env file (or Vite configuration pointing to the correct API base URL) in your root directory if your backend runs on a custom port:

VITE_API_BASE_URL=http://localhost:8000


Step 4: Run the Development Server

Start the Vite development server locally:

npm run dev


Once running, you can access the application in your browser at:

Local URL: http://localhost:5173

Step 5: Build for Production

To generate an optimized production build of the frontend:

npm run build
