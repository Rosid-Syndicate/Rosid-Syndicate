
# 🏢 Rosid Syndicates Group - Corporate Website

![Website Status](https://img.shields.io/badge/status-live-success)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4)
![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E)
![Vercel](https://img.shields.io/badge/Vercel-deployed-black)


## 📖 Overview

**Rosid Syndicates Group** is a multi-disciplinary conglomerate based in Nepal, operating across:

- 🏗️ **Construction & Civil Infrastructure**
- 📋 **Procurement & Tender Execution**
- 💰 **Financial Advisory**
- 📦 **Logistics & Supply Chain**
- 🤝 **Public-Private Partnerships**
- 🌍 **International Trade**

This repository contains the complete source code for the **official corporate website**, built as a modern, full-stack web application.


## 🌐 Live Demo

🔗 **Website:** [https://rosid.com.np](https://rosid.com.np)


## 🏗️ Subsidiary Companies

The group operates through **5 specialized subsidiaries**:

| # | Company | Core Focus |
|---|---------|------------|
| 1 | **Roshan Enterprises Pvt. Ltd.** | Construction Supply, Procurement, Retail & Hospitality |
| 2 | **Appi Saipal Financial Solutions Pvt. Ltd.** | Infrastructure Advisory, Bank Guarantees, Financial Closure |
| 3 | **Kasthamandap Commerce and Company Pvt. Ltd.** | Nationwide Trading, Supply Tenders |
| 4 | **B & C Exim Company Pvt. Ltd.** | Import/Export, Distribution Logistics |
| 5 | **Deiyougo Enterprises Pvt. Ltd.** | Government Procurement, Commercial Sourcing |

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | Latest | Animations |
| React Router | v7 | Routing |
| Headless UI | Latest | Accessible Components |
| Heroicons | Latest | Icons |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL Database, Authentication, Storage |
| PostgreSQL | Primary Database |
| Row Level Security (RLS) | Database Security |

### Hosting & Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & Deployment |
| Vercel Serverless Functions | API Endpoints |

### Security

| Service | Purpose |
|---------|---------|
| Cloudflare Turnstile | Bot Protection |
| Resend | Email Delivery |

---

## ✨ Key Features

### Public Website

- ✅ Glassmorphic Navigation Bar - Floating, frosted glass effect
- ✅ Dynamic Hero Canvas - Interactive particle network
- ✅ Mouse-Tracking Spotlight Cards - Cursor-reactive gradients
- ✅ Animated Statistics - Count-up animations on scroll
- ✅ Visual Group Structure - Dark-themed hierarchy tree
- ✅ 6 Subsidiary Pages - Complete company details
- ✅ Appi Saipal Dark Theme - Premium energy sector branding
- ✅ Blog System - Full-featured corporate blog
- ✅ Contact Forms - With bot protection
- ✅ Tender Inquiry Forms - For procurement submissions
- ✅ Mobile Responsive - Works on all devices
- ✅ SEO Optimized - Meta tags, sitemaps

### Admin Dashboard

- ✅ Secure Authentication - Supabase Auth
- ✅ Dashboard Overview - Real-time statistics
- ✅ Inquiry Management - View, filter, respond
- ✅ Subsidiary Management - CRUD operations
- ✅ Content Management - Update company info
- ✅ Blog Management - Create, edit, publish posts
- ✅ Category Management - Manage blog categories

---

## 📁 Project Structure

```
rosid-group-website/
├── public/
│   └── images/               # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Navbar, Footer, etc.
│   │   ├── ui/               # shadcn/ui components
│   │   └── admin/            # Admin layout components
│   ├── pages/                # Page components
│   │   ├── admin/            # Admin dashboard pages
│   │   └── blog/             # Blog pages
│   ├── data/                 # Static data
│   ├── lib/                  # Utilities & configurations
│   ├── contexts/             # React contexts
│   ├── types/                # TypeScript interfaces
│   ├── App.tsx               # Main routing
│   └── main.tsx              # Entry point
├── api/                      # Vercel serverless functions
├── supabase/
│   └── migrations/           # SQL migrations
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/rosid-group/rosid-group-website.git
cd rosid-group-website
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SITE_URL=https://rosid.com.np
```

**4. Start development server**

```bash
npm run dev
```

**5. Build for production**

```bash
npm run build
```

---

## 🗄️ Database Setup

### Supabase Migration

Run the following SQL in your Supabase SQL Editor to set up the database schema:

```sql
-- See supabase/migrations/20260825_blog_system.sql
```

The migration creates:

- `subsidiaries` - Company information
- `inquiries` - Contact/tender submissions
- `blog_posts` - Blog articles
- `blog_categories` - Blog categories
- `company_settings` - Dynamic settings

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Supabase Auth + JWT |
| Database Security | Row Level Security (RLS) |
| Bot Protection | Cloudflare Turnstile |
| Form Validation | Server + Client validation |
| Data Encryption | SSL/TLS in transit |
| Password Hashing | bcrypt |

---

## 📄 License

All rights reserved. © 2026 Rosid Syndicates Group.

---

## 📞 Contact

| Detail | Information |
|--------|-------------|
| Company | Rosid Syndicates Group |
| Address | New Baneshwor, Kathmandu, Nepal |
| Phone | +977-9705398939 |
| Email | rosid2025@outlook.com |
| Website | rosid.com.np |

---

## 🙏 Acknowledgments

- Vercel - Hosting Platform
- Supabase - Backend Infrastructure
- Tailwind CSS - Styling Framework
- React - UI Framework

---

## 🎯 Project Status

| Phase | Status |
|-------|--------|
| Development | ✅ Complete |
| Testing | ✅ Complete |
| Deployment | ✅ Complete |
| Handover | ✅ Ready |


# Built with ❤️ for Rosid Syndicates Group
