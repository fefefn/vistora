# 🛒 NexCart

A modern, full-stack **MERN** e-commerce application built with **TypeScript** end to end.
This repository is structured phase by phase — **Phase 1** is the project setup and foundation.

> **Status:** Phase 1 — Project Setup ✅ (no auth / products / cart / orders yet)

---

## 🧱 Tech Stack

**Frontend**

| Tool | Purpose |
| --- | --- |
| React + TypeScript + Vite | UI library, typing, dev/build tooling |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing |
| Redux Toolkit + React Redux | Global state management |
| TanStack Query | Server state / data fetching |
| Axios | HTTP client |
| Lucide React | Icons |
| Framer Motion | Animations |

**Backend**

| Tool | Purpose |
| --- | --- |
| Node.js + Express + TypeScript | API server + typing |
| MongoDB + Mongoose | Database + ODM |
| CORS | Cross-origin access for the frontend |
| dotenv | Environment variables |
| Helmet | Secure HTTP headers |
| Morgan | Request logging |
| bcryptjs, jsonwebtoken | Reserved for auth (later phase) |
| tsx | Run TypeScript in dev without a build step |

---

## 📁 Project Structure

```
nexcart/
├── frontend/                 # React + TS + Vite app
│   └── src/
│       ├── components/       # Reusable UI (Navbar, Footer, ...)
│       ├── pages/            # Route pages (Home, Shop, ...)
│       ├── layouts/          # Page shells (MainLayout)
│       ├── hooks/            # Custom hooks (useHealthCheck)
│       ├── services/         # Axios client + API calls
│       ├── redux/            # Store, slices, typed hooks
│       ├── types/            # Shared TypeScript types
│       ├── utils/            # Constants & helpers
│       ├── App.tsx           # Route table
│       └── main.tsx          # App entry + providers
│
├── backend/                  # Node + Express + TS API
│   └── src/
│       ├── config/           # env + Mongo connection
│       ├── controllers/      # Request handlers
│       ├── middleware/       # errorHandler, notFound
│       ├── models/           # Mongoose models (later phase)
│       ├── routes/           # Route definitions
│       ├── services/         # Business logic (later phase)
│       ├── utils/            # Helpers (asyncHandler)
│       ├── types/            # Shared TypeScript types
│       └── server.ts         # App entry
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional for Phase 1) MongoDB running locally or a MongoDB Atlas URI

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit values as needed
npm run dev               # starts http://localhost:5000
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev               # starts http://localhost:5173
```

---

## 🔌 Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nexcart
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## ✅ Health Check

With the backend running:

```bash
curl http://localhost:5000/api/health
```

```json
{
  "success": true,
  "message": "NexCart API is running"
}
```

The homepage also shows a live **“API connected”** badge that calls this endpoint.

---

## 🗺️ Roadmap

- [x] **Phase 1** — Project setup, routing, layout, health check
- [ ] Phase 2 — Auth (register / login, JWT, protected routes)
- [ ] Phase 3 — Products (models, catalog, search & filters)
- [ ] Phase 4 — Cart & Wishlist
- [ ] Phase 5 — Orders & checkout
- [ ] Phase 6 — Admin dashboard

---

## 📄 License

MIT
