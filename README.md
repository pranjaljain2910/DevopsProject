# 🚨 Alert Routing & Escalation Manager

A production-ready full-stack application that simulates how modern incident management platforms (like PagerDuty/Opsgenie) route alerts and escalate them automatically.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Express-MongoDB-green) ![Style](https://img.shields.io/badge/TailwindCSS-Dark_Mode-purple)

---

## ✨ Features

- **User & Team Management** — Create users, form teams, assign roles
- **Alert Rules Engine** — Define conditions that auto-route alerts to the right team
- **Alert Simulation** — Quick-trigger preset scenarios or create custom alerts
- **Escalation Policies** — Step-based escalation chains with configurable delays
- **Real-time Dashboard** — Live alert monitoring with auto-polling, filters, and action buttons
- **Alert Logging** — Full audit trail of every event (trigger, assign, escalate, ack, resolve)
- **Dark DevOps UI** — Modern glassmorphism design with smooth animations

---

## 🔧 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, Vite, TailwindCSS v4, React Router, Axios |
| Backend    | Node.js, Express                  |
| Database   | MongoDB, Mongoose                 |
| Tools      | dotenv, uuid, concurrently, nodemon |

---

## 📁 Project Structure

```
alert-manager/
├── backend/
│   ├── models/          # Mongoose schemas (User, Team, Rule, Alert, Policy, Log)
│   ├── routes/          # Express REST API routes
│   ├── services/        # Alert engine (routing, escalation, acknowledgement)
│   ├── server.js        # Express entry point
│   ├── seed.js          # Database seed script
│   └── .env             # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios HTTP client
│   │   ├── components/  # Reusable UI (Sidebar, Badge, Modal, Card)
│   │   ├── pages/       # Dashboard, Simulation, Rules, Escalation, Users
│   │   ├── App.jsx      # Root layout with router
│   │   └── index.css    # TailwindCSS + custom dark theme
│   └── vite.config.js   # Vite config with API proxy
├── package.json         # Root scripts (dev, seed, install)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally on `mongodb://localhost:27017`
  - Or update `backend/.env` with your MongoDB Atlas URI

### Installation

```bash
# From the root alert-manager/ directory:

# 1. Install root dependencies (concurrently)
npm install

# 2. Install all project dependencies
npm run install:all

# 3. Seed the database with sample data
npm run seed

# 4. Start both frontend and backend
npm run dev
```

### Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/users`                    | Create user              |
| GET    | `/users`                    | List all users           |
| DELETE | `/users/:id`                | Delete user              |
| POST   | `/teams`                    | Create team              |
| GET    | `/teams`                    | List all teams           |
| DELETE | `/teams/:id`                | Delete team              |
| POST   | `/rules`                    | Create alert rule        |
| GET    | `/rules`                    | List all rules           |
| PUT    | `/rules/:id`                | Update rule              |
| DELETE | `/rules/:id`                | Delete rule              |
| POST   | `/alerts`                   | Trigger new alert        |
| GET    | `/alerts`                   | List alerts (filterable) |
| PATCH  | `/alerts/:id/acknowledge`   | Acknowledge alert        |
| PATCH  | `/alerts/:id/resolve`       | Resolve alert            |
| GET    | `/alerts/:id/logs`          | Get alert timeline       |
| POST   | `/policies`                 | Create escalation policy |
| GET    | `/policies`                 | List all policies        |
| DELETE | `/policies/:id`             | Delete policy            |

---

## 🧠 Core Logic Flow

```
Alert Triggered → Match Rule → Assign Team → Attach Escalation Policy
    ↓
Start Timer (step 0)
    ↓
If NOT acknowledged within delay → Escalate to step 1 → Notify next
    ↓
If NOT acknowledged → Escalate to step 2 → ...
    ↓
If acknowledged → Stop escalation ✓
If resolved → Stop escalation + close ✓
```

---

## 📝 License

MIT
