# Admin Dashboard UI

A modern React admin dashboard built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🔐 Authentication system with login page
- 📊 Multiple dashboard pages (Revenue, Posts, Employees, Payments, System Performance, API Config)
- 🎨 Beautiful UI components from shadcn/ui
- ⚡ Fast development with Vite
- 📱 Responsive design

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/        # Admin-specific components
│   │   └── ui/            # Reusable UI components
│   ├── AdminApp.tsx      # Main app component with routing
│   └── App.tsx            # Root component
├── assets/                # Images and static assets
├── styles/                # Global styles
└── main.tsx               # Entry point
```
