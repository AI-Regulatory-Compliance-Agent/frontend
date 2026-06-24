# 🖥️ ComplianceAI — Frontend

> React + Vite dashboard for the AI Regulatory Compliance Agent. Provides a modern, responsive interface for submitting compliance analyses, tracking real-time agent progress via SSE, visualizing risk scores, and downloading PDF reports.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](../backend/LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [Hooks](#hooks)
- [API Client](#api-client)
- [Local Development](#local-development)
- [Tech Stack](#tech-stack)

---

## Overview

The frontend is a single-page React application that communicates with the FastAPI backend via REST APIs and Server-Sent Events (SSE). It handles:

- **User authentication** (JWT-based login/register)
- **Company profile forms** with adaptive fields based on analysis mode and information availability
- **Real-time agent progress tracking** showing which of the 5 agents is currently running
- **Risk visualization** with score gauges, range bars, and gap breakdowns
- **Analysis history** with a sidebar for quick access to past analyses
- **PDF report downloads** for completed compliance analyses

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth Flow** | JWT-based login/register with protected routes |
| 📝 **Multi-Mode Forms** | Adaptive company profile forms (self/external, full/partial/minimal) |
| 📄 **Document Upload** | PDF/DOC/DOCX upload for additional compliance context |
| ⚡ **Live Progress** | SSE-powered real-time agent execution tracking |
| 📊 **Risk Dashboard** | Visual risk scores, gap analysis, and severity breakdown |
| 📥 **PDF Download** | One-click compliance report download |
| 📜 **Analysis History** | Sidebar navigation through all past analyses |
| 🎨 **Dark Theme** | Modern dark-themed UI with CSS custom properties |

---

## Screenshots

> *Run the application locally to see the full UI. The dashboard features a dark theme with glassmorphism effects, dynamic animations, and responsive layouts.*

---

## Project Structure

```
frontend/
├── Dockerfile              # Node 20-alpine, Vite dev server
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
│
├── public/                 # Static assets
│
└── src/
    ├── main.jsx            # React entry point (ReactDOM.createRoot)
    ├── App.jsx             # Root component with routing
    ├── index.css           # Global styles, CSS variables, dark theme
    │
    ├── api/
    │   └── client.js       # Axios instance & API call functions
    │
    ├── context/
    │   └── AuthContext.jsx  # React Context for authentication state
    │
    ├── hooks/
    │   ├── useAuth.js       # Login/register/logout hook
    │   ├── useAnalysis.js   # Analysis submission & result fetching
    │   └── useSSE.js        # Server-Sent Events connection hook
    │
    ├── pages/
    │   ├── LoginPage.jsx    # User login page
    │   ├── RegisterPage.jsx # User registration page
    │   ├── DashboardPage.jsx# Main dashboard (form + results + sidebar)
    │   └── AnalysisPage.jsx # Analysis results display
    │
    └── components/
        ├── Sidebar.jsx          # Analysis history navigation
        ├── CompanyForm.jsx      # Multi-step company profile form
        ├── AgentProgress.jsx    # Real-time agent execution tracker
        ├── RiskDashboard.jsx    # Risk metrics & gap visualization
        └── ReportDownload.jsx   # PDF report download button
```

---

## Pages & Routes

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/login` | `LoginPage` | 🔓 Public | Email/password login form |
| `/register` | `RegisterPage` | 🔓 Public | New user registration form |
| `/dashboard` | `DashboardPage` | 🔒 Protected | Main analysis dashboard |
| `*` | — | — | Redirects to `/dashboard` (→ `/login` if unauthenticated) |

### Route Protection

The `ProtectedRoute` wrapper component checks `AuthContext`:
- If **loading**: shows a spinner
- If **not authenticated**: redirects to `/login`
- If **authenticated**: renders the child component

---

## Components

### `CompanyForm`
The largest component (~29KB). Renders an adaptive multi-step form based on:
- **Analysis Mode**: `self` (own company) vs `external` (another company)
- **Analysis Type**: `product`, `service`, or `company`
- **Information Availability**: `full`, `partial`, or `minimal` — controls which form fields are shown

Form sections include: company identity, business details, data types, user regions, technical architecture (full mode), document uploads (partial/full mode), and existing compliance certifications.

### `AgentProgress`
Displays real-time progress of the 5-agent pipeline using data from the SSE hook. Shows which agent is currently running, completed, or pending.

### `RiskDashboard`
Visualizes compliance analysis results:
- **Risk score gauge** (single score for full mode, range bar for partial/minimal)
- **Gap breakdown** with severity indicators
- **Regulation compliance status**
- **Remediation plan** with priorities and timelines

### `Sidebar`
Lists all past analyses with timestamps. Clicking an entry loads its results into the dashboard.

### `ReportDownload`
Button component that triggers PDF report download from the backend.

---

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Provides `isAuthenticated`, `loading`, `login()`, `register()`, `logout()` from AuthContext |
| `useAnalysis()` | Handles analysis submission, document uploads, and result fetching |
| `useSSE()` | Manages SSE connection to `/analysis/stream/{session_id}` for real-time progress |

---

## API Client

The `api/client.js` file configures an Axios instance pointing to `http://localhost:8000` with automatic JWT token injection via request interceptors.

---

## Local Development

### With Docker (Recommended)

```bash
cd Infrastructure
docker compose up --build frontend
```

The frontend will be available at **http://localhost:5173**.

### Standalone

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> **Note:** The frontend requires the backend to be running at `http://localhost:8000`. Use Docker Compose for the full stack.

### Build for Production

```bash
npm run build    # Outputs to dist/
npm run preview  # Preview production build
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.2 |
| **Build Tool** | Vite 8.0 |
| **Routing** | React Router DOM 7.18 |
| **HTTP Client** | Axios 1.18 |
| **Styling** | Vanilla CSS with custom properties |
| **Linting** | ESLint 10 |
| **Container** | Node 20-alpine |
