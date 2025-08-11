# Tu-Dum Task Tracker

A modern, intuitive task management application built with Next.js 15, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time task management, and a beautiful glassmorphism UI.

![Tu-Dum Task Tracker](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.0-green)

## ✨ Features

- **🔐 Google OAuth Authentication** - Secure, one-click sign-in
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚡ Real-time Updates** - Instant task synchronization
- **🎨 Modern UI** - Glassmorphism design with smooth animations
- **🏷️ Task Organization** - Filter by status, priority, and categories
- **🔍 Smart Search** - Find tasks quickly with intelligent search
- **📊 Progress Tracking** - Visual stats dashboard with task counts
- **🌐 PWA Ready** - Install as a native app

## 🚀 Demo

**Live Demo:** [https://tudum-ivory.vercel.app](https://tudum-ivory.vercel.app)

## 🛠️ Tech Stack

- **Framework:** Next.js 15.4.6 with App Router
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Google OAuth
- **Styling:** Tailwind CSS 3.4.0
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

### 1. Clone the repository

git clone https://github.com/yourusername/tu-dum-task-tracker.git
cd tu-dum-task-tracker


### 2. Install dependencies

npm install
or
yarn install


### 3. Set up Supabase

1. Create a new Supabase project
2. Run the following SQL in your Supabase SQL Editor:

-- Create profiles table
CREATE TABLE profiles (
id UUID REFERENCES auth.users(id) PRIMARY KEY,
email TEXT,
name TEXT,
avatar_url TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
title TEXT NOT NULL,
description TEXT,
status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
category TEXT,
due_date TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);


### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Supabase callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Environment Variables

Create a `.env.local` file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


### 6. Run the development server

npm run dev
or
yarn dev


Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

## 🏗️ Project Structure

**Core App Files:**
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Landing page  
- `src/app/globals.css` - Global styles

**Authentication:**
- `src/app/auth/callback/page.tsx` - OAuth callback handler

**Dashboard:**
- `src/app/dashboard/layout.tsx` - Dashboard layout with navbar
- `src/app/dashboard/page.tsx` - Main dashboard page

**Task Components:**
- `src/components/task/TaskCard.tsx` - Individual task component
- `src/components/task/TaskFilters.tsx` - Filter controls
- `src/components/task/TaskForm.tsx` - Task creation/edit form

**Utilities:**
- `src/components/ui/` - Reusable UI components
- `src/hooks/useAuth.ts` - Authentication hook
- `src/lib/supabase/client.ts` - Supabase client setup
- `src/lib/tasks.ts` - Task service layer
- `src/types/database.ts` - TypeScript types



## 🎯 Key Features Breakdown

### Authentication
- Google OAuth integration
- Persistent sessions
- Secure logout with state cleanup

### Task Management
- **Create** - Add tasks with title, description, priority, category
- **Read** - View all tasks with filtering and search
- **Update** - Edit task details and status
- **Delete** - Remove completed or unwanted tasks

### UI/UX
- **Glassmorphism Design** - Modern transparent backgrounds
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - Hover effects and transitions
- **Loading States** - User feedback during operations

### Performance
- **Server-Side Rendering** - Fast initial load
- **Optimistic Updates** - Instant UI feedback
- **Efficient Queries** - Row-level security with minimal data transfer

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Update Supabase Settings

In your Supabase dashboard:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide](https://lucide.dev/) for beautiful icons


**Built with ❤️**

⭐ Star this repo if you found it helpful!

