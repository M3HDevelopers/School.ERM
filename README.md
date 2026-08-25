# Markaz ERP - School Management System

A complete school management system built with React, TypeScript, and Vite.

## Features

- **Dashboard**: Role-specific dashboards with KPIs, charts, and alerts
- **Student Management**: Student records, admission, and profiles
- **Admissions**: CRM for leads and enrollment funnel
- **Attendance**: Daily attendance marking and reports
- **Fees**: Challan generation, payment collection, and receipts
- **Exams**: Mark entry, result cards, and mark sheets
- **Timetable**: Class schedules
- **HR**: Staff management, payroll, and leave applications
- **Operations**: Library, transport, and inventory management
- **Communication**: Announcements via WhatsApp, SMS, Email, and App
- **Reports**: Analytics and data exports
- **Settings**: School configuration and branding/themes

## User Roles

- **Admin**: Full access to all modules
- **Teacher**: Class management, attendance, and marks
- **Student**: View fees, timetable, and results
- **Parent**: Children's info, fees, and attendance

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Recharts
- @dnd-kit (drag & drop)
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Deployment

This project is ready to be deployed on GitHub Pages, Vercel, Netlify, or any static hosting service.

### GitHub Pages

1. Build the project: `npm run build`
2. The `dist` folder contains the production-ready files
3. Push to GitHub and enable GitHub Pages in repository settings
4. Set the source to the `dist` folder or use a deployment action

### Vercel/Netlify

Simply connect your GitHub repository and it will automatically detect the Vite build settings.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components for each module
├── store.tsx       # Centralized state management
├── data/           # Demo data and seed files
├── App.tsx         # Main app component with routing
└── main.tsx        # Entry point
```

## License

Private - All rights reserved
