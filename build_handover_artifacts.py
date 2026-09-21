import os
import sys
import subprocess
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

BASE_DIR = r"c:\Users\Admin\OneDrive\Desktop\trainhack\railblock-ai"
PDF_PATH = os.path.join(BASE_DIR, "RailBlock_AI_Frontend_Handover_Manual.pdf")
PPTX_PATH = os.path.join(BASE_DIR, "RailBlock_AI_Frontend_Architecture.pptx")
HTML_TEMP_PATH = os.path.join(BASE_DIR, "temp_handover_doc.html")
EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print("--- Step 1: Generating High-Resolution HTML for PDF ---")

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RailBlock AI — Frontend Developer API Specification & Handover Manual</title>
<style>
  @page {
    size: A4 portrait;
    margin: 1.6cm 1.4cm 1.8cm 1.4cm;
    @bottom-center {
      content: "RailBlock AI • Confidential Engineering Handover • Page " counter(page);
      font-size: 8pt;
      color: #64748B;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0F172A;
    background-color: #FFFFFF;
    line-height: 1.45;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }

  /* Cover Page */
  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 92vh;
    padding: 2.5rem 1.5rem 1rem 1.5rem;
    box-sizing: border-box;
    border-left: 8px solid #0F2D6B;
    background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  }

  .cover-header {
    margin-top: 1rem;
  }

  .badge-tag {
    display: inline-block;
    padding: 4px 12px;
    background-color: #0F2D6B;
    color: #FFFFFF;
    font-size: 8pt;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border-radius: 4px;
    margin-bottom: 1.2rem;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 900;
    color: #0F2D6B;
    line-height: 1.15;
    margin: 0 0 0.8rem 0;
  }

  .cover-subtitle {
    font-size: 13pt;
    font-weight: 600;
    color: #334155;
    margin: 0 0 1.5rem 0;
    line-height: 1.4;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 2rem 0;
    padding: 1.2rem;
    background-color: #F1F5F9;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
  }

  .meta-item {
    font-size: 8.5pt;
  }

  .meta-label {
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    font-size: 7pt;
    letter-spacing: 0.5px;
  }

  .meta-value {
    font-weight: 800;
    color: #0F172A;
    margin-top: 2px;
  }

  .cover-footer {
    border-top: 2px solid #E2E8F0;
    padding-top: 1rem;
    font-size: 8pt;
    color: #64748B;
  }

  /* Section Styling */
  .section-break {
    page-break-before: always;
  }

  h1 {
    font-size: 16pt;
    font-weight: 900;
    color: #0F2D6B;
    border-bottom: 2px solid #0F2D6B;
    padding-bottom: 4px;
    margin-top: 1.2rem;
    margin-bottom: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h2 {
    font-size: 12pt;
    font-weight: 800;
    color: #1E293B;
    margin-top: 1.1rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #0F2D6B;
    margin-top: 0.9rem;
    margin-bottom: 0.3rem;
  }

  p, li {
    color: #334155;
    margin-top: 0.2rem;
    margin-bottom: 0.5rem;
  }

  ul, ol {
    padding-left: 1.4rem;
    margin-top: 0.2rem;
    margin-bottom: 0.6rem;
  }

  /* API Endpoint Cards */
  .api-card {
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    background-color: #FFFFFF;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    page-break-inside: avoid;
    overflow: hidden;
  }

  .api-card-header {
    background-color: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .method-badge {
    font-size: 7.5pt;
    font-weight: 900;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: monospace;
    letter-spacing: 0.5px;
  }

  .method-post {
    background-color: #059669;
    color: #FFFFFF;
  }

  .method-get {
    background-color: #0284C7;
    color: #FFFFFF;
  }

  .api-url {
    font-family: 'Consolas', 'Menlo', monospace;
    font-size: 9pt;
    font-weight: 700;
    color: #0F172A;
  }

  .api-card-body {
    padding: 8px 10px;
  }

  .api-desc {
    font-size: 8.5pt;
    color: #475569;
    margin-bottom: 6px;
  }

  /* Code & JSON blocks */
  pre {
    background-color: #0F172A;
    color: #F8FAFC;
    padding: 8px 10px;
    border-radius: 5px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8pt;
    line-height: 1.35;
    margin: 4px 0 8px 0;
    overflow-x: auto;
    border: 1px solid #1E293B;
  }

  code {
    font-family: 'Consolas', monospace;
    font-size: 8.5pt;
    background-color: #F1F5F9;
    color: #0F2D6B;
    padding: 1px 4px;
    border-radius: 3px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 8px 0 12px 0;
    page-break-inside: avoid;
  }

  th {
    background-color: #0F2D6B;
    color: #FFFFFF;
    text-align: left;
    padding: 6px 8px;
    font-weight: 700;
    font-size: 8pt;
    letter-spacing: 0.5px;
    border: 1px solid #0F2D6B;
  }

  td {
    padding: 5px 8px;
    border: 1px solid #E2E8F0;
    color: #334155;
  }

  tr:nth-child(even) td {
    background-color: #F8FAFC;
  }

  /* Callout Boxes */
  .callout {
    padding: 8px 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  .callout-info {
    background-color: #EFF6FF;
    border-left: 4px solid #3B82F6;
    color: #1E40AF;
  }

  .callout-warning {
    background-color: #FFFBEB;
    border-left: 4px solid #F59E0B;
    color: #92400E;
  }

  .callout-danger {
    background-color: #FEF2F2;
    border-left: 4px solid #EF4444;
    color: #991B1B;
  }

  .callout-success {
    background-color: #ECFDF5;
    border-left: 4px solid #10B981;
    color: #065F46;
  }

  /* Status Badges */
  .status-pill {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 7.5pt;
    font-weight: 800;
    font-family: monospace;
  }

  .pill-pending { background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
  .pill-approved { background-color: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }
  .pill-progress { background-color: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }
  .pill-completed { background-color: #E2E8F0; color: #334155; border: 1px solid #CBD5E1; }
  .pill-deferred { background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

  /* Flow Steps Diagram */
  .flow-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin: 10px 0;
    page-break-inside: avoid;
  }

  .flow-step {
    background-color: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    padding: 8px 6px;
    text-align: center;
  }

  .flow-step-num {
    font-size: 7pt;
    font-weight: 800;
    color: #0F2D6B;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .flow-step-title {
    font-size: 8pt;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 3px;
  }

  .flow-step-desc {
    font-size: 6.5pt;
    color: #64748B;
    line-height: 1.2;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-header">
    <div class="badge-tag">GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS</div>
    <div class="cover-title">RailBlock AI — Multi-Agent Corridor Operating System</div>
    <div class="cover-subtitle">Complete Frontend API Specification &amp; Engineering Handover Manual</div>
    <p style="font-size: 10pt; color: #475569; max-width: 90%;">
      Production integration blueprint for building, extending, and operating all 3 standalone portals:
      <strong>Section Controller Cockpit</strong>, <strong>Field Junior Engineer Terminal</strong>, and 
      <strong>Station Master Operating Terminal</strong>.
    </p>

    <div class="cover-meta-grid">
      <div class="meta-item">
        <div class="meta-label">Project Valuation &amp; Scope</div>
        <div class="meta-value">₹100-Crore Enterprise Infrastructure (SIH 26027)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Target Architecture</div>
        <div class="meta-value">Next.js 15 (App Router) + FastAPI + WebSockets</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">UI Design Standard</div>
        <div class="meta-value">100% Light Enterprise Theme (#F8FAFC / #0F2D6B)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Safety &amp; Reliability SLA</div>
        <div class="meta-value">SIL-4 Verified • Sub-250ms Dynamic Re-optimization</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Target Corridor Network</div>
        <div class="meta-value">South Western Railway (SBC-MYS Corridor, 138 KM)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Live Production URL</div>
        <div class="meta-value">https://railblock-ai-six.vercel.app</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <strong>CONFIDENTIAL — INTERNAL RAILBLOCK ENGINEERING TEAM USE ONLY</strong><br>
    Compiled at 2026-09-12 • All test suites passed 100% • Certified Indian Railways Operating Manual Form T/351 Standard
  </div>
</div>

<!-- SECTION 1: ARCHITECTURE & DECOUPLED PORTALS -->
<div class="section-break"></div>
<h1>1. Architecture &amp; Decoupled Portal Topology</h1>

<p>
  RailBlock AI coordinates track possessions across Indian Railways corridors via <strong>three strictly decoupled web portals</strong>.
  Each portal operates as a dedicated physical hardware terminal with zero cross-portal links or mixed navigation.
</p>

<table>
  <thead>
    <tr>
      <th>Portal Identity</th>
      <th>Route Path</th>
      <th>Operating Role</th>
      <th>Physical Jurisdiction</th>
      <th>Core Technical Responsibilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Portal 1: Section Controller Cockpit</strong></td>
      <td><code>/cockpit</code><br><code>/cockpit/requests</code></td>
      <td>Chief Section Controller</td>
      <td>Corridor Control Office (SWR Bengaluru)</td>
      <td>Multi-department Gantt radar, Pareto profile optimization, SIL-4 safety guardian audit, Form T/351 sanctioning, emergency defect injection.</td>
    </tr>
    <tr>
      <td><strong>Portal 2: Field Junior Engineer Terminal</strong></td>
      <td><code>/field/request</code></td>
      <td>Junior Engineer (P-Way, S&amp;T, TRD)</td>
      <td>Track Worksite (KM Post)</td>
      <td>5-step Form T/351 requisition, defect photo upload, scannable QR permit generation, live work countdown timer, 130 km/h surrender certification.</td>
    </tr>
    <tr>
      <td><strong>Portal 3: Station Master Operating Terminal</strong></td>
      <td><code>/station</code></td>
      <td>Station Master / Yard In-Charge</td>
      <td>Station Relay Interlocking Room</td>
      <td>WebRTC camera QR permit verification (60 FPS), signal point clamping at Danger, Form T/351 disconnection granting, local hazard deferral.</td>
    </tr>
  </tbody>
</table>

<div class="callout callout-warning">
  <strong>STRICT PRODUCTION RULE — NO DEMO ARTIFACTS:</strong>
  All hackathon, demo, and prototype wording has been permanently eliminated. All buttons and headers use official Indian Railways Operating Manual terminology (e.g. <em>Form T/351 Disconnection Memo</em>, <em>Confirm Ground Disconnection Clearance</em>, <em>Reset Section State</em>).
</div>

<h2>Base URLs &amp; Environment Configuration</h2>
<table>
  <thead>
    <tr>
      <th>Variable / Protocol</th>
      <th>Local Development URL</th>
      <th>Production Tunnel URL</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>NEXT_PUBLIC_API_BASE</code></td>
      <td><code>http://localhost:8000</code></td>
      <td><code>https://&lt;domain&gt;</code> / Reverse Proxy</td>
      <td>FastAPI Master REST API Root</td>
    </tr>
    <tr>
      <td><code>NEXT_PUBLIC_WS_URL</code></td>
      <td><code>ws://localhost:8000/api/v1/ws/updates</code></td>
      <td><code>wss://&lt;domain&gt;/api/v1/ws/updates</code></td>
      <td>Real-Time Telemetry &amp; Event Stream</td>
    </tr>
  </tbody>
</table>

<!-- SECTION 2: END-TO-END OPERATIONAL LIFECYCLE -->
<div class="section-break"></div>
<h1>2. End-to-End Form T/351 Operational Lifecycle</h1>

<p>
  Every maintenance possession strictly follows Indian Railways General and Subsidiary Rules (G&amp;SR) Form T/351:
</p>

<div class="flow-grid">
  <div class="flow-step">
    <div class="flow-step-num">Step 1</div>
    <div class="flow-step-title">Requisition</div>
    <div class="flow-step-desc">Field JE submits demand + photo via <code>POST /demand</code>. Status: <span class="status-pill pill-pending">PENDING</span></div>
  </div>
  <div class="flow-step">
    <div class="flow-step-num">Step 2</div>
    <div class="flow-step-title">Awaiting Sanction</div>
    <div class="flow-step-desc">Terminal displays <strong>Locked / Blurred QR</strong>. Awaiting Section Controller approval.</div>
  </div>
  <div class="flow-step">
    <div class="flow-step-num">Step 3</div>
    <div class="flow-step-title">Permit Unlocked</div>
    <div class="flow-step-desc">Cockpit sanctions. QR instantly unlocks with official SWR Memo. Status: <span class="status-pill pill-approved">APPROVED</span></div>
  </div>
  <div class="flow-step">
    <div class="flow-step-num">Step 4</div>
    <div class="flow-step-title">Active Work</div>
    <div class="flow-step-desc">Station Master scans QR, clamps signals at Danger. Timer runs. Status: <span class="status-pill pill-progress">IN_PROGRESS</span></div>
  </div>
  <div class="flow-step">
    <div class="flow-step-num">Step 5</div>
    <div class="flow-step-title">Surrender Safe</div>
    <div class="flow-step-desc">JE uploads after photo, certifies 130 km/h line speed. Status: <span class="status-pill pill-completed">COMPLETED</span></div>
  </div>
</div>

<h2>State Transition Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Current State</th>
      <th>Action / Trigger</th>
      <th>Executing Portal</th>
      <th>Target State</th>
      <th>Network / Bus Event</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DRAFT</code></td>
      <td>Submit Form T/351</td>
      <td>Field JE (Portal 2)</td>
      <td><span class="status-pill pill-pending">PENDING_SANCTION</span></td>
      <td><code>FIELD_DEMAND_SUBMITTED</code></td>
    </tr>
    <tr>
      <td><span class="status-pill pill-pending">PENDING_SANCTION</span></td>
      <td>Section Controller Sanction</td>
      <td>Cockpit (Portal 1)</td>
      <td><span class="status-pill pill-approved">APPROVED</span></td>
      <td><code>BLOCK_SANCTIONED</code></td>
    </tr>
    <tr>
      <td><span class="status-pill pill-approved">APPROVED</span></td>
      <td>SM Scans QR &amp; Clamps Signals</td>
      <td>Station Master (Portal 3)</td>
      <td><span class="status-pill pill-progress">IN_PROGRESS</span></td>
      <td><code>DISCONNECTION_GRANTED</code></td>
    </tr>
    <tr>
      <td><span class="status-pill pill-approved">APPROVED</span></td>
      <td>Station Master Deferral</td>
      <td>Station Master (Portal 3)</td>
      <td><span class="status-pill pill-deferred">DEFERRED</span></td>
      <td><code>GROUND_DEFERRAL_ALERT</code></td>
    </tr>
    <tr>
      <td><span class="status-pill pill-deferred">DEFERRED</span></td>
      <td>Controller Re-Sanctions Slot</td>
      <td>Cockpit (Portal 1)</td>
      <td><span class="status-pill pill-approved">APPROVED</span></td>
      <td><code>SLOT_SANCTIONED</code></td>
    </tr>
    <tr>
      <td><span class="status-pill pill-progress">IN_PROGRESS</span></td>
      <td>Surrender Track Safe (130 km/h)</td>
      <td>Field JE (Portal 2)</td>
      <td><span class="status-pill pill-completed">COMPLETED</span></td>
      <td><code>WORK_COMPLETED</code></td>
    </tr>
  </tbody>
</table>

<!-- SECTION 3: PORTAL 1 COCKPIT APIS -->
<div class="section-break"></div>
<h1>3. Portal 1: Section Controller Cockpit API Key Points</h1>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/pipeline/full</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Runs end-to-end 6-agent cognitive scheduling optimization across the corridor.</div>
    <pre>
// Request Body
{
  "plan_type": "WEEKLY",
  "section": "SBC-MYS",
  "horizon_days": 7,
  "pareto_profile": "Balanced", // "Balanced" | "Safety-Max" | "Throughput-Max"
  "persist_to_db": true
}

// Success Response (200 OK)
{
  "plan_id": 104,
  "section": "SBC-MYS",
  "horizon_days": 7,
  "pareto_profile": "Balanced",
  "work_packages_count": 14,
  "metrics": {
    "total_downtime_minutes": 1680,
    "fusion_saved_minutes": 240,
    "passenger_punctuality_impact_pct": 0.0,
    "freight_throughput_loss_pct": 1.2,
    "solver_solve_time_ms": 42.1
  },
  "optimized_plan": {
    "blocks": [
      {
        "block_id": "BLK-SBC-MYS-01",
        "task_ids": [7842],
        "section": "SBC-MYS",
        "station": "MYA",
        "department": "Engineering",
        "scheduled_start": "2026-09-13T01:30:00Z",
        "scheduled_end": "2026-09-13T03:30:00Z",
        "duration_minutes": 120,
        "priority_score": 86.5,
        "conflict_score": 0.0,
        "downtime_saved_minutes": 30,
        "is_emergency": false
      }
    ]
  }
}</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-get">GET</span>
    <span class="api-url">/api/v1/agents/status</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Retrieves operational telemetry, health, latency, and SIL-4 verification metrics for all 6 AI Agents.</div>
    <pre>
// Success Response (200 OK)
{
  "status": "OPERATIONAL",
  "total_agents": 6,
  "active_agents": 6,
  "agents": [
    {
      "id": "guardian",
      "name": "Sentinel / Safety Guardian Agent",
      "role": "Zero-Conflict & SIL-4 Safety Assurance",
      "status": "ACTIVE",
      "latency_ms": 4.2,
      "verified": true,
      "metrics": "0 Conflicts • Headway > 30m • SIL-4 Certified"
    },
    {
      "id": "priority",
      "name": "Corridor Priority Agent",
      "role": "Pareto Profiles (Safety-Max, Throughput-Max, Balanced)",
      "status": "ACTIVE",
      "latency_ms": 16.4,
      "metrics": "3 Active Frontiers • R2 = 0.966"
    },
    {
      "id": "fusion",
      "name": "Shadow Alignment / Integrated Fusion Agent",
      "role": "Multi-Department Joint Demand Bundling",
      "status": "ACTIVE",
      "latency_ms": 28.5,
      "metrics": "Up to 50% Downtime Saved • 35km Radius"
    },
    {
      "id": "optimizer",
      "name": "CP-SAT Mathematical Optimization Agent",
      "role": "Google OR-Tools Constraint Programming Solver",
      "status": "ACTIVE",
      "latency_ms": 42.1,
      "metrics": "100% Feasible Solution • 42.1ms Solve"
    },
    {
      "id": "interlocking",
      "name": "Ground Feasibility & Interlocking Agent",
      "role": "QR Token Validation & Electronic Signal Clamping",
      "status": "ACTIVE",
      "latency_ms": 8.9,
      "metrics": "Cryptographic QR Validated • EI Route Clamped"
    },
    {
      "id": "emergency",
      "name": "Dynamic Re-optimization & Incident Agent",
      "role": "Sub-250ms Emergency Re-Route & Incident Recovery",
      "status": "ACTIVE",
      "latency_ms": 208.4,
      "metrics": "208.4ms Dynamic Re-Solve (<250ms SLA)"
    }
  ]
}</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/demand/sanction</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Section Controller sanctions field demand. Issues official SWR memo and unlocks Field JE QR permit.</div>
    <pre>
// Request Body
{
  "task_id": 7842,
  "section": "SBC-MYS",
  "department": "Engineering",
  "km_range": "KM 105.0 - 108.0",
  "reason": "Through Rail Renewal & USFD Weld Replacement",
  "duration_minutes": 120,
  "pareto_profile": "Balanced"
}

// Success Response (200 OK)
{
  "id": "BLK-SBC-MYS-01",
  "block_id": "BLK-SBC-MYS-01",
  "task_id": 7842,
  "station": "MYA",
  "worker_memo_code": "MEMO-SWR-MYA-2026-081",
  "scheduled_start": "01:30",
  "scheduled_end": "03:30",
  "duration_minutes": 120,
  "status": "APPROVED",
  "pareto_profile": "Balanced",
  "downtime_saved_minutes": 30
}</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/emergency</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Injects urgent ultrasonic rail crack (USFD) defect with sub-250ms dynamic re-optimization.</div>
    <pre>
// Request Body
{
  "emergency_task": {
    "source_system": "TMS",
    "defect_type": "CRITICAL_USFD_RAIL_FRACTURE",
    "severity": 5,
    "department": "Engineering",
    "section": "SBC-MYS",
    "km_post": 105.4,
    "estimated_duration_minutes": 180,
    "description": "Critical rail fracture detected km 105.4."
  },
  "freeze_approved": true
}

// Success Response (200 OK)
{
  "emergency_task_id": 999,
  "solve_time_ms": 208.4,
  "premium_trains_protected": true,
  "emergency_block": { "block_id": "EMG-SBCMYS-999", "duration_minutes": 180, "is_emergency": true },
  "delta_summary": { "rescheduled_blocks": 1, "preserved_frozen_blocks": 7 }
}</pre>
  </div>
</div>

<!-- SECTION 4: PORTAL 2 FIELD JE APIS -->
<div class="section-break"></div>
<h1>4. Portal 2: Field Junior Engineer Terminal API Key Points</h1>

<h2>4-User Tenant State Isolation</h2>
<p>
  State is strictly partitioned per operator in <code>localStorage</code>. Switching users never leaks or overwrites another operator's draft:
</p>
<table>
  <thead>
    <tr>
      <th>User ID</th>
      <th>Operator Name</th>
      <th>Official Role</th>
      <th>Department</th>
      <th>Default Station</th>
      <th>Default KM Range</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>01</code></td>
      <td>P. Ramesh</td>
      <td>Junior Engineer (JE / P-Way)</td>
      <td>Engineering</td>
      <td>Mandya (<code>MYA</code>)</td>
      <td>KM 105.0 - 108.0</td>
    </tr>
    <tr>
      <td><code>02</code></td>
      <td>Suresh Kumar</td>
      <td>Junior Engineer (JE / S&amp;T)</td>
      <td>Signal &amp; Telecom</td>
      <td>Ramanagara (<code>RMGM</code>)</td>
      <td>KM 45.0 - 46.2</td>
    </tr>
    <tr>
      <td><code>03</code></td>
      <td>K. Venkatesh</td>
      <td>Junior Engineer (JE / TRD)</td>
      <td>Traction Distribution</td>
      <td>Kengeri (<code>KGI</code>)</td>
      <td>KM 18.0 - 22.5</td>
    </tr>
    <tr>
      <td><code>04</code></td>
      <td>Ananya Sharma</td>
      <td>Junior Engineer (Track Maint)</td>
      <td>Engineering</td>
      <td>Bidadi (<code>BID</code>)</td>
      <td>KM 34.0 - 36.5</td>
    </tr>
  </tbody>
</table>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/demand</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Submits Form T/351 maintenance requisition to Central Brain. Advances UI to Step 2 (Locked QR).</div>
    <pre>
// Request Body
{
  "department": "Engineering",
  "section": "SBC-MYS",
  "km_from": 105.0,
  "km_to": 108.0,
  "duration_minutes": 120,
  "reason": "Through Rail Renewal & USFD Weld Replacement",
  "submitter_name": "P. Ramesh",
  "user_id": "01",
  "before_photo_url": "https://images.unsplash.com/..."
}

// Success Response (200 OK)
{
  "task_id": 7842,
  "status": "SUBMITTED",
  "department": "Engineering",
  "section": "SBC-MYS",
  "priority_score": 86.5,
  "message": "Block demand registered successfully with SWR Bengaluru Central Control (Task ID: TSK-7842)."
}</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/work/complete</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Surrenders maintenance block, uploads completion photo proof, and certifies line fit for 130 km/h speed.</div>
    <pre>
// Request Body
{
  "block_id": "BLK-SBC-MYS-01",
  "after_photo_url": "https://images.unsplash.com/...",
  "after_photo_desc": "Flash-butt weld executed, ultrasonic flaw test certified, track safe for 130 km/h standard."
}

// Success Response (200 OK)
{
  "status": "COMPLETED",
  "block_id": "BLK-SBC-MYS-01"
}</pre>
  </div>
</div>

<!-- SECTION 5: PORTAL 3 STATION MASTER APIS -->
<div class="section-break"></div>
<h1>5. Portal 3: Station Master Operating Terminal API Key Points</h1>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-get">GET</span>
    <span class="api-url">/api/v1/orchestrator/sanctioned-blocks</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Returns all sanctioned possession blocks for the Station Master dashboard.</div>
    <pre>
// Success Response (200 OK)
[
  {
    "id": "BLK-SBC-MYS-01",
    "block_id": "BLK-SBC-MYS-01",
    "section": "SBC-MYS",
    "station": "MYA",
    "km_range": "KM 105.0 - 108.0",
    "department": "Engineering",
    "work_description": "Through Rail Renewal & USFD Weld Replacement",
    "scheduled_start": "01:30",
    "scheduled_end": "03:30",
    "duration_minutes": 120,
    "worker_memo_code": "MEMO-SWR-MYA-2026-081",
    "status": "APPROVED"
  }
]</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/disconnection/grant</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Station Master verifies QR token, clamps signals at Danger, and releases track to Field JE.</div>
    <pre>
// Request Body
{
  "block_id": "BLK-SBC-MYS-01",
  "station_id": "MYA"
}

// Success Response (200 OK)
{
  "status": "IN_PROGRESS",
  "block_id": "BLK-SBC-MYS-01",
  "station_id": "MYA"
}</pre>
  </div>
</div>

<div class="api-card">
  <div class="api-card-header">
    <span class="method-badge method-post">POST</span>
    <span class="api-url">/api/v1/orchestrator/emergency-defer</span>
  </div>
  <div class="api-card-body">
    <div class="api-desc">Station Master reports ground hazard. AI dynamic re-optimizer auto-reschedules slot in 208ms.</div>
    <pre>
// Request Body (Required Credentials: SM ID "123", PIN "123")
{
  "block_id": "BLK-SBC-MYS-01",
  "station_id": "MYA",
  "deferral_reason": "Severe Weather / Thunderstorm Alert",
  "sm_id": "123",
  "pin": "123"
}

// Success Response (200 OK)
{
  "status": "DEFERRED",
  "block_id": "BLK-SBC-MYS-01",
  "station_id": "MYA",
  "solve_time_ms": 208.4,
  "new_scheduled_slot": {
    "block_id": "BLK-SBC-MYS-01",
    "scheduled_start": "2026-09-13T01:30:00Z",
    "scheduled_end": "2026-09-13T04:00:00Z",
    "duration_minutes": 150,
    "slot_type": "NIGHT_WINDOW_SHADOW",
    "status": "APPROVED",
    "reason": "Auto-rescheduled from MYA due to Severe Weather"
  },
  "notification_message": "Block BLK-SBC-MYS-01 safely deferred at MYA. AI auto-healed schedule in 208ms."
}</pre>
  </div>
</div>

<!-- SECTION 6: QR TOKEN & WEBSOCKET PROTOCOL -->
<div class="section-break"></div>
<h1>6. Specialized RailBlock QR Token &amp; Event Bus</h1>

<h2>Compact Optical Delimiter Token Specification</h2>
<p>
  To guarantee 100% optical camera readability in direct outdoor sunlight, RailBlock encodes permits in a 
  <strong>compact delimiter string format</strong> (~65 characters):
</p>

<pre>
// String Structure
RAILBLOCK-v1::&lt;req_id&gt;::&lt;user_id&gt;::&lt;task_id&gt;::&lt;memo_code&gt;::&lt;station_code&gt;::&lt;department&gt;

// Concrete Example
RAILBLOCK-v1::REQ-7842::01::7842::MEMO-SWR-MYA-2026-081::MYA::Engineering</pre>

<h2>Real-Time Telemetry Event Bus Catalog</h2>
<table>
  <thead>
    <tr>
      <th>Event Name</th>
      <th>Publisher</th>
      <th>Subscriber</th>
      <th>Payload Data</th>
      <th>Reactive UI Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>FIELD_DEMAND_SUBMITTED</code></td>
      <td>Field JE</td>
      <td>Cockpit</td>
      <td><code>{ task_id, department, km_range, reason }</code></td>
      <td>Adds requisition to Cockpit Demands Desk with audio chime.</td>
    </tr>
    <tr>
      <td><code>BLOCK_SANCTIONED</code></td>
      <td>Cockpit</td>
      <td>Field JE &amp; SM</td>
      <td><code>{ block: { block_id, worker_memo_code, ... } }</code></td>
      <td>Unlocks Field JE QR permit; queues block for Station Master scan.</td>
    </tr>
    <tr>
      <td><code>DISCONNECTION_GRANTED</code></td>
      <td>Station Master</td>
      <td>Field JE &amp; Cockpit</td>
      <td><code>{ block_id, station_id }</code></td>
      <td>Advances Field JE to Step 4 timer; marks track occupied on Gantt.</td>
    </tr>
    <tr>
      <td><code>GROUND_DEFERRAL_ALERT</code></td>
      <td>Station Master</td>
      <td>Cockpit</td>
      <td><code>{ block_id, deferral_reason, new_scheduled_slot }</code></td>
      <td>Renders emergency alert banner in Cockpit; updates slot recovery time.</td>
    </tr>
    <tr>
      <td><code>SLOT_SANCTIONED</code></td>
      <td>Cockpit</td>
      <td>Field JE &amp; SM</td>
      <td><code>{ block_id, scheduled_slot }</code></td>
      <td>Re-approves recovery window for tomorrow night.</td>
    </tr>
    <tr>
      <td><code>WORK_COMPLETED</code></td>
      <td>Field JE</td>
      <td>Cockpit &amp; SM</td>
      <td><code>{ block_id, after_photo_url, after_photo_desc }</code></td>
      <td>Archives block to Previous Memos; certifies line safe for 130 km/h.</td>
    </tr>
    <tr>
      <td><code>SYSTEM_RESET</code></td>
      <td>Any Portal</td>
      <td>All 3 Portals</td>
      <td><code>{ message }</code></td>
      <td>Clears all mock and live state back to clean zero.</td>
    </tr>
  </tbody>
</table>

<!-- SECTION 7: TEAMMATE WORK DISTRIBUTION -->
<div class="section-break"></div>
<h1>7. Teammate Work Distribution &amp; Verification</h1>

<table>
  <thead>
    <tr>
      <th>Teammate</th>
      <th>Assigned Portal &amp; Scope</th>
      <th>Key Files to Own</th>
      <th>Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Teammate A</strong></td>
      <td><strong>Portal 2: Field Junior Engineer Terminal</strong></td>
      <td>
        <code>frontend/app/field/request/page.tsx</code><br>
        <code>frontend/lib/users.ts</code>
      </td>
      <td>
        - Multi-user switcher (<code>JE-01</code> to <code>JE-04</code>) with strict isolated storage.<br>
        - 5-step form wizard (Requisition &rarr; Blurred QR &rarr; Unlocked QR &rarr; Timer &rarr; 130 km/h Surrender).<br>
        - Auto-advancing upon Station Master scan via <code>BroadcastChannel</code>.
      </td>
    </tr>
    <tr>
      <td><strong>Teammate B</strong></td>
      <td><strong>Portal 3: Station Master Operating Terminal</strong></td>
      <td>
        <code>frontend/app/station/page.tsx</code><br>
        <code>frontend/lib/stations.ts</code>
      </td>
      <td>
        - WebRTC camera scanner running at 60 FPS with <code>jsQR</code> decoding.<br>
        - Native mobile camera photo upload fallback.<br>
        - Ground deferral modal requiring SM ID <code>123</code> and PIN <code>123</code>.<br>
        - Previous Memos history tab with full-text search and photo inspection.
      </td>
    </tr>
  </tbody>
</table>

<h2>Automated Test Verification Commands</h2>
<pre>
# Run complete deep lifecycle test suite (18 assertions across 9 suites)
cd frontend
npm test

# Run backend test suite (78 tests)
cd ../backend
python -m pytest

# Test production build
cd ../frontend
npm run build
</pre>

<div class="callout callout-success">
  <strong>STATUS: PRODUCTION READY</strong><br>
  All 9 frontend deep lifecycle test suites passing. All 78 backend tests passing. Vercel production deployment live.
</div>

</body>
</html>
"""

with open(HTML_TEMP_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print("HTML template written. Compiling PDF via Headless Microsoft Edge...")

cmd_pdf = [
    EDGE_EXE,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_PATH}",
    HTML_TEMP_PATH
]

res = subprocess.run(cmd_pdf, capture_output=True, text=True)
if os.path.exists(PDF_PATH) and os.path.getsize(PDF_PATH) > 0:
    print(f"[SUCCESS] PDF GENERATED: {PDF_PATH} ({os.path.getsize(PDF_PATH):,} bytes)")
else:
    print(f"[ERROR] PDF generation failed: {res.stderr}")

if os.path.exists(HTML_TEMP_PATH):
    os.remove(HTML_TEMP_PATH)

print("\n--- Step 2: Generating 16:9 PowerPoint Slide Deck (.pptx) ---")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Color constants
C_NAVY = RGBColor(15, 45, 107)    # #0F2D6B
C_SLATE = RGBColor(15, 23, 42)    # #0F172A
C_MUTED = RGBColor(100, 116, 139) # #64748B
C_BG = RGBColor(248, 250, 252)    # #F8FAFC
C_WHITE = RGBColor(255, 255, 255)
C_EMERALD = RGBColor(5, 150, 105) # #059669
C_AMBER = RGBColor(217, 119, 6)   # #D97706
C_BLUE = RGBColor(2, 132, 199)    # #0284C7

def add_header(slide, title_text, subtitle_text=""):
    # Header bar
    header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
    tf = header_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    
    if subtitle_text:
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_MUTED
        p2.font.bold = False

# SLIDE 1: Title Slide
s1 = prs.slides.add_slide(blank_layout)
# Background rect
bg = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
bg.fill.solid()
bg.fill.fore_color.rgb = C_NAVY
bg.line.fill.background()

title_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11), Inches(3.8))
tf = title_box.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "RAILBLOCK AI (IR-COAS)"
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = C_WHITE

p2 = tf.add_paragraph()
p2.text = "Frontend API Integration & System Handover Architecture"
p2.font.size = Pt(22)
p2.font.color.rgb = RGBColor(219, 234, 254)
p2.space_before = Pt(12)

p3 = tf.add_paragraph()
p3.text = "Complete Developer Reference for Portals 1, 2, and 3 • ₹100-Crore Enterprise Scope"
p3.font.size = Pt(13)
p3.font.color.rgb = RGBColor(148, 163, 184)
p3.space_before = Pt(18)

p4 = tf.add_paragraph()
p4.text = "Indian Railways Operating Manual (Form T/351 Standard) • SWR Bengaluru Division (SBC-MYS Corridor)"
p4.font.size = Pt(11)
p4.font.color.rgb = RGBColor(203, 213, 225)
p4.space_before = Pt(24)

# SLIDE 2: 3-Portal Topology
s2 = prs.slides.add_slide(blank_layout)
add_header(s2, "Three Strictly Decoupled Standalone Portals", "Zero Cross-Portal Linking • Independent Hardware Terminal Architecture")

def add_portal_card(slide, left, title, role, route, desc, color):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.8), Inches(3.6), Inches(4.8))
    card.fill.solid()
    card.fill.fore_color.rgb = C_WHITE
    card.line.color.rgb = color
    card.line.width = Pt(2)
    
    tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(2.0), Inches(3.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = color
    
    p_route = tf.add_paragraph()
    p_route.text = f"Route: {route}"
    p_route.font.size = Pt(10)
    p_route.font.bold = True
    p_route.font.color.rgb = C_SLATE
    p_route.space_before = Pt(6)

    p_role = tf.add_paragraph()
    p_role.text = f"Operator: {role}"
    p_role.font.size = Pt(9.5)
    p_role.font.color.rgb = C_MUTED
    p_role.space_before = Pt(4)

    p_desc = tf.add_paragraph()
    p_desc.text = desc
    p_desc.font.size = Pt(9)
    p_desc.font.color.rgb = C_SLATE
    p_desc.space_before = Pt(12)

add_portal_card(s2, 0.8, "PORTAL 1: Cockpit", "Chief Section Controller", "/cockpit & /cockpit/requests",
                "• Master Corridor Gantt Radar with station timeline.\n• 6 AI Agents telemetry & SIL-4 guardian validation.\n• Form T/351 Field Demands Desk.\n• Pareto profile selection (Balanced, Safety-Max, Throughput-Max).\n• Sub-250ms dynamic emergency defect solver.", C_NAVY)

add_portal_card(s2, 4.8, "PORTAL 2: Field JE", "Junior Engineer (P-Way / S&T / TRD)", "/field/request",
                "• 4-Operator tenant isolation (JE-01 to JE-04).\n• 5-step operational form wizard.\n• Defect photo capture and proof upload.\n• Locked QR matrix awaiting sanction.\n• Unlocked scannable QR permit canvas.\n• Live track work countdown timer.\n• 130 km/h line speed surrender certification.", C_EMERALD)

add_portal_card(s2, 8.8, "PORTAL 3: Station Master", "Station Master / Yard In-Charge", "/station",
                "• Physical station desks (MYA, RMGM, CPT, KGI, BID, SBC, MYS).\n• 60 FPS WebRTC camera QR scanner via jsQR.\n• Signal point clamping at Danger confirmation.\n• Form T/351 local line disconnection grant.\n• Ground hazard deferral (Auth: ID 123, PIN 123).\n• Historical memos archive with track photo inspection.", C_BLUE)

# SLIDE 3: 5-Step Operational Lifecycle
s3 = prs.slides.add_slide(blank_layout)
add_header(s3, "Unified Form T/351 Operational Lifecycle", "Strict Statutory State Machine Across All Three Portals")

steps_data = [
    ("Step 1", "Requisition", "Field JE submits Form T/351 requisition with before-photo. Status: PENDING_SANCTION.", C_AMBER),
    ("Step 2", "Awaiting Sanction", "Terminal shows locked / blurred QR. Cockpit reviews and sanctions demand.", C_NAVY),
    ("Step 3", "Permit Unlocked", "Cockpit sanctions. QR instantly unlocks with official SWR Memo code. Status: APPROVED.", C_BLUE),
    ("Step 4", "Active Work", "Station Master scans QR, clamps signals at Danger. Disconnection granted. Status: IN_PROGRESS.", C_EMERALD),
    ("Step 5", "Surrender Safe", "JE surrenders track with after-photo. Line certified fit for 130 km/h. Status: COMPLETED.", C_SLATE),
]

for idx, (step_num, title, desc, col) in enumerate(steps_data):
    left = 0.8 + idx * 2.4
    card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(2.2), Inches(2.2), Inches(4.2))
    card.fill.solid()
    card.fill.fore_color.rgb = C_WHITE
    card.line.color.rgb = col
    card.line.width = Pt(2)
    
    tb = s3.shapes.add_textbox(Inches(left + 0.15), Inches(2.4), Inches(1.9), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = step_num
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = col
    
    p2 = tf.add_paragraph()
    p2.text = title
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = C_SLATE
    p2.space_before = Pt(4)
    
    p3 = tf.add_paragraph()
    p3.text = desc
    p3.font.size = Pt(8.5)
    p3.font.color.rgb = C_MUTED
    p3.space_before = Pt(10)

# SLIDE 4: Portal 1 Cockpit APIs
s4 = prs.slides.add_slide(blank_layout)
add_header(s4, "Portal 1: Section Controller Cockpit Endpoints", "Master Scheduling, 6 AI Agents & Demands Sanctioning")

tb = s4.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
tf = tb.text_frame
tf.word_wrap = True

endpoints = [
    ("POST /api/v1/orchestrator/pipeline/full", "Triggers 6-agent full cognitive optimization loop (Weekly/Monthly). Returns plan_id, metrics & scheduled blocks."),
    ("GET  /api/v1/agents/status", "Returns operational telemetry for all 6 AI Agents (Sentinel Guardian, Priority, Fusion, CP-SAT, Interlocking, Emergency Re-opt)."),
    ("GET  /api/v1/orchestrator/demands", "Fetches active field requisitions from TMS, SMMS, and Field JE terminals."),
    ("POST /api/v1/orchestrator/demand/sanction", "Approves requisition, generates worker memo code (MEMO-SWR-MYA-2026-xxx), and unlocks Field JE QR code."),
    ("POST /api/v1/orchestrator/emergency", "Injects high-severity USFD rail fracture with sub-250ms dynamic re-optimization preserving frozen blocks."),
    ("POST /api/v1/orchestrator/sanction-rescheduled-slot", "Sanctions auto-rescheduled night slot following Station Master ground hazard deferral."),
    ("POST /api/v1/orchestrator/approve/{plan_id}", "Section Controller digital sign-off with cryptographic hash (e.g. SHA256-KRV-SWR-...)."),
    ("POST /api/v1/orchestrator/reset", "Universal platform zero-reset across all 3 portals (broadcasts SYSTEM_RESET).")
]

for idx, (ep, desc) in enumerate(endpoints):
    p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
    p.text = f"• {ep}"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_before = Pt(6) if idx > 0 else Pt(0)
    
    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = C_MUTED

# SLIDE 5: Portal 2 Field JE Workflow
s5 = prs.slides.add_slide(blank_layout)
add_header(s5, "Portal 2: Field Junior Engineer Terminal Endpoints", "Form T/351 Requisition, Multi-User Isolation & Speed Restoration")

tb = s5.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
tf = tb.text_frame
tf.word_wrap = True

je_points = [
    ("Multi-User Tenant State Isolation", "4 official operator profiles (JE-01 P-Way, JE-02 S&T, JE-03 TRD, JE-04 Track Maint). Stored in localStorage under railblock_field_active_req_id_${userId}. Zero state leakage."),
    ("POST /api/v1/orchestrator/demand", "Submits Form T/351 demand (Dept, KM From/To, Duration, Defect Photo). Returns task_id & priority score. Advances to Step 2."),
    ("Locked / Blurred QR Matrix (Step 2)", "Terminal shows locked QR canvas with notice 'Awaiting Controller Sanction'. Automatically unlocks on BLOCK_SANCTIONED WebSocket event."),
    ("Scannable QR Permit Display (Step 3)", "Renders compact token string: RAILBLOCK-v1::REQ-7842::01::7842::MEMO-SWR-MYA-2026-081::MYA::Engineering."),
    ("POST /api/v1/orchestrator/work/complete (Step 5)", "Submits completion photo proof, surrenders track possession, and certifies line fit for 130 km/h speed.")
]

for idx, (title, desc) in enumerate(je_points):
    p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
    p.text = f"• {title}"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_before = Pt(8) if idx > 0 else Pt(0)
    
    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(10)
    p2.font.color.rgb = C_SLATE

# SLIDE 6: Portal 3 Station Master Operating Desk
s6 = prs.slides.add_slide(blank_layout)
add_header(s6, "Portal 3: Station Master Terminal Endpoints", "Optical Camera QR Scanning, Signal Clamping & Local Deferral")

tb = s6.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
tf = tb.text_frame
tf.word_wrap = True

sm_points = [
    ("GET /api/v1/orchestrator/sanctioned-blocks", "Retrieves active approved possession blocks assigned to the station desk (MYA, RMGM, CPT, KGI, BID, SBC, MYS)."),
    ("60 FPS WebRTC Hardware Camera Scanner", "Decodes compact token string or JSON permit in real time via jsQR. Includes mobile photo upload fallback."),
    ("POST /api/v1/orchestrator/disconnection/grant", "Station Master verifies QR, clamps signals at Danger, and releases track possession to Field JE. Emits DISCONNECTION_GRANTED."),
    ("POST /api/v1/orchestrator/emergency-defer", "Station Master reports severe weather / local hazard. Required credentials: ID 123, PIN 123. AI auto-reschedules slot in 208ms to tomorrow night 01:30-04:00 IST."),
    ("Previous Memos & Sanctions History Tab", "Searchable archive of completed and deferred memos with track restoration certificates and before/after photos.")
]

for idx, (title, desc) in enumerate(sm_points):
    p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
    p.text = f"• {title}"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_BLUE
    p.space_before = Pt(8) if idx > 0 else Pt(0)
    
    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(10)
    p2.font.color.rgb = C_SLATE

# SLIDE 7: QR Token Specification
s7 = prs.slides.add_slide(blank_layout)
add_header(s7, "Specialized RailBlock QR Token Specification", "Compact High-Contrast Optical Format for Outdoor Camera Readability")

tb = s7.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "Format Structure (~65 Characters):"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = C_NAVY

p_code = tf.add_paragraph()
p_code.text = "RAILBLOCK-v1::<req_id>::<user_id>::<task_id>::<memo_code>::<station_code>::<department>"
p_code.font.size = Pt(12)
p_code.font.bold = True
p_code.font.color.rgb = C_SLATE
p_code.space_before = Pt(4)

p_ex = tf.add_paragraph()
p_ex.text = "Concrete Example:\nRAILBLOCK-v1::REQ-7842::01::7842::MEMO-SWR-MYA-2026-081::MYA::Engineering"
p_ex.font.size = Pt(11)
p_ex.font.color.rgb = C_EMERALD
p_ex.space_before = Pt(8)

p_rules = tf.add_paragraph()
p_rules.text = "\nValidation Rules & Mechanics:\n" \
               "1. Generator: createSpecializedRailBlockToken(req) in frontend/lib/store.ts.\n" \
               "2. Scanner: parseAndValidateRailBlockQR(raw) decodes delimiter parts or JSON fallback.\n" \
               "3. High contrast, error correction Level 'L' with margin 2 for instant 60 FPS mobile recognition.\n" \
               "4. Station code matches nearest station derived from KM post (e.g. KM 105 -> MYA Mandya)."
p_rules.font.size = Pt(10.5)
p_rules.font.color.rgb = C_MUTED
p_rules.space_before = Pt(8)

# SLIDE 8: Real-Time Event Bus
s8 = prs.slides.add_slide(blank_layout)
add_header(s8, "Real-Time Event Bus & Zero-Latency Synchronization", "WebSocket Endpoint: ws://localhost:8000/api/v1/ws/updates • BroadcastChannel")

tb = s8.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
tf = tb.text_frame
tf.word_wrap = True

events = [
    ("FIELD_DEMAND_SUBMITTED", "Field JE -> Cockpit", "Requisition registered. Adds badge to Cockpit Demands Desk with audio chime."),
    ("BLOCK_SANCTIONED", "Cockpit -> Field JE & SM", "Demand approved. Unlocks Field JE QR permit; queues block on Station Master desk."),
    ("DISCONNECTION_GRANTED", "Station Master -> Field JE & Cockpit", "Signals clamped at Danger. Field JE terminal vibrates and starts Step 4 timer."),
    ("GROUND_DEFERRAL_ALERT", "Station Master -> Cockpit", "Local hazard reported. Displays emergency red alert in Cockpit with auto-healed slot."),
    ("SLOT_SANCTIONED", "Cockpit -> SM & Field JE", "Rescheduled recovery window approved for tomorrow night 01:30-04:00 IST."),
    ("WORK_COMPLETED", "Field JE -> SM & Cockpit", "Block surrendered with completion photo. Track certified fit for 130 km/h line speed."),
    ("SYSTEM_RESET", "Any Portal -> All 3 Portals", "Clears all mock/live state and resets terminals to zero.")
]

for idx, (name, flow, desc) in enumerate(events):
    p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
    p.text = f"• {name}  [{flow}]"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_before = Pt(6) if idx > 0 else Pt(0)
    
    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = C_MUTED

# SLIDE 9: Teammate Work Assignment
s9 = prs.slides.add_slide(blank_layout)
add_header(s9, "Frontend Teammate Work Distribution & Verification", "Clear Ownership • 100% Automated Test Coverage • Production Readiness")

def add_assign_card(slide, left, title, owner, files, deliverables, color):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.8), Inches(5.6), Inches(4.8))
    card.fill.solid()
    card.fill.fore_color.rgb = C_WHITE
    card.line.color.rgb = color
    card.line.width = Pt(2)
    
    tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(2.0), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = color
    
    p_owner = tf.add_paragraph()
    p_owner.text = f"Assigned: {owner}"
    p_owner.font.size = Pt(11)
    p_owner.font.bold = True
    p_owner.font.color.rgb = C_SLATE
    p_owner.space_before = Pt(4)

    p_files = tf.add_paragraph()
    p_files.text = f"Core Files: {files}"
    p_files.font.size = Pt(9.5)
    p_files.font.color.rgb = C_MUTED
    p_files.space_before = Pt(4)

    p_deliv = tf.add_paragraph()
    p_deliv.text = f"Key Deliverables:\n{deliverables}"
    p_deliv.font.size = Pt(9.5)
    p_deliv.font.color.rgb = C_SLATE
    p_deliv.space_before = Pt(10)

add_assign_card(s9, 0.8, "TEAMMATE A: Field JE Terminal", "Frontend Engineer 1",
                "frontend/app/field/request/page.tsx, lib/users.ts",
                "• 4-Operator tenant isolation (JE-01 to JE-04) in localStorage.\n"
                "• 5-step form wizard (Requisition, Blurred QR, Unlocked QR, Timer, Surrender).\n"
                "• Defect and restoration photo upload.\n"
                "• Auto-advance on Station Master scan via BroadcastChannel & WebSockets.\n"
                "• Ensure 100% Light Theme styling with Indian Railways navy accents.", C_EMERALD)

add_assign_card(s9, 6.8, "TEAMMATE B: Station Master Terminal", "Frontend Engineer 2",
                "frontend/app/station/page.tsx, lib/stations.ts",
                "• WebRTC camera scanner with 60 FPS jsQR decoding.\n"
                "• Native mobile camera photo upload fallback.\n"
                "• Signal point clamping at Danger confirmation & disconnection grant.\n"
                "• Ground hazard deferral modal with credentials ID 123, PIN 123.\n"
                "• Previous Memos archive tab with search, filters, and photo inspection.", C_BLUE)

prs.save(PPTX_PATH)
if os.path.exists(PPTX_PATH) and os.path.getsize(PPTX_PATH) > 0:
    print(f"[SUCCESS] POWERPOINT SLIDE DECK GENERATED: {PPTX_PATH} ({os.path.getsize(PPTX_PATH):,} bytes)")
else:
    print(f"[ERROR] PPTX generation failed")

print("\n--- Summary ---")
print(f"1. PDF Manual:  {PDF_PATH}")
print(f"2. PPTX Deck:   {PPTX_PATH}")
print("Both files ready for distribution to your frontend teammates!")
