"""
Realistic Indian Railways Synthetic Data Generator for RailBlock AI.
Generates canonical corridor geometries, assets, defects, historical maintenance tasks,
and real-time train timetables aligned with TMS, SMMS, TDMS, and COA.
"""

from datetime import datetime, timedelta, timezone
import random
from typing import Any

from app.models.enums import (
    Department,
    SourceSystem,
    DefectStatus,
    TaskType,
    BlockType,
    PlanType,
    PlanStatus,
    UserRole,
    TrainType,
)

# Deterministic seed for reproducible benchmarks
RANDOM_SEED = 2026
random.seed(RANDOM_SEED)

# Karnataka Division Key Corridors (South Western Railway - SWR)
KARNATAKA_CORRIDORS = [
    {
        "section_code": "SBC-MYS",
        "section_name": "Bengaluru City - Mysuru Junction",
        "zone": "SWR",
        "total_km": 138.0,
        "daily_trains": 85,
        "goods_forecast": 24,
        "block_window_start": "01:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "SBC-UBL",
        "section_name": "Bengaluru City - Hubballi Junction",
        "zone": "SWR",
        "total_km": 470.0,
        "daily_trains": 40,
        "goods_forecast": 32,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "SBC-YPR-BAY",
        "section_name": "Bengaluru City - Yesvantpur - Ballari",
        "zone": "SWR",
        "total_km": 340.0,
        "daily_trains": 30,
        "goods_forecast": 28,
        "block_window_start": "01:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "MYS-SMET",
        "section_name": "Mysuru - Shivamogga Town",
        "zone": "SWR",
        "total_km": 210.0,
        "daily_trains": 20,
        "goods_forecast": 16,
        "block_window_start": "01:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": False,
    },
]

# Karnataka Station Geometries & GPS Coordinates
KARNATAKA_STATIONS = [
    {"code": "SBC", "name": "KSR Bengaluru City", "lat": 12.9781, "lng": 77.5696},
    {"code": "YPR", "name": "Yesvantpur Junction", "lat": 13.0238, "lng": 77.5501},
    {"code": "KGI", "name": "Kengeri", "lat": 12.9094, "lng": 77.4789},
    {"code": "RMGM", "name": "Ramanagara", "lat": 12.7247, "lng": 77.2818},
    {"code": "CPT", "name": "Channapatna", "lat": 12.6508, "lng": 77.2025},
    {"code": "MYA", "name": "Mandya", "lat": 12.5238, "lng": 76.8967},
    {"code": "MYS", "name": "Mysuru Junction", "lat": 12.3164, "lng": 76.6497},
    {"code": "HAS", "name": "Hassan Junction", "lat": 13.0072, "lng": 76.1030},
    {"code": "UBL", "name": "SSS Hubballi Junction", "lat": 15.3475, "lng": 75.1485},
    {"code": "BAY", "name": "Ballari Junction", "lat": 15.1472, "lng": 76.9214},
    {"code": "DVG", "name": "Davanagere", "lat": 14.4644, "lng": 75.9218},
    {"code": "SMET", "name": "Shivamogga Town", "lat": 13.9299, "lng": 75.5681},
]

# Canonical Corridors Catalog with Karnataka Corridors as Primary Focus
CORRIDOR_CATALOG = KARNATAKA_CORRIDORS + [
    {
        "section_code": "NDLS-AGC",
        "section_name": "New Delhi - Agra Cantt",
        "total_km": 195.0,
        "daily_trains": 140,
        "goods_forecast": 42,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "AGC-JHS",
        "section_name": "Agra Cantt - Jhansi",
        "total_km": 215.0,
        "daily_trains": 115,
        "goods_forecast": 38,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "JHS-BPL",
        "section_name": "Jhansi - Bhopal Junction",
        "total_km": 292.0,
        "daily_trains": 105,
        "goods_forecast": 32,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "NDLS-GZB",
        "section_name": "New Delhi - Ghaziabad",
        "total_km": 25.0,
        "daily_trains": 190,
        "goods_forecast": 48,
        "block_window_start": "01:00:00",
        "block_window_end": "04:30:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "GZB-ALJN",
        "section_name": "Ghaziabad - Aligarh Junction",
        "total_km": 106.0,
        "daily_trains": 135,
        "goods_forecast": 40,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "ALJN-CNB",
        "section_name": "Aligarh - Kanpur Central",
        "total_km": 303.0,
        "daily_trains": 128,
        "goods_forecast": 44,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "CNB-PRYJ",
        "section_name": "Kanpur Central - Prayagraj Junction",
        "total_km": 194.0,
        "daily_trains": 138,
        "goods_forecast": 45,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "PRYJ-DDU",
        "section_name": "Prayagraj - Pt. Deen Dayal Upadhyaya",
        "total_km": 153.0,
        "daily_trains": 155,
        "goods_forecast": 52,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "BPL-ET",
        "section_name": "Bhopal Junction - Itarsi Junction",
        "total_km": 91.0,
        "daily_trains": 130,
        "goods_forecast": 46,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "ET-NGP",
        "section_name": "Itarsi Junction - Nagpur",
        "total_km": 298.0,
        "daily_trains": 98,
        "goods_forecast": 36,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "NGP-BPQ",
        "section_name": "Nagpur - Balharshah Junction",
        "total_km": 209.0,
        "daily_trains": 88,
        "goods_forecast": 34,
        "block_window_start": "01:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "BRC-BVI",
        "section_name": "Vadodara Junction - Borivali",
        "total_km": 362.0,
        "daily_trains": 165,
        "goods_forecast": 54,
        "block_window_start": "00:00:00",
        "block_window_end": "04:30:00",
        "max_concurrent_blocks": 4,
        "is_double_line": True,
    },
]

# South Indian Railway Corridors Catalog (Southern Railway - SR, South Central Railway - SCR, South Western Railway - SWR)
SOUTH_INDIAN_CORRIDORS = [
    {
        "section_code": "MAS-SBC",
        "section_name": "Chennai Central - KSR Bengaluru",
        "zone": "SR/SWR",
        "total_km": 358.0,
        "daily_trains": 142,
        "goods_forecast": 42,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "MAS-BZA",
        "section_name": "Chennai Central - Vijayawada Junction",
        "zone": "SR/SCR",
        "total_km": 431.0,
        "daily_trains": 158,
        "goods_forecast": 48,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "BZA-SC",
        "section_name": "Vijayawada - Secunderabad Junction",
        "zone": "SCR",
        "total_km": 349.0,
        "daily_trains": 136,
        "goods_forecast": 40,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "SBC-MYS",
        "section_name": "KSR Bengaluru - Mysuru Junction",
        "zone": "SWR",
        "total_km": 138.0,
        "daily_trains": 84,
        "goods_forecast": 22,
        "block_window_start": "01:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "MAS-CBE",
        "section_name": "Chennai Central - Coimbatore Junction",
        "zone": "SR",
        "total_km": 497.0,
        "daily_trains": 126,
        "goods_forecast": 38,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 3,
        "is_double_line": True,
    },
    {
        "section_code": "CBE-PGT",
        "section_name": "Coimbatore Junction - Palakkad Junction",
        "zone": "SR",
        "total_km": 54.0,
        "daily_trains": 76,
        "goods_forecast": 24,
        "block_window_start": "01:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "ERS-TVC",
        "section_name": "Ernakulam Junction - Thiruvananthapuram Central",
        "zone": "SR",
        "total_km": 206.0,
        "daily_trains": 112,
        "goods_forecast": 28,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
    {
        "section_code": "RU-GTL",
        "section_name": "Renigunta Junction - Guntakal Junction",
        "zone": "SCR",
        "total_km": 310.0,
        "daily_trains": 94,
        "goods_forecast": 35,
        "block_window_start": "00:30:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    },
]

ALL_INDIAN_CORRIDORS = CORRIDOR_CATALOG + SOUTH_INDIAN_CORRIDORS

# Departmental Asset Archetypes
ASSET_ARCHETYPES = {
    Department.ENGINEERING: [
        ("Track Segment - Continuous Welded Rail 60kg", 1.0),
        ("Turnout 1:12 Thick Web Switch", 0.1),
        ("Curved Track Segment 4-Degree", 0.5),
        ("Level Crossing Approach Track", 0.2),
        ("Major Bridge Approach Girder Track", 0.2),
    ],
    Department.SIGNAL_TELECOM: [
        ("Electronic Interlocking (EI) Field Unit", 0.1),
        ("Digital Axle Counter (DAC) Track Unit", 0.1),
        ("Color Light Multi-Aspect Signal Mast", 0.05),
        ("Point Machine 220mm Stroke High Thrust", 0.05),
        ("Audio Frequency Track Circuit (AFTC)", 0.5),
    ],
    Department.TRACTION_DISTRIBUTION: [
        ("OHE Contact Wire Span 107 sq mm", 1.5),
        ("Catenary Wire Span 65 sq mm Cadmium Copper", 1.5),
        ("OHE Mast Cantilever Assembly", 0.1),
        ("25kV Motorized Isolator Switch Post", 0.05),
        ("Neutral Section Assembly PTFE Type", 0.05),
    ],
}

# Domain Defect Catalog
DEFECT_CATALOG = {
    Department.ENGINEERING: [
        ("Rail Fracture / Internal Transverse Flaw (USFD Detected)", SourceSystem.TMS, 5, 240, True, False),
        ("Track Gauge Widening > 10mm Under Load", SourceSystem.TMS, 4, 180, True, False),
        ("Through Weld Failure at AT Joint", SourceSystem.TMS, 5, 210, True, False),
        ("Ballast Deficiency & Track Settlement (Uneven Cross-Level)", SourceSystem.TMS, 3, 240, True, False),
        ("Turnout Switch Tongue Rail Chipping & Wear", SourceSystem.TMS, 4, 180, True, False),
        ("Sleeper Crack & Fastener Elastic Rail Clip Looseness", SourceSystem.TMS, 2, 120, True, False),
    ],
    Department.SIGNAL_TELECOM: [
        ("Signal Aspect Red Lamp Filament Open / Blank", SourceSystem.SMMS, 5, 90, True, False),
        ("Point Machine Detection Microswitch Failure", SourceSystem.SMMS, 4, 120, True, False),
        ("Digital Axle Counter False Track Occupation", SourceSystem.SMMS, 4, 120, True, False),
        ("Track Circuit Relay Glitch / Ballast Resistance Low", SourceSystem.SMMS, 3, 90, True, False),
        ("Signaling Armored Cable Insulation Drop / Megger Failure", SourceSystem.SMMS, 3, 150, False, False),
        ("Interlocking Point Contactor Mechanical Jam", SourceSystem.SMMS, 4, 120, True, False),
    ],
    Department.TRACTION_DISTRIBUTION: [
        ("OHE Contact Wire Excessive Sagging & Tension Loss", SourceSystem.TDMS, 4, 180, False, True),
        ("Insulator Flashover & Tracking Damage from Pollution", SourceSystem.TDMS, 4, 150, False, True),
        ("Cantilever Stay Arm Bracket Cracked / Shifted", SourceSystem.TDMS, 3, 120, False, True),
        ("Neutral Section Arc Trap Burnt / Pitted", SourceSystem.TDMS, 4, 150, True, True),
        ("OHE Contact Wire Deep Spark Grooves / Thinning", SourceSystem.TDMS, 3, 210, False, True),
        ("Tree Foliage Infringing 25kV Live Zone", SourceSystem.TDMS, 2, 90, False, True),
    ],
}

# Train Archetypes
TRAIN_CATALOG = [
    # South Western Railway (Karnataka Division) Flagship Trains
    ("20607", "Vande Bharat Express (KSR Bengaluru - Mysuru)", TrainType.VANDE_BHARAT, 10),
    ("20608", "Vande Bharat Express (Mysuru - KSR Bengaluru)", TrainType.VANDE_BHARAT, 10),
    ("12007", "Chennai - Mysuru Shatabdi Express (via SBC)", TrainType.SHATABDI, 9),
    ("12008", "Mysuru - Chennai Shatabdi Express (via SBC)", TrainType.SHATABDI, 9),
    ("22691", "KSR Bengaluru - Hazrat Nizamuddin Rajdhani", TrainType.RAJDHANI, 10),
    ("22692", "Hazrat Nizamuddin - KSR Bengaluru Rajdhani", TrainType.RAJDHANI, 10),
    ("16215", "Chamundi Express (Bengaluru - Mysuru)", TrainType.MAIL_EXPRESS, 7),
    ("16216", "Chamundi Express (Mysuru - Bengaluru)", TrainType.MAIL_EXPRESS, 7),
    ("12627", "Karnataka Express (Bengaluru - New Delhi)", TrainType.MAIL_EXPRESS, 8),
    ("12628", "Karnataka Express (New Delhi - Bengaluru)", TrainType.MAIL_EXPRESS, 8),
    # National Flagships
    ("22436", "Vande Bharat Express (NDLS-BSB)", TrainType.VANDE_BHARAT, 10),
    ("20172", "Vande Bharat Express (NDLS-RKMP)", TrainType.VANDE_BHARAT, 10),
    ("20901", "Vande Bharat Express (MMCT-GNC)", TrainType.VANDE_BHARAT, 10),
    ("12952", "Mumbai Rajdhani Express", TrainType.RAJDHANI, 10),
    ("12424", "Dibrugarh Rajdhani Express", TrainType.RAJDHANI, 10),
    ("12302", "Howrah Rajdhani Express", TrainType.RAJDHANI, 10),
    ("12434", "Chennai Rajdhani Express", TrainType.RAJDHANI, 10),
    ("12432", "Thiruvananthapuram Rajdhani Express", TrainType.RAJDHANI, 10),
    ("12002", "Bhopal Shatabdi Express", TrainType.SHATABDI, 8),
    ("12004", "Lucknow Shatabdi Express", TrainType.SHATABDI, 8),
    ("12018", "Dehradun Shatabdi Express", TrainType.SHATABDI, 8),
    ("12138", "Punjab Mail", TrainType.MAIL_EXPRESS, 6),
    ("12616", "Grand Trunk Express", TrainType.MAIL_EXPRESS, 6),
    ("12622", "Tamil Nadu Express", TrainType.MAIL_EXPRESS, 6),
    ("12724", "Telangana Express", TrainType.MAIL_EXPRESS, 6),
    ("12802", "Purushottam Express", TrainType.MAIL_EXPRESS, 6),
    ("12312", "Netaji Express", TrainType.MAIL_EXPRESS, 6),
    ("12280", "Taj Express", TrainType.MAIL_EXPRESS, 6),
    ("11058", "Amritsar Mumbai CSMT Express", TrainType.MAIL_EXPRESS, 6),
    ("12418", "Prayagraj Express", TrainType.MAIL_EXPRESS, 6),
    ("51882", "Gwalior Agra Cantt Passenger", TrainType.PASSENGER, 4),
    ("51884", "Jhansi Bhopal Passenger", TrainType.PASSENGER, 4),
    ("54308", "Delhi Aligarh Passenger", TrainType.PASSENGER, 4),
    ("G-BOXN-401", "Dedicated Freight Corridor Coal Rake", TrainType.GOODS, 3),
    ("G-BTPN-302", "Indian Oil Petroleum Tanker Rake", TrainType.GOODS, 3),
    ("G-BCN-512", "Food Corporation of India Grain Rake", TrainType.GOODS, 3),
    ("G-CONCOR-603", "Container Freight Express", TrainType.GOODS, 3),
    ("G-BOXNHL-704", "Steel Authority Heavy Ore Rake", TrainType.GOODS, 3),
]


def generate_corridors() -> list[dict[str, Any]]:
    """
    Returns the canonical 12 Indian Railways corridor specifications.
    """
    return [dict(c) for c in CORRIDOR_CATALOG]


def generate_assets(corridor_ids_map: dict[str, int], target_count: int = 500) -> list[dict[str, Any]]:
    """
    Generates 500+ realistic railway infrastructure assets evenly distributed across
    the 12 corridors and 3 core departments (Engineering, S&T, TRD).
    """
    assets = []
    asset_id_counter = 1000

    sections = list(CORRIDOR_CATALOG)
    assets_per_section = max(1, target_count // len(sections))

    now = datetime.now(timezone.utc)

    for corridor_data in sections:
        sec_code = corridor_data["section_code"]
        c_id = corridor_ids_map.get(sec_code, 1)
        max_km = corridor_data["total_km"]

        for i in range(assets_per_section):
            asset_id_counter += 1
            # Cycle through 3 departments
            dept = [Department.ENGINEERING, Department.SIGNAL_TELECOM, Department.TRACTION_DISTRIBUTION][i % 3]
            archetypes = ASSET_ARCHETYPES[dept]
            archetype_name, length_km = archetypes[i % len(archetypes)]

            # Position along the section
            km_start = round(random.uniform(0.5, max_km - length_km - 0.5), 2)
            km_end = round(km_start + length_km, 2)

            # High density corridors have GMT between 35 and 65
            traffic_density = round(random.uniform(28.0, 62.0), 1)
            criticality = random.choices([2, 3, 4, 5], weights=[0.15, 0.40, 0.30, 0.15])[0]

            days_ago = random.randint(10, 180)
            last_maint = now - timedelta(days=days_ago)

            code = f"AST-{sec_code}-{dept.value[:3].upper()}-{asset_id_counter:04d}"

            assets.append({
                "code": code,
                "type": archetype_name,
                "department": dept,
                "section": sec_code,
                "corridor_id": c_id,
                "km_from": km_start,
                "km_to": km_end,
                "criticality": criticality,
                "traffic_density": traffic_density,
                "last_maintenance_at": last_maint,
            })

    # Pad remaining assets up to target_count
    while len(assets) < target_count:
        asset_id_counter += 1
        sec_meta = random.choice(sections)
        sec_code = sec_meta["section_code"]
        c_id = corridor_ids_map.get(sec_code, 1)
        dept = random.choice(list(Department))
        archetypes = ASSET_ARCHETYPES[dept]
        archetype_name, length_km = random.choice(archetypes)
        km_start = round(random.uniform(1.0, sec_meta["total_km"] - length_km - 1.0), 2)
        km_end = round(km_start + length_km, 2)

        assets.append({
            "code": f"AST-{sec_code}-{dept.value[:3].upper()}-{asset_id_counter:04d}",
            "type": archetype_name,
            "department": dept,
            "section": sec_code,
            "corridor_id": c_id,
            "km_from": km_start,
            "km_to": km_end,
            "criticality": random.randint(2, 5),
            "traffic_density": round(random.uniform(30.0, 60.0), 1),
            "last_maintenance_at": now - timedelta(days=random.randint(5, 120)),
        })

    return assets


def generate_defects_and_tasks(
    assets: list[dict[str, Any]],
    asset_id_map: dict[str, int],
    total_records: int = 5000,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Generates 5,000+ realistic defects and corresponding maintenance tasks for ML training
    and optimization benchmarking.
    Incorporates realistic correlation:
    - High traffic density + High severity => prioritized higher, lower historical overdue days
    - Power block requirement tied to Traction Distribution and OHE proximity
    - Multi-department co-location potential (can_combine = True)
    """
    defects = []
    tasks = []

    now = datetime.now(timezone.utc)

    # Equipment catalogs
    engg_resources = [
        {"machinery": ["BCM-Ballast Cleaner", "CSM-Continuous Tamping"], "gang_strength": 22},
        {"machinery": ["UNIMAT 4S Switch Tamper"], "gang_strength": 14},
        {"machinery": ["Through Rail Renewal Gantry", "Rail Welding Plant"], "gang_strength": 30},
        {"machinery": ["USFD Trolley", "Handheld Flaw Detector"], "gang_strength": 4},
    ]
    snt_resources = [
        {"machinery": ["Digital Multimeter", "Point Motor Test Kit"], "gang_strength": 6},
        {"machinery": ["Axle Counter Reset Key Unit", "Oscilloscope"], "gang_strength": 5},
        {"machinery": ["Cable Fault Locator", "Insulation Megger 500V"], "gang_strength": 8},
    ]
    trd_resources = [
        {"machinery": ["Tower Wagon TW-801", "Ladder Trolley"], "gang_strength": 12},
        {"machinery": ["OHE Tension Measuring Jig", "Thermal Imaging Camera"], "gang_strength": 8},
        {"machinery": ["Heavy Tower Car", "Discharge Rod Set"], "gang_strength": 16},
    ]

    for idx in range(total_records):
        asset = random.choice(assets)
        asset_code = asset["code"]
        asset_id = asset_id_map.get(asset_code, 1)
        dept = asset["department"]
        corridor_id = asset["corridor_id"]
        traffic_density = asset["traffic_density"]
        criticality = asset["criticality"]

        # Pick appropriate defect archetype
        archetypes = DEFECT_CATALOG[dept]
        defect_type, source_sys, base_severity, est_duration, needs_traf, needs_pow = random.choice(archetypes)

        # Correlated severity variation (+-1)
        severity = max(1, min(5, base_severity + random.choice([-1, 0, 0, 1])))

        # Correlated overdue days: High severity on high GMT sections gets faster turnaround
        if severity >= 4 and traffic_density > 45:
            overdue_days = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]
        else:
            overdue_days = random.choices([0, 1, 2, 4, 7, 12], weights=[0.3, 0.25, 0.2, 0.15, 0.07, 0.03])[0]

        # Reported time spread over past 60 days
        days_back = random.randint(0, 60)
        reported_at = now - timedelta(days=days_back, hours=random.randint(1, 23))

        defect_status = DefectStatus.REPORTED if days_back < 7 else random.choice([
            DefectStatus.SCHEDULED,
            DefectStatus.REPAIRED,
            DefectStatus.CLOSED,
        ])

        description = (
            f"[{source_sys.value}] {defect_type} detected on asset {asset_code} "
            f"at km {asset['km_from']}-{asset['km_to']} of section {asset['section']}."
        )

        defects.append({
            "asset_id": asset_id,
            "source_system": source_sys,
            "defect_type": defect_type,
            "severity": severity,
            "reported_at": reported_at,
            "overdue_days": overdue_days,
            "status": defect_status,
            "description": description,
            "estimated_duration_minutes": est_duration,
        })

        # Calculate Priority Score (0-100) using realistic multi-factor heuristic
        # Will serve as ground truth / baseline for the Priority Agent's XGBoost model
        base_score = (
            (severity / 5.0) * 40.0
            + (criticality / 5.0) * 25.0
            + min(1.0, traffic_density / 60.0) * 20.0
            + min(1.0, overdue_days / 7.0) * 15.0
        )
        # Add slight realistic stochastic variance (-3 to +3)
        priority_score = round(max(5.0, min(99.5, base_score + random.uniform(-3.0, 3.0))), 1)

        # Resources
        if dept == Department.ENGINEERING:
            res = random.choice(engg_resources)
        elif dept == Department.SIGNAL_TELECOM:
            res = random.choice(snt_resources)
        else:
            res = random.choice(trd_resources)

        is_scheduled = defect_status in (DefectStatus.SCHEDULED, DefectStatus.REPAIRED, DefectStatus.CLOSED)

        tasks.append({
            "defect_index": idx,  # Linked to defect by index during seeding
            "asset_id": asset_id,
            "corridor_id": corridor_id,
            "department": dept,
            "task_type": defect_type,
            "priority_score": priority_score,
            "duration_minutes": est_duration,
            "needs_power_block": needs_pow,
            "needs_traffic_block": needs_traf,
            "can_combine": True,
            "resources_json": res,
            "is_scheduled": is_scheduled,
        })

    return defects, tasks


def generate_train_timetables(
    corridor_ids_map: dict[str, int],
    target_count: int = 250,
) -> list[dict[str, Any]]:
    """
    Generates 200+ realistic train timetable runs across all corridors,
    including Vande Bharat, Rajdhani, Shatabdi, Mail/Express, and freight rakes.
    """
    timetables = []
    base_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Corridor list
    corridors = list(CORRIDOR_CATALOG)

    counter = 0
    for day in range(7):  # Across a full 7-day operational week
        for corr in corridors:
            sec_code = corr["section_code"]
            c_id = corridor_ids_map.get(sec_code, 1)

            # Sample 4-6 trains per corridor per day to produce 250+ entries
            sample_trains = random.sample(TRAIN_CATALOG, k=random.randint(4, 7))

            for train_no, train_name, train_type, priority in sample_trains:
                counter += 1
                if counter > target_count and day > 3:
                    break

                # Departure spread over 24 hours
                hour_dep = random.randint(0, 23)
                minute_dep = random.choice([0, 15, 30, 45])
                run_duration_hours = max(1.0, corr["total_km"] / 90.0)

                dep_time = base_date + timedelta(days=day, hours=hour_dep, minutes=minute_dep)
                arr_time = dep_time + timedelta(hours=run_duration_hours)

                timetables.append({
                    "train_number": train_no,
                    "train_name": train_name,
                    "section": sec_code,
                    "corridor_id": c_id,
                    "arrival_time": arr_time,
                    "departure_time": dep_time,
                    "train_type": train_type,
                    "priority": priority,
                    "day_of_week": day,
                })

    return timetables
