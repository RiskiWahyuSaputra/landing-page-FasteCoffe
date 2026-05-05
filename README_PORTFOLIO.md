# Faste Coffee - Portfolio Ready Documentation

## 📋 Project Overview

**Faste Coffee** is a production-ready coffee shop landing page with complete e-commerce functionality. Features immersive scroll animations, dynamic menu, cart/checkout, and full admin dashboard. Built for high performance and visual appeal.

**Screenshots/Demo:** Run `npm run dev` → localhost:3000

## 🎯 Key Features

- Hero with 120-frame canvas sequence animation
- Interactive menu filtering + cart drawer
- Realtime order/stock updates (WebSockets)
- Admin panel: orders, menu management, reports, dashboard
- Multi-language support
- Glassmorphism UI + magnetic interactions

## 🛠️ Tech Stack

### Frontend

```
Next.js 14 (App Router)    • SSR + API routes
TypeScript                 • Full type safety
Tailwind CSS               • Custom themes (copper/cream)
Framer Motion 11           • Advanced animations
Lenis                      • Smooth scrolling
Laravel Echo + Pusher      • Realtime
```

### Backend

```
Laravel 12                 • REST API + auth
PHP 8.2                    • Controllers (OrderController)
Laravel Reverb             • WebSockets
Eloquent ORM               • Menu/Orders models
```

## 🚀 Quick Start

```bash
# Frontend
npm install && npm run dev

# Backend (cd backend)
composer install
php artisan migrate
php artisan serve  # API: localhost:8000
```

## 🏗️ Architecture

```
Frontend: app/ (pages) → components/ (SequenceScroll, CartProvider, AdminSidebar)
Backend:  app/Http/Controllers/Api/ → routes/api.php
Realtime: Reverb + Echo (lib/reverb-client.ts)
```

## 💼 Why Portfolio-Worthy?

- **Animations**: Custom sequence scroller (120 JPGs → canvas)
- **Full-Stack**: Next.js ↔ Laravel API (lib/laravel-admin-api.ts)
- **Production**: Admin CRUD, checkout flow, realtime updates
- **Modern**: App Router, Tailwind v3, Framer Motion 11, TypeScript

**Admin Demo:** /admin/dashboard (orders, menu editor, reports)

---

_Built with ❤️ for modern e-commerce experiences_
