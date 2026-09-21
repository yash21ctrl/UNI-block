"""
Enumerations representing Indian Railways operational concepts.
"""

from enum import Enum


class Department(str, Enum):
    """Railway maintenance departments."""
    ENGINEERING = "Engineering"
    SIGNAL_TELECOM = "Signal & Telecom"
    TRACTION_DISTRIBUTION = "Traction Distribution"


class SourceSystem(str, Enum):
    """Source railway monitoring and management systems."""
    TMS = "TMS"      # Track Management System (Engineering)
    SMMS = "SMMS"    # Signaling Maintenance Management System (S&T)
    TDMS = "TDMS"    # Traction Distribution Management System (TRD)
    COA = "COA"      # Control Office Application (Operations)


class DefectStatus(str, Enum):
    """Status lifecycle of a reported asset defect."""
    REPORTED = "REPORTED"
    ASSESSED = "ASSESSED"
    SCHEDULED = "SCHEDULED"
    REPAIRED = "REPAIRED"
    CLOSED = "CLOSED"


class TaskType(str, Enum):
    """Standard Indian Railways maintenance activity types."""
    # Engineering (TMS)
    TRACK_TAMPING = "Track Tamping"
    RAIL_RENEWAL = "Through Rail Renewal (TRR)"
    SLEEPER_RENEWAL = "Through Sleeper Renewal (TSR)"
    TURNOUT_REPLACEMENT = "Turnout Deep Screening / Replacement"
    BALLAST_CLEANING = "Ballast Cleaning Machine (BCM)"
    RAIL_GRINDING = "Rail Grinding"
    TRACK_ULTRASONIC_TESTING = "USFD Testing"

    # Signal & Telecom (SMMS)
    POINT_MACHINE_OVERHAUL = "Point Machine Overhaul"
    SIGNAL_ASPECT_REPLACEMENT = "Color Light Signal Replacement"
    TRACK_CIRCUIT_MAINTENANCE = "Track Circuit Testing & Tuning"
    AXLE_COUNTER_CALIBRATION = "Digital Axle Counter (DAC) Calibration"
    INTERLOCKING_TESTING = "Electronic Interlocking (EI) Routine Test"
    CABLE_MEGGERING = "Signaling Cable Meggering"

    # Traction Distribution (TDMS)
    OHE_ANNUAL_MAINTENANCE = "OHE Annual Overhaul (AOH)"
    CONTACT_WIRE_RENEWAL = "Contact / Catenary Wire Renewal"
    CANTILEVER_ADJUSTMENT = "Cantilever Assembly Adjustment"
    ISOLATOR_OVERHAUL = "OHE Isolator Switch Maintenance"
    NEUTRAL_SECTION_CHECK = "PTFE Neutral Section Inspection"
    TREE_TRIMMING_OHE = "Tree Trimming Along OHE Line"


class BlockType(str, Enum):
    """Operational block types permitted on Indian Railways tracks."""
    POWER_BLOCK = "POWER_BLOCK"              # Traction power turned off (TRD)
    TRAFFIC_BLOCK = "TRAFFIC_BLOCK"          # Train movements prohibited (ENGG / S&T)
    INTEGRATED_BLOCK = "INTEGRATED_BLOCK"    # Combined Power + Traffic + Multi-Department Block
    SHADOW_BLOCK = "SHADOW_BLOCK"            # Secondary work executed concurrently during primary block


class PlanType(str, Enum):
    """Planning horizon."""
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


class PlanStatus(str, Enum):
    """Approval lifecycle of an AI proposed block plan."""
    PROPOSED = "PROPOSED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UserRole(str, Enum):
    """Operational hierarchy of Indian Railways personnel."""
    SECTION_CONTROLLER = "SECTION_CONTROLLER"
    CHIEF_CONTROLLER = "CHIEF_CONTROLLER"
    DRM = "DRM"  # Divisional Railway Manager
    GM = "GM"    # General Manager
    SUPER_ADMIN = "SUPER_ADMIN"


class TrainType(str, Enum):
    """Classes of trains operating on Indian Railways corridors."""
    VANDE_BHARAT = "VANDE_BHARAT"
    RAJDHANI = "RAJDHANI"
    SHATABDI = "SHATABDI"
    MAIL_EXPRESS = "MAIL_EXPRESS"
    PASSENGER = "PASSENGER"
    GOODS = "GOODS"
