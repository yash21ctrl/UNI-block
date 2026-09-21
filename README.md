# RailBlock AI — Multi-Agent Corridor Operating System
### Smart India Hackathon 2026 | Problem Statement 26027

RailBlock AI is an enterprise, multi-agent, explainable, self-healing AI platform tailored for **Indian Railways**. It unifies maintenance inputs across **TMS** (Track Management System), **SMMS** (Signaling Maintenance Management System), **TDMS** (Traction Distribution Management System), and **COA** (Control Office Application) to automatically synthesize conflict-free, Pareto-optimized weekly and monthly block schedules.

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
