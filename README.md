# RailBlock AI — Multi-Agent Corridor Operating System
### Smart India Hackathon 2026 | Problem Statement 26027

[![Live Production](https://img.shields.io/badge/Production-Live%20on%20Vercel-059669?style=for-the-badge&logo=vercel)](https://railblock-ai-six.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015%20React%2019-000000?style=for-the-badge&logo=nextdotjs)](https://railblock-ai-six.vercel.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python-009688?style=for-the-badge&logo=fastapi)](https://railblock-ai-six.vercel.app)

RailBlock AI is an enterprise, multi-agent, explainable, self-healing AI platform tailored for **Indian Railways**. It unifies maintenance inputs across **TMS** (Track Management System), **SMMS** (Signaling Maintenance Management System), **TDMS** (Traction Distribution Management System), and **COA** (Control Office Application) to automatically synthesize conflict-free, Pareto-optimized weekly and monthly block schedules.

---

## 🌐 Live Web Portals (Direct Access)

All portals are deployed and operational 24/7 on Vercel:

| Portal / Subsystem | Live Production URL | Key Operational Capabilities |
| :--- | :--- | :--- |
| 🎛️ **Section Controller Central Cockpit** | **[Open Cockpit](https://railblock-ai-six.vercel.app/cockpit)** | Pareto profile optimization, 6-agent multi-agent status, joint block fusion, live Gantt chart |
| 🚉 **Station Master Operating Terminal** | **[Open Station Master Terminal](https://railblock-ai-six.vercel.app/station)** | Form T/351 Line Clear Disconnection Memos, station interlocking, physical QR verification |
| 📱 **Field Junior Engineer Terminal** | **[Open Field JE Portal](https://railblock-ai-six.vercel.app/field/request)** | Requisition submission, track defect photo dossiers, dynamic QR possession token |
| 🗺️ **Karnataka Digital Twin GIS** | **[Open Karnataka Twin GIS](https://railblock-ai-six.vercel.app/twin)** | 159 Karnataka stations, 12 corridors, live ISRO RTIS train telemetry, dual GIS engines |
| ⚡ **Field Demands & Sanction Desk** | **[Open Demands Desk](https://railblock-ai-six.vercel.app/cockpit/requests)** | Section Controller review of pending requisitions, damage inspections & block allocation |
| 🛡️ **SIL-4 Safety Audit Ledger** | **[Open Audit Ledger](https://railblock-ai-six.vercel.app/audit)** | Immutable audit records, zero-conflict certifications & SHAP explainability |

---

## 🌟 Architecture Overview

```
                      +-----------------------------+
                      |   Orchestrator Controller   |
                      +--------------+--------------+
                                     |
       +---------------+-------------+-------------+---------------+
       |               |             |             |               |
+------v-----+  +------v-----+ +-----v------+ +----v-------+ +-----v------+
| Ingestion  |  |  Priority  | |   Fusion   | | Optimizer  | |  Guardian  |
|   Agent    |  |   Agent    | |   Agent    | |   Agent    | |   Agent    |
| TMS/SMMS/  |  | XGBoost +  | | Integrated | |  Google    | | Safety &   |
| TDMS/COA   |  |   SHAP     | | Multi-Dept | |  OR-Tools  | | Premium Tr.|
+------------+  +------------+ +------------+ +------------+ +------------+
                                     |
                               +-----v------+
                               | Explainer  |
                               |   Agent    |
                               | NL + Graph |
                               +------------+
```

---

## 📁 Repository Structure

```
railblock-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── logging.py
│   │   │   ├── exceptions.py
│   │   │   └── security.py
│   │   ├── models/           # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/          # Canonical Pydantic v2 schemas
│   │   ├── agents/           # Specialized multi-agents (Phase 2+)
│   │   ├── routers/          # FastAPI API endpoints
│   │   ├── services/         # Business & domain services
│   │   └── utils/
│   │       ├── synthetic_data.py   # Indian Railways realistic data engine
│   │       └── seed_db.py          # Database seeding CLI
│   ├── tests/                # Pytest suite
│   ├── alembic/              # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 # Next.js 15 UI workspace
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Docker & Docker Compose (optional for local SQLite execution, required for full TimescaleDB/Redis stack)

### 2. Environment Setup
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
```

### 3. Docker Launch (PostgreSQL + TimescaleDB + Redis + FastAPI)
```bash
docker-compose up --build -d
```

### 4. Database Seeding
To populate the database with realistic Indian Railways corridors (NDLS-AGC, AGC-JHS, etc.), 500+ assets, 5,000+ historical tasks, and 200+ train schedules:
```bash
cd backend
python -m app.utils.seed_db
```

### 5. Running Tests
```bash
cd backend
pytest -v
```

### 6. Interactive API Documentation
Navigate to `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc` (ReDoc) once the FastAPI server is running.
