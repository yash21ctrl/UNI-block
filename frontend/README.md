# RailBlock AI — Digital Twin Operator Cockpit (Frontend)

**Multi-Agent Corridor Operating System for Indian Railways**  
*Smart India Hackathon 2026 | Problem Statement 26027*

---

## 🚀 Overview

The **RailBlock AI Operator Cockpit** is a mission-control grade digital twin interface built for Indian Railways Section Controllers, Chief Controllers, and Divisional Railway Managers (DRMs). It provides:
1. **Real-time Telemetry Synchronization**: WebSocket streaming from the 6-agent backend (`/api/v1/ws/updates`).
2. **Deterministic Safety Firewall**: Guardian Agent validation guaranteeing 0 premium train collisions (Rajdhani, Shatabdi, Vande Bharat).
3. **High-Performance Gantt Timeline**: 15-minute slot orientation with 6h / 24h / 7d zoom, "NOW" playhead, and multi-department fusion stripes.
4. **Digital Twin Schematic**: Interactive Leaflet map of Northern Railway corridors with station nodes and simulated train movements.
5. **Pareto Frontier Explorer**: Real-time switching between **Safety-Max**, **Throughput-Max**, and **Balanced** CP-SAT profiles.
6. **What-If Counterfactual Simulator**: Dynamic slot shifting evaluating passenger headway buffer breaches before schedule commitment.
7. **Human-in-the-Loop Governance**: Section Controller sign-off with digital signature tokens and instant official Indian Railways Block Sanction Memo PDF export.
8. **Judge-Killer Demo Dock**: 4 one-click cinematic scenarios for presentations and finals.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: TailwindCSS, dark mission-control palette (`#080C14`, `#0B101B`, cyan, amber, emerald, rose)
- **State Management**: Zustand
- **GIS & Maps**: Leaflet (SSR-safe dynamic import)
- **Charts & Data**: Recharts, Lucide Icons, Date-fns
- **Document Export**: jsPDF (Indian Railways Divisional Sanction Memo)
- **Real-Time**: Native WebSockets with auto-reconnection and heartbeat

---

## 📦 Getting Started

### 1. Environment Configuration (`.env.local`)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws/updates
```

### 2. Install & Run Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Page Routes

| Route | Page Name | Purpose |
| :--- | :--- | :--- |
| `/` | **Authentication & Role Selection** | Login screen with Section Controller, Chief Controller, DRM, GM profiles |
| `/cockpit` | **Main Mission Control Cockpit** | Central telemetry dashboard: KPIs, agent status, live alert feed, mini twin, Gantt, and inspector |
| `/twin` | **Digital Twin Network Map** | Full-screen Northern Railway GIS map with 12 corridors, stations, and train markers |
| `/plans/weekly` | **Weekly Possessions Master** | 7-day schedule with Pareto frontier explorer and complete possession breakdown table |
| `/plans/monthly` | **Monthly Strategic Plan** | 30-day corridor capacity planning and track renewal alignment |
| `/simulator` | **What-If Counterfactual Simulator** | Dynamic time-shift slider evaluating passenger headway buffer breaches |
| `/conflicts` | **Conflict Radar & Guardian** | Verification proofs of 0 Rajdhani collisions, headway buffers, and TRD power isolation |
| `/audit` | **AI Decision Ledger & Audit Trail** | Immutable record of agent inferences (SHAP values) and controller digital signatures |

---

## 🎯 3-Minute Judge Demo Click Script (SIH Finals)

Follow this exact path for a winning presentation:

### Minute 0:00 — 0:45: Introduction & Multi-Agent Baseline
1. Start at `/` and select **Section Controller** (`S. K. Sharma, Delhi Division`). Click **Launch RailBlock Mission Control**.
2. Point out the top bar permanent badges:
   - `6-Agent System Live`
   - `Guardian: PROTECTING PREMIUM TRAINS`
   - `Emergency SLA: < 5s (Act: 208ms)`
3. Expand the **Judge Demo Dock** (bottom-right floating badge) and click **1. Baseline 6-Agent Optimize**:
   - Show how the KPI strip updates: 8 possessions, +150m downtime saved, 96.8% AI confidence.
   - Show the 6-agent status panel lights pulsing green.

### Minute 0:45 — 1:30: Multi-Department Fusion
1. Click **2. Multi-Dept Fusion Showcase** in the demo dock:
   - The system automatically highlights the integrated purple-striped block on the Gantt timeline (`BLK-NDLS-001`).
   - The **Explanation Drawer** opens on the right:
     - **Why this block**: Shows Civil Engineering Track Renewal co-located with S&T and TRD, saving 90 minutes downtime.
     - **SHAP drivers**: Shows XGBoost feature importances (crack severity, overdue days, traffic density).
     - **Safety certificate**: Proves 30-min buffer around 12002 Shatabdi.

### Minute 1:30 — 2:15: Emergency Injection (The Money Shot)
1. In the demo dock (or by holding the red top-bar button), click **3. Emergency Rail Fracture**:
   - Watch the live WebSocket event banner pop up in `<1 ms`: `🚨 EMERGENCY INJECTED`.
   - The Gantt timeline reflows in **208.4 ms** (24x faster than the 5,000 ms SLA requirement).
   - An emergency glowing red possession block appears at km 88.4.
   - The Digital Twin map pulses red on the Palwal section.
   - Emphasize to the judges: *Active possessions were frozen and preserved; premium trains (Rajdhani, Shatabdi, Vande Bharat) remained completely undisturbed.*

### Minute 2:15 — 3:00: Human-in-the-Loop Sanction & Official Memo
1. Click **4. Controller Sign-off & PDF**:
   - The Section Controller approval modal appears.
   - Point out the digital signature token (`SEC-CTRL-DELHI-DIV-SIG-9842`).
   - Click **Sanction Plan** $\to$ the decision is cryptographically logged into the AI Decision Ledger.
   - Click **Download Official IR Block Memo (PDF)**.
   - Open the downloaded PDF: show the Indian Railways Northern Railway header, Divisional operating directives, safety conditions, and digital signature block.

---

## ⌨️ Global Keyboard Shortcuts

- `G`: Trigger Full CP-SAT Schedule Generation
- `E`: Trigger Emergency Defect Injection
- `A`: Open Section Controller Digital Sanction Modal
- `S`: Navigate to What-If Simulator
