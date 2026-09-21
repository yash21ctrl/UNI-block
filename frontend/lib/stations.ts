import { ALL_KARNATAKA_STATIONS, ALL_KARNATAKA_CORRIDORS, KarnatakaStation } from './karnatakaGis';

export interface RailwayStationInfo {
  code: string;
  name: string;
  km: number;
  sm_id: string;
  section: string;
  division: string;
}

export interface StationDeskInfo {
  code: string;
  name: string;
  fullName: string;
  km: string;
  tracks: string[];
  sm_id: string;
  section: string;
  division: string;
  district?: string;
  platforms?: number;
  line_speed?: number;
  electrified?: boolean;
}

// Division name mapping
const DIVISION_LABEL_MAP: Record<string, string> = {
  SBC: 'Bengaluru',
  MYS: 'Mysuru',
  UBL: 'Hubballi',
  KRCL: 'Konkan Railway',
  'SUR/SC': 'Kalaburagi',
  SCR: 'Guntakal',
};

// Hand-crafted metadata for key historical stations
const CUSTOM_DESK_METADATA: Record<
  string,
  Partial<StationDeskInfo> & { sm_id?: string; tracks?: string[]; fullName?: string }
> = {
  SBC: {
    sm_id: 'SM-SBC-0101',
    division: 'Bengaluru',
    fullName: 'KSR Bengaluru City Terminal',
    tracks: ['Platform 1-4 (Mainline)', 'Platform 5-8 (Suburban)', 'Yard Sidings', 'OHE Sector'],
  },
  KGI: {
    sm_id: 'SM-KGI-1204',
    division: 'Bengaluru',
    fullName: 'Kengeri Suburban Hub',
    tracks: ['Down Fast', 'Up Fast', 'Suburban Bay', 'OHE Sector'],
  },
  BID: {
    sm_id: 'SM-BID-3002',
    division: 'Bengaluru',
    fullName: 'Bidadi Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Siding', 'OHE Sector'],
  },
  RMGM: {
    sm_id: 'SM-RMGM-4501',
    division: 'Bengaluru',
    fullName: 'Ramanagara Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Loop', 'OHE Sector'],
  },
  CPT: {
    sm_id: 'SM-CPT-5602',
    division: 'Bengaluru',
    fullName: 'Channapatna Block Depot',
    tracks: ['Down Fast', 'Up Fast', 'Siding 2', 'OHE Sector'],
  },
  MAD: {
    sm_id: 'SM-MAD-7401',
    division: 'Mysuru',
    fullName: 'Maddur Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  MYA: {
    sm_id: 'SM-MYA-7824',
    division: 'Mysuru',
    fullName: 'Mandya Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  PANP: {
    sm_id: 'SM-PANP-1181',
    division: 'Mysuru',
    fullName: 'Pandavapura Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Siding', 'OHE Sector'],
  },
  S: {
    sm_id: 'SM-S-1240',
    division: 'Mysuru',
    fullName: 'Srirangapatna Heritage Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  MYS: {
    sm_id: 'SM-MYS-1380',
    division: 'Mysuru',
    fullName: 'Mysuru Junction Terminal',
    tracks: ['Platform 1-3', 'Coaching Depot', 'Pit Line 1', 'OHE Sector'],
  },
  YPR: {
    sm_id: 'SM-YPR-0601',
    division: 'Bengaluru',
    fullName: 'Yesvantpur Junction Terminal',
    tracks: ['Down Fast', 'Up Fast', 'Goods Yard', 'OHE Sector'],
  },
  TK: {
    sm_id: 'SM-TK-7001',
    division: 'Bengaluru',
    fullName: 'Tumakuru Railway Junction',
    tracks: ['Down Fast', 'Up Fast', 'Goods Loop', 'OHE Sector'],
  },
  TTR: {
    sm_id: 'SM-TTR-1401',
    division: 'Mysuru',
    fullName: 'Tiptur Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  ASK: {
    sm_id: 'SM-ASK-1661',
    division: 'Mysuru',
    fullName: 'Arsikere Major Junction',
    tracks: ['Platform 1-3', 'Goods Siding', 'Down Fast', 'Up Fast'],
  },
  RRB: {
    sm_id: 'SM-RRB-2111',
    division: 'Mysuru',
    fullName: 'Birur Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Branch Siding', 'OHE Sector'],
  },
  DVG: {
    sm_id: 'SM-DVG-3261',
    division: 'Mysuru',
    fullName: 'Davangere Central Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Yard', 'OHE Sector'],
  },
  HVR: {
    sm_id: 'SM-HVR-3941',
    division: 'Hubballi',
    fullName: 'Haveri Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  UBL: {
    sm_id: 'SM-UBL-4701',
    division: 'Hubballi',
    fullName: 'SSS Hubballi Junction Terminal',
    tracks: ['Platform 1 (World Longest)', 'Platform 2-3', 'Freight Yard', 'Diesel Shed Line'],
  },
  DBU: {
    sm_id: 'SM-DBU-4001',
    division: 'Bengaluru',
    fullName: 'Doddaballapur Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  GBD: {
    sm_id: 'SM-GBD-8501',
    division: 'Bengaluru',
    fullName: 'Gauribidanur Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  HUP: {
    sm_id: 'SM-HUP-1081',
    division: 'Bengaluru',
    fullName: 'Hindupur Border Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Loop', 'OHE Sector'],
  },
  DMM: {
    sm_id: 'SM-DMM-1651',
    division: 'Guntakal',
    fullName: 'Dharmavaram Junction Station',
    tracks: ['Platform 1-3', 'Goods Yard', 'Down Fast', 'Up Fast'],
  },
  ATP: {
    sm_id: 'SM-ATP-2051',
    division: 'Guntakal',
    fullName: 'Anantapur Station',
    tracks: ['Down Fast', 'Up Fast', 'Goods Loop', 'OHE Sector'],
  },
  GTL: {
    sm_id: 'SM-GTL-2781',
    division: 'Guntakal',
    fullName: 'Guntakal Division Junction',
    tracks: ['Down Mainline', 'Up Mainline', 'Freight Marshalling Yard', 'TRD Power Sector'],
  },
  BAY: {
    sm_id: 'SM-BAY-3401',
    division: 'Hubballi',
    fullName: 'Ballari Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Iron Ore Loop', 'OHE Sector'],
  },
  KRNR: {
    sm_id: 'SM-KRNR-4501',
    division: 'Mysuru',
    fullName: 'Krishnarajanagara Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  HLN: {
    sm_id: 'SM-HLN-8501',
    division: 'Mysuru',
    fullName: 'Hole Narsipur Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  HAS: {
    sm_id: 'SM-HAS-1191',
    division: 'Mysuru',
    fullName: 'Hassan Junction Terminal',
    tracks: ['Platform 1-3', 'Goods Yard', 'Down Fast', 'Up Fast'],
  },
  DRU: {
    sm_id: 'SM-DRU-2101',
    division: 'Mysuru',
    fullName: 'Kadur Junction Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  TKE: {
    sm_id: 'SM-TKE-2351',
    division: 'Mysuru',
    fullName: 'Tarikere Station',
    tracks: ['Down Fast', 'Up Fast', 'Loop 1', 'OHE Sector'],
  },
  SMET: {
    sm_id: 'SM-SMET-2781',
    division: 'Mysuru',
    fullName: 'Shivamogga Town Terminal',
    tracks: ['Platform 1-3', 'Coaching Pitline', 'Goods Siding', 'OHE Sector'],
  },
  MAJN: {
    sm_id: 'SM-MAJN-7544',
    division: 'Mysuru',
    fullName: 'Mangaluru Junction Terminal',
    tracks: ['Platform 1-4', 'Freight Yard', 'Down Fast', 'Up Fast'],
  },
  MAQ: {
    sm_id: 'SM-MAQ-7550',
    division: 'Mysuru',
    fullName: 'Mangaluru Central Terminal',
    tracks: ['Platform 1-5', 'Pit Lines 1-2', 'Loco Shed', 'OHE Sector'],
  },
  BGM: {
    sm_id: 'SM-BGM-7433',
    division: 'Hubballi',
    fullName: 'Belagavi Junction Station',
    tracks: ['Platform 1-4', 'Down Fast', 'Up Fast', 'Military Siding'],
  },
  UD: {
    sm_id: 'SM-UD-7681',
    division: 'Konkan Railway',
    fullName: 'Udupi Junction Station',
    tracks: ['Platform 1-3', 'Main Line', 'Loop Siding', 'OHE Sector'],
  },
  KAWR: {
    sm_id: 'SM-KAWR-7801',
    division: 'Konkan Railway',
    fullName: 'Karwar Port Terminal',
    tracks: ['Platform 1-3', 'Port Freight Spur', 'Down Fast', 'Up Fast'],
  },
  KLBG: {
    sm_id: 'SM-KLBG-7901',
    division: 'Kalaburagi',
    fullName: 'Kalaburagi Junction Terminal',
    tracks: ['Platform 1-4', 'Wadi Mainline', 'Loop 1-2', 'OHE Sector'],
  },
};

function parseKmValue(kmStr?: string): number {
  if (!kmStr) return 0.0;
  const match = kmStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0.0;
}

function generateTracksForStation(stn: KarnatakaStation): string[] {
  if (stn.category === 'GHAT_SECTION') {
    return ['Up Mainline (Mountain Rail)', 'Down Mainline (Catch Siding)', 'Runaway Siding', 'Emergency Brake Testing Bay'];
  }
  if (stn.category === 'HUB_JUNCTION' || stn.category === 'MAJOR_TERMINAL') {
    const pfCount = Math.max(3, stn.platforms || 4);
    return [
      `Platform 1-${Math.min(pfCount, 4)} (Mainline)`,
      `Platform ${Math.min(pfCount, 5)}-${pfCount} (Coaching)`,
      'Goods Marshalling Yard',
      '25kV AC OHE Sector',
    ];
  }
  if (stn.category === 'DISTRICT_STATION') {
    return ['Down Fast Line', 'Up Fast Line', 'Goods Loop Siding', '25kV AC OHE Sector'];
  }
  return ['Down Fast Line', 'Up Fast Line', 'Passing Loop Siding', 'OHE Catenary Sector'];
}

// Generate Station Desk entries for all 159 Karnataka stations
export const ALL_STATION_DESKS: StationDeskInfo[] = ALL_KARNATAKA_STATIONS.map((stn) => {
  const custom = CUSTOM_DESK_METADATA[stn.code] || {};
  const cleanName = stn.name.replace(/\s*\([^)]*\)/g, '').trim();
  const kmFormatted = stn.kmFromOrigin && stn.kmFromOrigin.startsWith('KM')
    ? stn.kmFromOrigin
    : `KM ${parseKmValue(stn.kmFromOrigin).toFixed(1)}`;

  const codeHash = Math.abs(
    stn.code.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  );
  const autoSmId = `SM-${stn.code}-${(codeHash % 8999) + 1000}`;

  return {
    code: stn.code,
    name: cleanName,
    fullName: custom.fullName || (stn.name.includes('Station') || stn.name.includes('Terminal') || stn.name.includes('Junction')
      ? stn.name
      : `${stn.name} Station`),
    km: custom.km || kmFormatted,
    tracks: custom.tracks || generateTracksForStation(stn),
    sm_id: custom.sm_id || autoSmId,
    section: custom.section || (stn.corridors && stn.corridors.length > 0 ? stn.corridors[0] : 'SBC-MYS'),
    division: custom.division || DIVISION_LABEL_MAP[stn.division] || stn.division,
    district: stn.district,
    platforms: stn.platforms,
    line_speed: stn.line_speed,
    electrified: stn.electrified,
  };
});

// Comprehensive Corridor Stations mapping for all 12 Karnataka corridors
export const CORRIDOR_STATIONS: Record<string, RailwayStationInfo[]> = {
  'SBC-MYS': [
    { code: 'SBC', name: 'KSR Bengaluru City', km: 0.0, sm_id: 'SM-SBC-0101', section: 'SBC-MYS', division: 'Bengaluru' },
    { code: 'KGI', name: 'Kengeri', km: 12.0, sm_id: 'SM-KGI-1204', section: 'SBC-MYS', division: 'Bengaluru' },
    { code: 'BID', name: 'Bidadi', km: 30.0, sm_id: 'SM-BID-3002', section: 'SBC-MYS', division: 'Bengaluru' },
    { code: 'RMGM', name: 'Ramanagara', km: 45.0, sm_id: 'SM-RMGM-4501', section: 'SBC-MYS', division: 'Bengaluru' },
    { code: 'CPT', name: 'Channapatna', km: 56.0, sm_id: 'SM-CPT-5602', section: 'SBC-MYS', division: 'Bengaluru' },
    { code: 'MAD', name: 'Maddur', km: 74.0, sm_id: 'SM-MAD-7401', section: 'SBC-MYS', division: 'Mysuru' },
    { code: 'MYA', name: 'Mandya', km: 93.0, sm_id: 'SM-MYA-7824', section: 'SBC-MYS', division: 'Mysuru' },
    { code: 'PANP', name: 'Pandavapura', km: 118.0, sm_id: 'SM-PANP-1181', section: 'SBC-MYS', division: 'Mysuru' },
    { code: 'S', name: 'Srirangapatna', km: 124.0, sm_id: 'SM-S-1240', section: 'SBC-MYS', division: 'Mysuru' },
    { code: 'MYS', name: 'Mysuru Junction', km: 138.0, sm_id: 'SM-MYS-1380', section: 'SBC-MYS', division: 'Mysuru' },
  ],
  'SBC-UBL': [
    { code: 'SBC', name: 'KSR Bengaluru City', km: 0.0, sm_id: 'SM-SBC-0101', section: 'SBC-UBL', division: 'Bengaluru' },
    { code: 'YPR', name: 'Yesvantpur Junction', km: 6.0, sm_id: 'SM-YPR-0601', section: 'SBC-UBL', division: 'Bengaluru' },
    { code: 'TK', name: 'Tumakuru', km: 70.0, sm_id: 'SM-TK-7001', section: 'SBC-UBL', division: 'Bengaluru' },
    { code: 'TTR', name: 'Tiptur', km: 140.0, sm_id: 'SM-TTR-1401', section: 'SBC-UBL', division: 'Mysuru' },
    { code: 'ASK', name: 'Arsikere Junction', km: 166.0, sm_id: 'SM-ASK-1661', section: 'SBC-UBL', division: 'Mysuru' },
    { code: 'RRB', name: 'Birur Junction', km: 211.0, sm_id: 'SM-RRB-2111', section: 'SBC-UBL', division: 'Mysuru' },
    { code: 'DVG', name: 'Davangere', km: 326.0, sm_id: 'SM-DVG-3261', section: 'SBC-UBL', division: 'Mysuru' },
    { code: 'HVR', name: 'Haveri', km: 394.0, sm_id: 'SM-HVR-3941', section: 'SBC-UBL', division: 'Hubballi' },
    { code: 'UBL', name: 'SSS Hubballi Junction', km: 470.0, sm_id: 'SM-UBL-4701', section: 'SBC-UBL', division: 'Hubballi' },
  ],
  'SBC-YPR-BAY': [
    { code: 'SBC', name: 'KSR Bengaluru City', km: 0.0, sm_id: 'SM-SBC-0101', section: 'SBC-YPR-BAY', division: 'Bengaluru' },
    { code: 'YPR', name: 'Yesvantpur Junction', km: 6.0, sm_id: 'SM-YPR-0601', section: 'SBC-YPR-BAY', division: 'Bengaluru' },
    { code: 'DBU', name: 'Doddaballapur', km: 40.0, sm_id: 'SM-DBU-4001', section: 'SBC-YPR-BAY', division: 'Bengaluru' },
    { code: 'GBD', name: 'Gauribidanur', km: 85.0, sm_id: 'SM-GBD-8501', section: 'SBC-YPR-BAY', division: 'Bengaluru' },
    { code: 'HUP', name: 'Hindupur', km: 108.0, sm_id: 'SM-HUP-1081', section: 'SBC-YPR-BAY', division: 'Bengaluru' },
    { code: 'DMM', name: 'Dharmavaram Junction', km: 165.0, sm_id: 'SM-DMM-1651', section: 'SBC-YPR-BAY', division: 'Guntakal' },
    { code: 'ATP', name: 'Anantapur', km: 205.0, sm_id: 'SM-ATP-2051', section: 'SBC-YPR-BAY', division: 'Guntakal' },
    { code: 'GTL', name: 'Guntakal Junction', km: 278.0, sm_id: 'SM-GTL-2781', section: 'SBC-YPR-BAY', division: 'Guntakal' },
    { code: 'BAY', name: 'Ballari Junction', km: 328.0, sm_id: 'SM-BAY-3401', section: 'SBC-YPR-BAY', division: 'Hubballi' },
  ],
  'MYS-SMET': [
    { code: 'MYS', name: 'Mysuru Junction', km: 0.0, sm_id: 'SM-MYS-1380', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'KRNR', name: 'Krishnarajanagara', km: 45.0, sm_id: 'SM-KRNR-4501', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'HLN', name: 'Hole Narsipur', km: 85.0, sm_id: 'SM-HLN-8501', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'HAS', name: 'Hassan Junction', km: 119.0, sm_id: 'SM-HAS-1191', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'ASK', name: 'Arsikere Junction', km: 166.0, sm_id: 'SM-ASK-1661', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'DRU', name: 'Kadur Junction', km: 210.0, sm_id: 'SM-DRU-2101', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'TKE', name: 'Tarikere', km: 235.0, sm_id: 'SM-TKE-2351', section: 'MYS-SMET', division: 'Mysuru' },
    { code: 'SMET', name: 'Shivamogga Town', km: 278.0, sm_id: 'SM-SMET-2781', section: 'MYS-SMET', division: 'Mysuru' },
  ],
};

// Dynamically augment CORRIDOR_STATIONS with all 12 corridors from ALL_KARNATAKA_STATIONS
for (const corridor of ALL_KARNATAKA_CORRIDORS) {
  if (!CORRIDOR_STATIONS[corridor.id]) {
    const matchingStations = ALL_KARNATAKA_STATIONS.filter((s) => s.corridors.includes(corridor.id))
      .map((stn) => {
        const desk = ALL_STATION_DESKS.find((d) => d.code === stn.code);
        return {
          code: stn.code,
          name: desk?.name || stn.name,
          km: parseKmValue(stn.kmFromOrigin),
          sm_id: desk?.sm_id || `SM-${stn.code}-1001`,
          section: corridor.id,
          division: desk?.division || stn.division,
        };
      })
      .sort((a, b) => a.km - b.km);

    if (matchingStations.length > 0) {
      CORRIDOR_STATIONS[corridor.id] = matchingStations;
    }
  }
}

export function getNearestStation(section: string, km: number): RailwayStationInfo {
  const stations = CORRIDOR_STATIONS[section] || CORRIDOR_STATIONS['SBC-MYS'];
  let closest = stations[0];
  let minDiff = Math.abs(stations[0].km - km);

  for (const stn of stations) {
    const diff = Math.abs(stn.km - km);
    if (diff < minDiff) {
      minDiff = diff;
      closest = stn;
    }
  }
  return closest;
}

export function getStationDesk(code: string): StationDeskInfo {
  const found = ALL_STATION_DESKS.find((s) => s.code.toUpperCase() === code.toUpperCase());
  if (found) return found;
  // Fallback to Mandya (MYA)
  const mya = ALL_STATION_DESKS.find((s) => s.code === 'MYA');
  return mya || ALL_STATION_DESKS[0];
}

export function searchStations(query: string): StationDeskInfo[] {
  if (!query || !query.trim()) return ALL_STATION_DESKS;
  const q = query.trim().toLowerCase();
  return ALL_STATION_DESKS.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.division.toLowerCase().includes(q) ||
      (s.district && s.district.toLowerCase().includes(q)) ||
      s.section.toLowerCase().includes(q)
  );
}

export function getStationsByCorridor(corridorId: string): StationDeskInfo[] {
  return ALL_STATION_DESKS.filter((s) => s.section === corridorId);
}
