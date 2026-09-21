// Source: Google Maps Platform Code Assist
// South Western Railway (SWR) & Konkan Railway Digital Twin GIS Infrastructure Database
// Full Karnataka Network: 31 Districts, 12 Major Corridors, 110+ Detailed Stations, Live Fleet

export interface KarnatakaStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
  division: 'SBC' | 'MYS' | 'UBL' | 'KRCL' | 'SUR/SC' | 'SCR' | string;
  category: 'HUB_JUNCTION' | 'MAJOR_TERMINAL' | 'DISTRICT_STATION' | 'WAYPOINT' | 'GHAT_SECTION' | string;
  platforms: number;
  line_speed: number;
  electrified: boolean;
  kmFromOrigin: string;
  corridors: string[];
}

export interface KarnatakaCorridor {
  id: string;
  name: string;
  zone: 'SWR' | 'KRCL' | 'SCR' | 'CR';
  division: string;
  line_type: string;
  gauge: string;
  line_speed: number;
  total_km: number;
  color: string;
  daily_trains: number;
  goods_forecast: number;
  status: 'CLEAR' | 'POSSESSION_ACTIVE' | 'EMERGENCY_BLOCKED' | 'CAUTION_RESTRICTED';
  path: [number, number][];
  stations: string[];
}

export interface LiveTrain {
  id: string;
  number: string;
  name: string;
  type: 'VANDE_BHARAT' | 'SUPERFAST' | 'EXPRESS' | 'PASSENGER' | 'FREIGHT' | 'MAINTENANCE_MACHINE';
  corridorId: string;
  baseSpeed: number;
  speedDelta: number;
  direction: 'UP' | 'DOWN';
  progress: number;
  locoType: string;
  origin: string;
  destination: string;
  nextStation: string;
  eta: string;
  status: 'RUNNING_NORMAL' | 'APPROACHING_BLOCK' | 'RESTRICTED_CAUTION' | 'STOPPED_AT_SIGNAL';
  rtisStatus: string;
}

export const ALL_KARNATAKA_STATIONS: KarnatakaStation[] = [
  // --- Bengaluru - Mysuru Corridor ---
  { code: 'SBC', name: 'KSR Bengaluru City', lat: 12.9781, lng: 77.5696, district: 'Bengaluru Urban', division: 'SBC', category: 'HUB_JUNCTION', platforms: 10, line_speed: 130, electrified: true, kmFromOrigin: 'KM 0', corridors: ['SBC-MYS', 'SBC-UBL', 'SBC-BWT-JTJ', 'SBC-BAY-GTL'] },
  { code: 'NYH', name: 'Nayandahalli', lat: 12.9400, lng: 77.5100, district: 'Bengaluru Urban', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 7', corridors: ['SBC-MYS'] },
  { code: 'KGI', name: 'Kengeri', lat: 12.9094, lng: 77.4789, district: 'Bengaluru Urban', division: 'SBC', category: 'DISTRICT_STATION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 12', corridors: ['SBC-MYS'] },
  { code: 'HJL', name: 'Hejjala', lat: 12.8450, lng: 77.4320, district: 'Bengaluru Urban', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 21', corridors: ['SBC-MYS'] },
  { code: 'BID', name: 'Bidadi', lat: 12.7981, lng: 77.3828, district: 'Ramanagara', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 30', corridors: ['SBC-MYS'] },
  { code: 'RMGM', name: 'Ramanagara', lat: 12.7247, lng: 77.2818, district: 'Ramanagara', division: 'SBC', category: 'HUB_JUNCTION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 45', corridors: ['SBC-MYS'] },
  { code: 'CPT', name: 'Channapatna', lat: 12.6508, lng: 77.2025, district: 'Ramanagara', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 56', corridors: ['SBC-MYS'] },
  { code: 'SET', name: 'Settihalli', lat: 12.6100, lng: 77.1300, district: 'Mandya', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 65', corridors: ['SBC-MYS'] },
  { code: 'MAD', name: 'Maddur', lat: 12.5833, lng: 77.0458, district: 'Mandya', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 74', corridors: ['SBC-MYS'] },
  { code: 'HNK', name: 'Hanakere', lat: 12.5400, lng: 76.9400, district: 'Mandya', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 85', corridors: ['SBC-MYS'] },
  { code: 'MYA', name: 'Mandya (Block Possession Hub)', lat: 12.5238, lng: 76.8967, district: 'Mandya', division: 'SBC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 93', corridors: ['SBC-MYS'] },
  { code: 'Y', name: 'Yeliyur', lat: 12.4900, lng: 76.8400, district: 'Mandya', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 101', corridors: ['SBC-MYS'] },
  { code: 'BDRL', name: 'Byadarahalli', lat: 12.4850, lng: 76.8000, district: 'Mandya', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 108', corridors: ['SBC-MYS'] },
  { code: 'PANP', name: 'Pandavapura', lat: 12.4283, lng: 76.6711, district: 'Mandya', division: 'SBC', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 115', corridors: ['SBC-MYS'] },
  { code: 'S', name: 'Srirangapatna', lat: 12.4172, lng: 76.6917, district: 'Mandya', division: 'SBC', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 124', corridors: ['SBC-MYS'] },
  { code: 'NHY', name: 'Naganahalli', lat: 12.3700, lng: 76.6700, district: 'Mysuru', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 131', corridors: ['SBC-MYS'] },
  { code: 'MYS', name: 'Mysuru Junction', lat: 12.3164, lng: 76.6497, district: 'Mysuru', division: 'MYS', category: 'HUB_JUNCTION', platforms: 6, line_speed: 110, electrified: true, kmFromOrigin: 'KM 138', corridors: ['SBC-MYS', 'MYS-HAS-MAQ', 'MYS-CMNR'] },
  { code: 'AP', name: 'Ashokapuram', lat: 12.2850, lng: 76.6340, district: 'Mysuru', division: 'MYS', category: 'WAYPOINT', platforms: 3, line_speed: 100, electrified: true, kmFromOrigin: 'KM 143', corridors: ['MYS-CMNR'] },
  { code: 'NTW', name: 'Nanjangud Town', lat: 12.1200, lng: 76.6800, district: 'Mysuru', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 164', corridors: ['MYS-CMNR'] },
  { code: 'CMNR', name: 'Chamarajanagar Terminal', lat: 11.9260, lng: 76.9410, district: 'Chamarajanagar', division: 'MYS', category: 'MAJOR_TERMINAL', platforms: 3, line_speed: 100, electrified: true, kmFromOrigin: 'KM 198', corridors: ['MYS-CMNR'] },

  // --- Bengaluru - Hubballi - Belagavi Trunk Line ---
  { code: 'YPR', name: 'Yesvantpur Junction', lat: 13.0238, lng: 77.5501, district: 'Bengaluru Urban', division: 'SBC', category: 'HUB_JUNCTION', platforms: 6, line_speed: 110, electrified: true, kmFromOrigin: 'KM 6', corridors: ['SBC-UBL', 'SBC-BAY-GTL', 'SBC-BWT-JTJ'] },
  { code: 'BAW', name: 'Chikkabanavara', lat: 13.0640, lng: 77.5020, district: 'Bengaluru Urban', division: 'SBC', category: 'WAYPOINT', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 14', corridors: ['SBC-UBL'] },
  { code: 'NMGA', name: 'Nelamangala', lat: 13.1500, lng: 77.3500, district: 'Bengaluru Rural', division: 'SBC', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 32', corridors: ['SBC-UBL'] },
  { code: 'KIAT', name: 'Kyatsandra', lat: 13.3100, lng: 77.1600, district: 'Tumakuru', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 64', corridors: ['SBC-UBL'] },
  { code: 'TK', name: 'Tumakuru', lat: 13.3400, lng: 77.1000, district: 'Tumakuru', division: 'SBC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 69', corridors: ['SBC-UBL'] },
  { code: 'GBB', name: 'Gubbi', lat: 13.3100, lng: 76.9400, district: 'Tumakuru', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 87', corridors: ['SBC-UBL'] },
  { code: 'AMSA', name: 'Ammasandra', lat: 13.2900, lng: 76.7100, district: 'Tumakuru', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 115', corridors: ['SBC-UBL'] },
  { code: 'BSN', name: 'Banasandra', lat: 13.2700, lng: 76.6000, district: 'Tumakuru', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 128', corridors: ['SBC-UBL'] },
  { code: 'TTR', name: 'Tiptur', lat: 13.2600, lng: 76.4800, district: 'Tumakuru', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 140', corridors: ['SBC-UBL'] },
  { code: 'ASK', name: 'Arsikere Junction', lat: 13.3100, lng: 76.2500, district: 'Hassan', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 120, electrified: true, kmFromOrigin: 'KM 166', corridors: ['SBC-UBL', 'HAS-ASK-SMET-TLGP'] },
  { code: 'BVR', name: 'Banavar', lat: 13.4300, lng: 76.1600, district: 'Hassan', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 181', corridors: ['SBC-UBL'] },
  { code: 'DRU', name: 'Kadur Junction', lat: 13.5500, lng: 76.0100, district: 'Chikkamagaluru', division: 'MYS', category: 'HUB_JUNCTION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 205', corridors: ['SBC-UBL', 'HAS-ASK-SMET-TLGP'] },
  { code: 'RRB', name: 'Birur Junction', lat: 13.6200, lng: 75.8700, district: 'Chikkamagaluru', division: 'MYS', category: 'HUB_JUNCTION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 211', corridors: ['SBC-UBL', 'HAS-ASK-SMET-TLGP'] },
  { code: 'AJP', name: 'Ajjampur', lat: 13.7200, lng: 76.0100, district: 'Chikkamagaluru', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 229', corridors: ['SBC-UBL'] },
  { code: 'HSD', name: 'Hosadurga Road', lat: 13.8000, lng: 76.1500, district: 'Chitradurga', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 249', corridors: ['SBC-UBL'] },
  { code: 'RGI', name: 'Ramagiri', lat: 13.8800, lng: 76.2200, district: 'Chitradurga', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 263', corridors: ['SBC-UBL'] },
  { code: 'JRU', name: 'Chikjajur Junction', lat: 14.0300, lng: 76.3200, district: 'Chitradurga', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 120, electrified: true, kmFromOrigin: 'KM 280', corridors: ['SBC-UBL'] },
  { code: 'CTA', name: 'Chitradurga Fort City', lat: 14.2200, lng: 76.4000, district: 'Chitradurga', division: 'MYS', category: 'DISTRICT_STATION', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 314', corridors: ['SBC-UBL'] },
  { code: 'DVG', name: 'Davangere (Smart City)', lat: 14.4644, lng: 75.9218, district: 'Davangere', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 325', corridors: ['SBC-UBL'] },
  { code: 'HRR', name: 'Harihar', lat: 14.5800, lng: 75.8000, district: 'Davangere', division: 'MYS', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 339', corridors: ['SBC-UBL'] },
  { code: 'RNR', name: 'Ranibennur', lat: 14.6200, lng: 75.6200, district: 'Haveri', division: 'UBL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 362', corridors: ['SBC-UBL'] },
  { code: 'BYD', name: 'Byadgi (Chilli Hub)', lat: 14.7100, lng: 75.4900, district: 'Haveri', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 381', corridors: ['SBC-UBL'] },
  { code: 'HVR', name: 'Haveri', lat: 14.7950, lng: 75.4050, district: 'Haveri', division: 'UBL', category: 'HUB_JUNCTION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 395', corridors: ['SBC-UBL'] },
  { code: 'KJG', name: 'Karajgi', lat: 14.8800, lng: 75.3600, district: 'Haveri', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 405', corridors: ['SBC-UBL'] },
  { code: 'YLG', name: 'Yalvigi', lat: 15.0100, lng: 75.2900, district: 'Haveri', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 424', corridors: ['SBC-UBL'] },
  { code: 'GDI', name: 'Gudgeri', lat: 15.1100, lng: 75.2500, district: 'Dharwad', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 436', corridors: ['SBC-UBL'] },
  { code: 'KNO', name: 'Kundgol', lat: 15.2500, lng: 75.2200, district: 'Dharwad', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 455', corridors: ['SBC-UBL'] },
  { code: 'UBL', name: 'SSS Hubballi Junction (SWR HQ)', lat: 15.3475, lng: 75.1485, district: 'Dharwad', division: 'UBL', category: 'HUB_JUNCTION', platforms: 8, line_speed: 130, electrified: true, kmFromOrigin: 'KM 470', corridors: ['SBC-UBL', 'UBL-BGM', 'UBL-GDG-HPT-BAY', 'UBL-LD-CLR-MAO'] },
  { code: 'DWR', name: 'Dharwad', lat: 15.4600, lng: 75.0100, district: 'Dharwad', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 491', corridors: ['UBL-BGM', 'UBL-LD-CLR-MAO'] },
  { code: 'MGD', name: 'Mugad', lat: 15.4800, lng: 74.8800, district: 'Dharwad', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 505', corridors: ['UBL-BGM', 'UBL-LD-CLR-MAO'] },
  { code: 'LWR', name: 'Alnavar Junction', lat: 15.4300, lng: 74.7300, district: 'Dharwad', division: 'UBL', category: 'HUB_JUNCTION', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 523', corridors: ['UBL-BGM', 'UBL-LD-CLR-MAO'] },
  { code: 'KNP', name: 'Khanapur', lat: 15.6300, lng: 74.5200, district: 'Belagavi', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 555', corridors: ['UBL-BGM'] },
  { code: 'LD', name: 'Londa Junction', lat: 15.4500, lng: 74.5100, district: 'Belagavi', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 540', corridors: ['UBL-BGM', 'UBL-LD-CLR-MAO'] },
  { code: 'DUR', name: 'Desur', lat: 15.7500, lng: 74.4800, district: 'Belagavi', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 585', corridors: ['UBL-BGM'] },
  { code: 'BGM', name: 'Belagavi (Belgaum)', lat: 15.8500, lng: 74.5000, district: 'Belagavi', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 120, electrified: true, kmFromOrigin: 'KM 610', corridors: ['UBL-BGM'] },
  { code: 'SXB', name: 'Sambre', lat: 15.8800, lng: 74.6200, district: 'Belagavi', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 622', corridors: ['UBL-BGM'] },
  { code: 'SBH', name: 'Sulebhavi', lat: 15.9300, lng: 74.7000, district: 'Belagavi', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 635', corridors: ['UBL-BGM'] },
  { code: 'GPB', name: 'Ghataprabha', lat: 16.2000, lng: 74.7700, district: 'Belagavi', division: 'UBL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 668', corridors: ['UBL-BGM'] },
  { code: 'CKR', name: 'Chikkodi Road', lat: 16.3200, lng: 74.7800, district: 'Belagavi', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 682', corridors: ['UBL-BGM'] },
  { code: 'RBG', name: 'Raybag', lat: 16.5000, lng: 74.7900, district: 'Belagavi', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 698', corridors: ['UBL-BGM'] },
  { code: 'KUD', name: 'Kudachi', lat: 16.6300, lng: 74.8500, district: 'Belagavi', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 716', corridors: ['UBL-BGM'] },

  // --- Western Ghats Sakleshpur to Mangaluru Coast ---
  { code: 'KRNR', name: 'Krishnarajanagara', lat: 12.4410, lng: 76.3860, district: 'Mysuru', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 36', corridors: ['MYS-HAS-MAQ'] },
  { code: 'AKK', name: 'Akkihebbalu', lat: 12.5800, lng: 76.3100, district: 'Mandya', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 58', corridors: ['MYS-HAS-MAQ'] },
  { code: 'HLN', name: 'Hole Narsipur', lat: 12.7870, lng: 76.2410, district: 'Hassan', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 89', corridors: ['MYS-HAS-MAQ'] },
  { code: 'HAS', name: 'Hassan Junction', lat: 13.0072, lng: 76.1030, district: 'Hassan', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 119', corridors: ['MYS-HAS-MAQ', 'HAS-ASK-SMET-TLGP'] },
  { code: 'ALUR', name: 'Alur', lat: 12.9500, lng: 75.9800, district: 'Hassan', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 90, electrified: true, kmFromOrigin: 'KM 133', corridors: ['MYS-HAS-MAQ'] },
  { code: 'SKLR', name: 'Sakleshpur (Ghats Entry Base)', lat: 12.8950, lng: 75.7870, district: 'Hassan', division: 'MYS', category: 'GHAT_SECTION', platforms: 3, line_speed: 65, electrified: true, kmFromOrigin: 'KM 161', corridors: ['MYS-HAS-MAQ'] },
  { code: 'DOG', name: 'Donigal (Mountain Rail)', lat: 12.8700, lng: 75.7200, district: 'Hassan', division: 'MYS', category: 'GHAT_SECTION', platforms: 1, line_speed: 40, electrified: true, kmFromOrigin: 'KM 170', corridors: ['MYS-HAS-MAQ'] },
  { code: 'YDK', name: 'Yedakumari (Heritage Ghats)', lat: 12.8200, lng: 75.6200, district: 'Hassan', division: 'MYS', category: 'GHAT_SECTION', platforms: 2, line_speed: 30, electrified: true, kmFromOrigin: 'KM 183', corridors: ['MYS-HAS-MAQ'] },
  { code: 'SBHR', name: 'Subrahmanya Road', lat: 12.6680, lng: 75.4740, district: 'Dakshina Kannada', division: 'MYS', category: 'DISTRICT_STATION', platforms: 3, line_speed: 75, electrified: true, kmFromOrigin: 'KM 216', corridors: ['MYS-HAS-MAQ'] },
  { code: 'KBPR', name: 'Kabaka Puttur', lat: 12.7660, lng: 75.2070, district: 'Dakshina Kannada', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 250', corridors: ['MYS-HAS-MAQ'] },
  { code: 'BNTL', name: 'Bantwal', lat: 12.8940, lng: 75.0400, district: 'Dakshina Kannada', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 275', corridors: ['MYS-HAS-MAQ'] },
  { code: 'MAJN', name: 'Mangaluru Junction', lat: 12.8680, lng: 74.8720, district: 'Dakshina Kannada', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 302', corridors: ['MYS-HAS-MAQ', 'MAQ-UD-KT-KAWR'] },
  { code: 'MAQ', name: 'Mangaluru Central Terminal', lat: 12.8620, lng: 74.8380, district: 'Dakshina Kannada', division: 'MYS', category: 'MAJOR_TERMINAL', platforms: 5, line_speed: 110, electrified: true, kmFromOrigin: 'KM 310', corridors: ['MYS-HAS-MAQ', 'MAQ-UD-KT-KAWR'] },

  // --- Konkan Railway Coastal Corridor ---
  { code: 'TOK', name: 'Thokur (KRCL Frontier)', lat: 12.9600, lng: 74.8200, district: 'Dakshina Kannada', division: 'KRCL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 14', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'SL', name: 'Surathkal (NITK Campus)', lat: 13.0110, lng: 74.7950, district: 'Dakshina Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 22', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'MULK', name: 'Mulki', lat: 13.0800, lng: 74.7980, district: 'Dakshina Kannada', division: 'KRCL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 31', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'UD', name: 'Udupi (Krishna Temple City)', lat: 13.3410, lng: 74.7470, district: 'Udupi', division: 'KRCL', category: 'HUB_JUNCTION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 68', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'BKJ', name: 'Barkur', lat: 13.5130, lng: 74.7640, district: 'Udupi', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 84', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'KUDA', name: 'Kundapura', lat: 13.6280, lng: 74.6920, district: 'Udupi', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 100', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'SEN', name: 'Senapura', lat: 13.7200, lng: 74.6600, district: 'Udupi', division: 'KRCL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 114', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'BYNR', name: 'Byndoor Mookambika Road', lat: 13.8740, lng: 74.6320, district: 'Udupi', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 134', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'BTJL', name: 'Bhatkal', lat: 13.9780, lng: 74.5500, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 149', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'MRDW', name: 'Murdeshwar (Coastal Shiva Shrine)', lat: 14.0940, lng: 74.4920, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 164', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'MANK', name: 'Manki', lat: 14.1900, lng: 74.4700, district: 'Uttara Kannada', division: 'KRCL', category: 'WAYPOINT', platforms: 1, line_speed: 120, electrified: true, kmFromOrigin: 'KM 176', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'HNA', name: 'Honnavar (Sharavathi Estuary)', lat: 14.2800, lng: 74.4500, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 190', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'KT', name: 'Kumta', lat: 14.4250, lng: 74.4170, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 204', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'GOK', name: 'Gokarna Road', lat: 14.5450, lng: 74.3490, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 223', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'ANKL', name: 'Ankola', lat: 14.6640, lng: 74.3050, district: 'Uttara Kannada', division: 'KRCL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 239', corridors: ['MAQ-UD-KT-KAWR'] },
  { code: 'KAWR', name: 'Karwar Port Terminal', lat: 14.8180, lng: 74.1350, district: 'Uttara Kannada', division: 'KRCL', category: 'MAJOR_TERMINAL', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 267', corridors: ['MAQ-UD-KT-KAWR'] },

  // --- Malnad & Jog Falls Line ---
  { code: 'TKE', name: 'Tarikere Junction', lat: 13.7100, lng: 75.8100, district: 'Chikkamagaluru', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 45', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'BDVT', name: 'Bhadravati (VISL Steel)', lat: 13.8400, lng: 75.7000, district: 'Shivamogga', division: 'MYS', category: 'DISTRICT_STATION', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 66', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'SMET', name: 'Shivamogga Town', lat: 13.9299, lng: 75.5681, district: 'Shivamogga', division: 'MYS', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 86', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'SME', name: 'Shivamogga (East)', lat: 13.9100, lng: 75.6000, district: 'Shivamogga', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 81', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'KMSI', name: 'Kumsi', lat: 14.0200, lng: 75.4000, district: 'Shivamogga', division: 'MYS', category: 'WAYPOINT', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 110', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'ANF', name: 'Anandapuram', lat: 14.0760, lng: 75.2310, district: 'Shivamogga', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 142', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'SRF', name: 'Sagara Jambagaru', lat: 14.1670, lng: 75.0330, district: 'Shivamogga', division: 'MYS', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 168', corridors: ['HAS-ASK-SMET-TLGP'] },
  { code: 'TLGP', name: 'Talguppa (Jog Falls Terminal)', lat: 14.2370, lng: 74.9080, district: 'Shivamogga', division: 'MYS', category: 'MAJOR_TERMINAL', platforms: 3, line_speed: 100, electrified: true, kmFromOrigin: 'KM 184', corridors: ['HAS-ASK-SMET-TLGP'] },

  // --- Hubballi - Gadag - Hosapete (Hampi) - Ballari ---
  { code: 'NGR', name: 'Annigeri', lat: 15.3800, lng: 75.3300, district: 'Dharwad', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 36', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'GDG', name: 'Gadag Junction', lat: 15.4300, lng: 75.6400, district: 'Gadag', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 120, electrified: true, kmFromOrigin: 'KM 58', corridors: ['UBL-GDG-HPT-BAY', 'GDG-BGK-BJP-IDR'] },
  { code: 'BNP', name: 'Bhanapur', lat: 15.3600, lng: 75.9800, district: 'Koppal', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 85', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'KBL', name: 'Koppal', lat: 15.3400, lng: 76.1500, district: 'Koppal', division: 'UBL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 98', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'GIN', name: 'Ginigera Junction', lat: 15.3300, lng: 76.2400, district: 'Koppal', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 109', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'MRB', name: 'Munirabad (Tungabhadra Dam)', lat: 15.3100, lng: 76.3200, district: 'Koppal', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 119', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'HPT', name: 'Hosapete Junction (Hampi UNESCO)', lat: 15.2700, lng: 76.3900, district: 'Vijayanagara', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 120, electrified: true, kmFromOrigin: 'KM 132', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'GPR', name: 'Gadiganuru', lat: 15.2400, lng: 76.5400, district: 'Ballari', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 152', corridors: ['UBL-GDG-HPT-BAY'] },
  { code: 'TNGL', name: 'Toranagallu (JSW Vijayanagar)', lat: 15.2200, lng: 76.6700, district: 'Ballari', division: 'UBL', category: 'HUB_JUNCTION', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 167', corridors: ['UBL-GDG-HPT-BAY', 'SBC-BAY-GTL'] },
  { code: 'KDT', name: 'Kudatini', lat: 15.1800, lng: 76.7900, district: 'Ballari', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 181', corridors: ['UBL-GDG-HPT-BAY', 'SBC-BAY-GTL'] },
  { code: 'BYC', name: 'Ballari Cantt', lat: 15.1500, lng: 76.9000, district: 'Ballari', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 198', corridors: ['UBL-GDG-HPT-BAY', 'SBC-BAY-GTL'] },
  { code: 'BAY', name: 'Ballari Junction', lat: 15.1472, lng: 76.9214, district: 'Ballari', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 202', corridors: ['UBL-GDG-HPT-BAY', 'SBC-BAY-GTL'] },
  { code: 'GTL', name: 'Guntakal Junction (Interstate Gate)', lat: 15.1667, lng: 77.3667, district: 'Ballari Border', division: 'SCR', category: 'HUB_JUNCTION', platforms: 7, line_speed: 130, electrified: true, kmFromOrigin: 'KM 252', corridors: ['UBL-GDG-HPT-BAY', 'SBC-BAY-GTL', 'GTL-RC-YG-WADI-KLBG-BIDR'] },

  // --- Gadag - Bagalkote - Vijayapura ---
  { code: 'MLP', name: 'Mallapur', lat: 15.7000, lng: 75.6600, district: 'Bagalkote', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 32', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'BDM', name: 'Badami (Cave Temples)', lat: 15.9200, lng: 75.6800, district: 'Bagalkote', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 67', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'GED', name: 'Guledagudda Road', lat: 16.0300, lng: 75.6900, district: 'Bagalkote', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 81', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'BGK', name: 'Bagalkote', lat: 16.1800, lng: 75.7000, district: 'Bagalkote', division: 'UBL', category: 'HUB_JUNCTION', platforms: 3, line_speed: 110, electrified: true, kmFromOrigin: 'KM 97', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'LMT', name: 'Almatti (Lal Bahadur Shastri Dam)', lat: 16.3300, lng: 75.8800, district: 'Vijayapura', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 128', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'BSRX', name: 'Basavana Bagevadi Road', lat: 16.5800, lng: 75.9700, district: 'Vijayapura', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 162', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'KDGI', name: 'Kudgi (NTPC Thermal Power)', lat: 16.7100, lng: 75.8500, district: 'Vijayapura', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 180', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'BJP', name: 'Vijayapura (Gol Gumbaz Bijapur)', lat: 16.8300, lng: 75.7100, district: 'Vijayapura', division: 'UBL', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 205', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'MNL', name: 'Minchnal', lat: 16.9600, lng: 75.8200, district: 'Vijayapura', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 224', corridors: ['GDG-BGK-BJP-IDR'] },
  { code: 'IDR', name: 'Indi Road (Frontier)', lat: 17.1100, lng: 75.9600, district: 'Vijayapura', division: 'UBL', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 249', corridors: ['GDG-BGK-BJP-IDR'] },

  // --- Braganza Mountain Ghats & Dudhsagar ---
  { code: 'TGT', name: 'Tinaighat', lat: 15.4400, lng: 74.3100, district: 'Uttara Kannada', division: 'UBL', category: 'WAYPOINT', platforms: 2, line_speed: 80, electrified: true, kmFromOrigin: 'KM 65', corridors: ['UBL-LD-CLR-MAO'] },
  { code: 'CLR', name: 'Castle Rock (Braganza Ghat Hub)', lat: 15.4000, lng: 74.2000, district: 'Uttara Kannada', division: 'UBL', category: 'GHAT_SECTION', platforms: 3, line_speed: 50, electrified: true, kmFromOrigin: 'KM 81', corridors: ['UBL-LD-CLR-MAO'] },
  { code: 'CRZ', name: 'Caranzol', lat: 15.3600, lng: 74.2500, district: 'Uttara Kannada', division: 'UBL', category: 'GHAT_SECTION', platforms: 1, line_speed: 35, electrified: true, kmFromOrigin: 'KM 89', corridors: ['UBL-LD-CLR-MAO'] },
  { code: 'DDS', name: 'Dudhsagar Waterfalls Stop', lat: 15.3100, lng: 74.3100, district: 'Goa Border', division: 'UBL', category: 'GHAT_SECTION', platforms: 1, line_speed: 30, electrified: true, kmFromOrigin: 'KM 96', corridors: ['UBL-LD-CLR-MAO'] },
  { code: 'QLM', name: 'Kulem (Catch Siding Station)', lat: 15.3200, lng: 74.2400, district: 'Goa Border', division: 'UBL', category: 'DISTRICT_STATION', platforms: 3, line_speed: 60, electrified: true, kmFromOrigin: 'KM 112', corridors: ['UBL-LD-CLR-MAO'] },

  // --- Bengaluru to KGF & Jolarpettai ---
  { code: 'BNC', name: 'Bengaluru Cantt', lat: 12.9930, lng: 77.5980, district: 'Bengaluru Urban', division: 'SBC', category: 'DISTRICT_STATION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 4', corridors: ['SBC-BWT-JTJ'] },
  { code: 'BNCE', name: 'Bengaluru East', lat: 12.9980, lng: 77.6150, district: 'Bengaluru Urban', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 7', corridors: ['SBC-BWT-JTJ'] },
  { code: 'BYPL', name: 'Baiyyappanahalli (SMVT Terminal)', lat: 12.9928, lng: 77.6515, district: 'Bengaluru Urban', division: 'SBC', category: 'HUB_JUNCTION', platforms: 7, line_speed: 110, electrified: true, kmFromOrigin: 'KM 11', corridors: ['SBC-BWT-JTJ'] },
  { code: 'KJM', name: 'Krishnarajapuram (IT Corridor)', lat: 13.0016, lng: 77.6853, district: 'Bengaluru Urban', division: 'SBC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 14', corridors: ['SBC-BWT-JTJ'] },
  { code: 'HDIH', name: 'Hoodi Halt', lat: 12.9960, lng: 77.7200, district: 'Bengaluru Urban', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 19', corridors: ['SBC-BWT-JTJ'] },
  { code: 'WFD', name: 'Whitefield', lat: 12.9950, lng: 77.7600, district: 'Bengaluru Urban', division: 'SBC', category: 'DISTRICT_STATION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 23', corridors: ['SBC-BWT-JTJ'] },
  { code: 'DKN', name: 'Devangonthi', lat: 12.9980, lng: 77.8300, district: 'Bengaluru Rural', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 31', corridors: ['SBC-BWT-JTJ'] },
  { code: 'MLO', name: 'Malur', lat: 13.0033, lng: 77.9392, district: 'Kolar', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 43', corridors: ['SBC-BWT-JTJ'] },
  { code: 'TCL', name: 'Tyakal', lat: 13.0100, lng: 78.0700, district: 'Kolar', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 58', corridors: ['SBC-BWT-JTJ'] },
  { code: 'BWT', name: 'Bangarapet Junction', lat: 12.9982, lng: 78.2017, district: 'Kolar', division: 'SBC', category: 'HUB_JUNCTION', platforms: 5, line_speed: 130, electrified: true, kmFromOrigin: 'KM 70', corridors: ['SBC-BWT-JTJ'] },
  { code: 'KQZ', name: 'Kolar', lat: 13.1360, lng: 78.1340, district: 'Kolar', division: 'SBC', category: 'DISTRICT_STATION', platforms: 2, line_speed: 100, electrified: true, kmFromOrigin: 'KM 87', corridors: ['SBC-BWT-JTJ'] },
  { code: 'CHU', name: 'Champion (KGF Mines)', lat: 12.9300, lng: 78.2500, district: 'Kolar', division: 'SBC', category: 'WAYPOINT', platforms: 1, line_speed: 60, electrified: true, kmFromOrigin: 'KM 81', corridors: ['SBC-BWT-JTJ'] },
  { code: 'MKP', name: 'Marikuppam Terminal (KGF)', lat: 12.9150, lng: 78.2700, district: 'Kolar', division: 'SBC', category: 'MAJOR_TERMINAL', platforms: 2, line_speed: 60, electrified: true, kmFromOrigin: 'KM 86', corridors: ['SBC-BWT-JTJ'] },
  { code: 'KSM', name: 'Kamasamudram', lat: 12.9100, lng: 78.3000, district: 'Kolar', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 85', corridors: ['SBC-BWT-JTJ'] },
  { code: 'KPN', name: 'Kuppam', lat: 12.7500, lng: 78.3600, district: 'Kolar Border', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 105', corridors: ['SBC-BWT-JTJ'] },

  // --- Bengaluru - Doddaballapur - Hindupur ---
  { code: 'YNK', name: 'Yelahanka Junction', lat: 13.1000, lng: 77.5800, district: 'Bengaluru Urban', division: 'SBC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 18', corridors: ['SBC-BAY-GTL'] },
  { code: 'RNN', name: 'Rajankunti', lat: 13.1900, lng: 77.5600, district: 'Bengaluru Rural', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 31', corridors: ['SBC-BAY-GTL'] },
  { code: 'DBU', name: 'Dodballapur', lat: 13.2980, lng: 77.5420, district: 'Bengaluru Rural', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 43', corridors: ['SBC-BAY-GTL'] },
  { code: 'ORH', name: 'Oddarahalli', lat: 13.4300, lng: 77.5200, district: 'Bengaluru Rural', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 58', corridors: ['SBC-BAY-GTL'] },
  { code: 'GBD', name: 'Gauribidanur', lat: 13.6130, lng: 77.5000, district: 'Chikkaballapura', division: 'SBC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 120, electrified: true, kmFromOrigin: 'KM 79', corridors: ['SBC-BAY-GTL'] },
  { code: 'VWA', name: 'Viduraswatha', lat: 13.6700, lng: 77.4900, district: 'Chikkaballapura', division: 'SBC', category: 'WAYPOINT', platforms: 2, line_speed: 120, electrified: true, kmFromOrigin: 'KM 87', corridors: ['SBC-BAY-GTL'] },
  { code: 'HUP', name: 'Hindupur (Karnataka Gate)', lat: 13.8280, lng: 77.4960, district: 'Chikkaballapura Border', division: 'SBC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 108', corridors: ['SBC-BAY-GTL'] },
  { code: 'DMM', name: 'Dharmavaram Junction', lat: 14.4100, lng: 77.7200, district: 'Anantapur Border', division: 'SCR', category: 'HUB_JUNCTION', platforms: 5, line_speed: 130, electrified: true, kmFromOrigin: 'KM 188', corridors: ['SBC-BAY-GTL'] },

  // --- Kalyana-Karnataka Corridor ---
  { code: 'RC', name: 'Raichur Junction', lat: 16.2000, lng: 77.3500, district: 'Raichur', division: 'SUR/SC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 120', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'SADP', name: 'Saidapur', lat: 16.5500, lng: 77.2700, district: 'Yadgir', division: 'SUR/SC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 165', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'YG', name: 'Yadgir', lat: 16.7600, lng: 77.1400, district: 'Yadgir', division: 'SUR/SC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 190', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'NW', name: 'Nalwar', lat: 16.9800, lng: 77.0100, district: 'Kalaburagi', division: 'SUR/SC', category: 'WAYPOINT', platforms: 2, line_speed: 130, electrified: true, kmFromOrigin: 'KM 215', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'WADI', name: 'Wadi Junction (Grand Trunk Hub)', lat: 17.0600, lng: 76.9900, district: 'Kalaburagi', division: 'SUR/SC', category: 'HUB_JUNCTION', platforms: 5, line_speed: 130, electrified: true, kmFromOrigin: 'KM 228', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'SDB', name: 'Shahabad (Cement Industry)', lat: 17.1300, lng: 76.9300, district: 'Kalaburagi', division: 'SUR/SC', category: 'DISTRICT_STATION', platforms: 3, line_speed: 130, electrified: true, kmFromOrigin: 'KM 238', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'KLBG', name: 'Kalaburagi (Gulbarga Hub)', lat: 17.3300, lng: 76.8300, district: 'Kalaburagi', division: 'SUR/SC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 130, electrified: true, kmFromOrigin: 'KM 265', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'KMPU', name: 'Kamalapur', lat: 17.5800, lng: 77.0100, district: 'Kalaburagi', division: 'SUR/SC', category: 'WAYPOINT', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 295', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'HMBD', name: 'Humnabad', lat: 17.7600, lng: 77.1400, district: 'Bidar', division: 'SUR/SC', category: 'DISTRICT_STATION', platforms: 2, line_speed: 110, electrified: true, kmFromOrigin: 'KM 320', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
  { code: 'BIDR', name: 'Bidar (Crown of Karnataka)', lat: 17.9100, lng: 77.5100, district: 'Bidar', division: 'SUR/SC', category: 'HUB_JUNCTION', platforms: 4, line_speed: 110, electrified: true, kmFromOrigin: 'KM 360', corridors: ['GTL-RC-YG-WADI-KLBG-BIDR'] },
];

export const ALL_KARNATAKA_CORRIDORS: KarnatakaCorridor[] = [
  {
    id: 'SBC-MYS',
    name: 'Bengaluru - Mysuru High-Speed Mainline',
    zone: 'SWR',
    division: 'Bengaluru & Mysuru',
    line_type: 'Double Line Electrified (Auto-Block)',
    gauge: '1676mm Broad Gauge',
    line_speed: 130,
    total_km: 138,
    color: '#06b6d4',
    daily_trains: 85,
    goods_forecast: 24,
    status: 'CLEAR',
    stations: ['SBC', 'NYH', 'KGI', 'HJL', 'BID', 'RMGM', 'CPT', 'SET', 'MAD', 'HNK', 'MYA', 'Y', 'BDRL', 'PANP', 'S', 'NHY', 'MYS'],
    path: [
      [12.9781, 77.5696], [12.9400, 77.5100], [12.9094, 77.4789], [12.8450, 77.4320],
      [12.7981, 77.3828], [12.7247, 77.2818], [12.6508, 77.2025], [12.6100, 77.1300],
      [12.5833, 77.0458], [12.5400, 76.9400], [12.5238, 76.8967], [12.4900, 76.8400],
      [12.4850, 76.8000], [12.4283, 76.6711], [12.4172, 76.6917], [12.3700, 76.6700], [12.3164, 76.6497]
    ],
  },
  {
    id: 'SBC-UBL',
    name: 'Bengaluru - Hubballi Central Trunk Corridor',
    zone: 'SWR',
    division: 'Bengaluru, Mysuru & Hubballi',
    line_type: 'Double Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 130,
    total_km: 470,
    color: '#3b82f6',
    daily_trains: 58,
    goods_forecast: 36,
    status: 'CLEAR',
    stations: ['SBC', 'YPR', 'BAW', 'NMGA', 'KIAT', 'TK', 'GBB', 'AMSA', 'BSN', 'TTR', 'ASK', 'BVR', 'DRU', 'RRB', 'AJP', 'HSD', 'RGI', 'JRU', 'CTA', 'DVG', 'HRR', 'RNR', 'BYD', 'HVR', 'KJG', 'YLG', 'GDI', 'KNO', 'UBL'],
    path: [
      [12.9781, 77.5696], [13.0238, 77.5501], [13.0640, 77.5020], [13.1500, 77.3500],
      [13.3100, 77.1600], [13.3400, 77.1000], [13.3100, 76.9400], [13.2900, 76.7100],
      [13.2700, 76.6000], [13.2600, 76.4800], [13.3100, 76.2500], [13.4300, 76.1600],
      [13.5500, 76.0100], [13.6200, 75.8700], [13.7200, 76.0100], [13.8000, 76.1500],
      [13.8800, 76.2200], [14.0300, 76.3200], [14.2200, 76.4000], [14.4644, 75.9218],
      [14.5800, 75.8000], [14.6200, 75.6200], [14.7100, 75.4900], [14.7950, 75.4050],
      [14.8800, 75.3600], [15.0100, 75.2900], [15.1100, 75.2500], [15.2500, 75.2200], [15.3475, 75.1485]
    ],
  },
  {
    id: 'UBL-BGM',
    name: 'Hubballi - Dharwad - Belagavi Trunk Line',
    zone: 'SWR',
    division: 'Hubballi',
    line_type: 'Double Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 120,
    total_km: 142,
    color: '#8b5cf6',
    daily_trains: 44,
    goods_forecast: 28,
    status: 'CLEAR',
    stations: ['UBL', 'DWR', 'MGD', 'LWR', 'KNP', 'LD', 'DUR', 'BGM', 'SXB', 'SBH', 'GPB', 'CKR', 'RBG', 'KUD'],
    path: [
      [15.3475, 75.1485], [15.4600, 75.0100], [15.4800, 74.8800], [15.4300, 74.7300],
      [15.4500, 74.5100], [15.6300, 74.5200], [15.7500, 74.4800], [15.8500, 74.5000],
      [15.8800, 74.6200], [15.9300, 74.7000], [16.2000, 74.7700], [16.3200, 74.7800],
      [16.5000, 74.7900], [16.6300, 74.8500]
    ],
  },
  {
    id: 'MYS-HAS-MAQ',
    name: 'Mysuru - Hassan - Sakleshpur - Mangaluru Ghats Corridor',
    zone: 'SWR',
    division: 'Mysuru',
    line_type: 'Single Line Mountain Electrified (Banker Assisted)',
    gauge: '1676mm Broad Gauge',
    line_speed: 85,
    total_km: 310,
    color: '#10b981',
    daily_trains: 26,
    goods_forecast: 20,
    status: 'CLEAR',
    stations: ['MYS', 'KRNR', 'AKK', 'HLN', 'HAS', 'ALUR', 'SKLR', 'DOG', 'YDK', 'SBHR', 'KBPR', 'BNTL', 'MAJN', 'MAQ'],
    path: [
      [12.3164, 76.6497], [12.4410, 76.3860], [12.5800, 76.3100], [12.7870, 76.2410],
      [13.0072, 76.1030], [12.9500, 75.9800], [12.8950, 75.7870], [12.8700, 75.7200],
      [12.8200, 75.6200], [12.6680, 75.4740], [12.7660, 75.2070], [12.8940, 75.0400],
      [12.8680, 74.8720], [12.8620, 74.8380]
    ],
  },
  {
    id: 'MAQ-UD-KT-KAWR',
    name: 'Konkan Coastline: Mangaluru - Udupi - Karwar',
    zone: 'KRCL',
    division: 'Karwar (KRCL)',
    line_type: 'Single Line High-Speed Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 120,
    total_km: 267,
    color: '#14b8a6',
    daily_trains: 38,
    goods_forecast: 18,
    status: 'CLEAR',
    stations: ['MAQ', 'MAJN', 'TOK', 'SL', 'MULK', 'UD', 'BKJ', 'KUDA', 'SEN', 'BYNR', 'BTJL', 'MRDW', 'MANK', 'HNA', 'KT', 'GOK', 'ANKL', 'KAWR'],
    path: [
      [12.8620, 74.8380], [12.8680, 74.8720], [12.9600, 74.8200], [13.0110, 74.7950],
      [13.0800, 74.7980], [13.3410, 74.7470], [13.5130, 74.7640], [13.6280, 74.6920],
      [13.7200, 74.6600], [13.8740, 74.6320], [13.9780, 74.5500], [14.0940, 74.4920],
      [14.1900, 74.4700], [14.2800, 74.4500], [14.4250, 74.4170], [14.5450, 74.3490],
      [14.6640, 74.3050], [14.8180, 74.1350]
    ],
  },
  {
    id: 'HAS-ASK-SMET-TLGP',
    name: 'Hassan - Arsikere - Shivamogga - Talguppa (Jog Falls)',
    zone: 'SWR',
    division: 'Mysuru',
    line_type: 'Single Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 100,
    total_km: 215,
    color: '#ec4899',
    daily_trains: 22,
    goods_forecast: 14,
    status: 'CLEAR',
    stations: ['HAS', 'ASK', 'DRU', 'RRB', 'TKE', 'BDVT', 'SME', 'SMET', 'KMSI', 'ANF', 'SRF', 'TLGP'],
    path: [
      [13.0072, 76.1030], [13.3100, 76.2500], [13.5500, 76.0100], [13.6200, 75.8700],
      [13.7100, 75.8100], [13.8400, 75.7000], [13.9100, 75.6000], [13.9299, 75.5681],
      [14.0200, 75.4000], [14.0760, 75.2310], [14.1670, 75.0330], [14.2370, 74.9080]
    ],
  },
  {
    id: 'UBL-GDG-HPT-BAY',
    name: 'Hubballi - Gadag - Hosapete (Hampi) - Ballari Mineral Line',
    zone: 'SWR',
    division: 'Hubballi',
    line_type: 'Double Line Heavy Haul Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 120,
    total_km: 202,
    color: '#f59e0b',
    daily_trains: 64,
    goods_forecast: 48,
    status: 'CLEAR',
    stations: ['UBL', 'NGR', 'GDG', 'BNP', 'KBL', 'GIN', 'MRB', 'HPT', 'GPR', 'TNGL', 'KDT', 'BYC', 'BAY', 'GTL'],
    path: [
      [15.3475, 75.1485], [15.3800, 75.3300], [15.4300, 75.6400], [15.3600, 75.9800],
      [15.3400, 76.1500], [15.3300, 76.2400], [15.3100, 76.3200], [15.2700, 76.3900],
      [15.2400, 76.5400], [15.2200, 76.6700], [15.1800, 76.7900], [15.1500, 76.9000],
      [15.1472, 76.9214], [15.1667, 77.3667]
    ],
  },
  {
    id: 'GDG-BGK-BJP-IDR',
    name: 'Gadag - Bagalkote - Vijayapura - Indi Road (North Karnataka)',
    zone: 'SWR',
    division: 'Hubballi',
    line_type: 'Single Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 110,
    total_km: 249,
    color: '#eab308',
    daily_trains: 24,
    goods_forecast: 22,
    status: 'CLEAR',
    stations: ['GDG', 'MLP', 'BDM', 'GED', 'BGK', 'LMT', 'BSRX', 'KDGI', 'BJP', 'MNL', 'IDR'],
    path: [
      [15.4300, 75.6400], [15.7000, 75.6600], [15.9200, 75.6800], [16.0300, 75.6900],
      [16.1800, 75.7000], [16.3300, 75.8800], [16.5800, 75.9700], [16.7100, 75.8500],
      [16.8300, 75.7100], [16.9600, 75.8200], [17.1100, 75.9600]
    ],
  },
  {
    id: 'UBL-LD-CLR-MAO',
    name: 'Hubballi - Londa - Castle Rock - Dudhsagar (Braganza Ghats)',
    zone: 'SWR',
    division: 'Hubballi',
    line_type: 'Mountain Ghat Banker-Assisted Single/Double Line',
    gauge: '1676mm Broad Gauge',
    line_speed: 60,
    total_km: 112,
    color: '#0284c7',
    daily_trains: 18,
    goods_forecast: 16,
    status: 'CLEAR',
    stations: ['UBL', 'DWR', 'MGD', 'LWR', 'LD', 'TGT', 'CLR', 'CRZ', 'DDS', 'QLM'],
    path: [
      [15.3475, 75.1485], [15.4600, 75.0100], [15.4800, 74.8800], [15.4300, 74.7300],
      [15.4500, 74.5100], [15.4400, 74.3100], [15.4000, 74.2000], [15.3600, 74.2500],
      [15.3100, 74.3100], [15.3200, 74.2400]
    ],
  },
  {
    id: 'SBC-BWT-JTJ',
    name: 'Bengaluru - Whitefield - Bangarapet - KGF - Jolarpettai',
    zone: 'SWR',
    division: 'Bengaluru',
    line_type: 'Quadruple Track & Double Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 130,
    total_km: 105,
    color: '#6366f1',
    daily_trains: 110,
    goods_forecast: 32,
    status: 'CLEAR',
    stations: ['SBC', 'BNC', 'BNCE', 'BYPL', 'KJM', 'HDIH', 'WFD', 'DKN', 'MLO', 'TCL', 'BWT', 'KQZ', 'CHU', 'MKP', 'KSM', 'KPN'],
    path: [
      [12.9781, 77.5696], [12.9930, 77.5980], [12.9980, 77.6150], [12.9928, 77.6515],
      [13.0016, 77.6853], [12.9960, 77.7200], [12.9950, 77.7600], [12.9980, 77.8300],
      [13.0033, 77.9392], [13.0100, 78.0700], [12.9982, 78.2017], [12.9300, 78.2500],
      [12.9150, 78.2700], [12.9100, 78.3000], [12.7500, 78.3600]
    ],
  },
  {
    id: 'SBC-BAY-GTL',
    name: 'Bengaluru - Doddaballapur - Hindupur - Dharmavaram',
    zone: 'SWR',
    division: 'Bengaluru',
    line_type: 'Double Line Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 130,
    total_km: 188,
    color: '#f97316',
    daily_trains: 46,
    goods_forecast: 26,
    status: 'CLEAR',
    stations: ['SBC', 'YPR', 'YNK', 'RNN', 'DBU', 'ORH', 'GBD', 'VWA', 'HUP', 'DMM'],
    path: [
      [12.9781, 77.5696], [13.0238, 77.5501], [13.1000, 77.5800], [13.1900, 77.5600],
      [13.2980, 77.5420], [13.4300, 77.5200], [13.6130, 77.5000], [13.6700, 77.4900],
      [13.8280, 77.4960], [14.4100, 77.7200]
    ],
  },
  {
    id: 'GTL-RC-YG-WADI-KLBG-BIDR',
    name: 'Raichur - Yadgir - Wadi - Kalaburagi - Bidar (Kalyana-Karnataka)',
    zone: 'SCR',
    division: 'Kalaburagi / Solapur & Secunderabad',
    line_type: 'Double Line High-Density Electrified',
    gauge: '1676mm Broad Gauge',
    line_speed: 130,
    total_km: 360,
    color: '#10b981',
    daily_trains: 72,
    goods_forecast: 44,
    status: 'CLEAR',
    stations: ['GTL', 'RC', 'SADP', 'YG', 'NW', 'WADI', 'SDB', 'KLBG', 'KMPU', 'HMBD', 'BIDR'],
    path: [
      [15.1667, 77.3667], [16.2000, 77.3500], [16.5500, 77.2700], [16.7600, 77.1400],
      [16.9800, 77.0100], [17.0600, 76.9900], [17.1300, 76.9300], [17.3300, 76.8300],
      [17.5800, 77.0100], [17.7600, 77.1400], [17.9100, 77.5100]
    ],
  },
];

export const INITIAL_KARNATAKA_FLEET: LiveTrain[] = [
  {
    id: 'train-20607',
    number: '20607',
    name: 'Vande Bharat Express (SBC → MYS)',
    type: 'VANDE_BHARAT',
    corridorId: 'SBC-MYS',
    baseSpeed: 130,
    speedDelta: 0.012,
    direction: 'UP',
    progress: 0.55,
    locoType: 'Trainset 2.0 (KAVACH Auto-Prot)',
    origin: 'KSR Bengaluru (SBC)',
    destination: 'Mysuru Junction (MYS)',
    nextStation: 'Mandya (MYA)',
    eta: '8 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-20661',
    number: '20661',
    name: 'Vande Bharat Express (SBC → DWR)',
    type: 'VANDE_BHARAT',
    corridorId: 'SBC-UBL',
    baseSpeed: 130,
    speedDelta: 0.009,
    direction: 'UP',
    progress: 0.68,
    locoType: 'Trainset 2.0 (Aerodynamic 16-Car)',
    origin: 'KSR Bengaluru (SBC)',
    destination: 'Dharwad (DWR)',
    nextStation: 'Harihar (HRR)',
    eta: '12 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-12007',
    number: '12007',
    name: 'Shatabdi Express (MAS → MYS)',
    type: 'SUPERFAST',
    corridorId: 'SBC-MYS',
    baseSpeed: 120,
    speedDelta: 0.010,
    direction: 'UP',
    progress: 0.28,
    locoType: 'WAP-7 #30489 ELS RPM (Twin Pantograph)',
    origin: 'Chennai Central (MAS)',
    destination: 'Mysuru Junction (MYS)',
    nextStation: 'Ramanagara (RMGM)',
    eta: '14 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-16595',
    number: '16595',
    name: 'Panchaganga Express (SBC → KAWR via MAQ)',
    type: 'SUPERFAST',
    corridorId: 'MAQ-UD-KT-KAWR',
    baseSpeed: 110,
    speedDelta: 0.014,
    direction: 'UP',
    progress: 0.45,
    locoType: 'WAP-7 #37210 ELS KJM (AC Cab)',
    origin: 'KSR Bengaluru (SBC)',
    destination: 'Karwar (KAWR)',
    nextStation: 'Byndoor Mookambika (BYNR)',
    eta: '16 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-16589',
    number: '16589',
    name: 'Rani Chennamma Express (SBC → BGM)',
    type: 'SUPERFAST',
    corridorId: 'UBL-BGM',
    baseSpeed: 110,
    speedDelta: 0.011,
    direction: 'UP',
    progress: 0.35,
    locoType: 'WAP-7 #39012 ELS UBL',
    origin: 'KSR Bengaluru (SBC)',
    destination: 'Belagavi (BGM)',
    nextStation: 'Londa Junction (LD)',
    eta: '15 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-16579',
    number: '16579',
    name: 'Yesvantpur - Shivamogga Intercity',
    type: 'EXPRESS',
    corridorId: 'HAS-ASK-SMET-TLGP',
    baseSpeed: 100,
    speedDelta: 0.013,
    direction: 'UP',
    progress: 0.52,
    locoType: 'WAP-7 #30311 ELS KJM',
    origin: 'Yesvantpur (YPR)',
    destination: 'Shivamogga Town (SMET)',
    nextStation: 'Bhadravati (BDVT)',
    eta: '11 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-16535',
    number: '16535',
    name: 'Gol Gumbaz Express (MYS → BJP)',
    type: 'EXPRESS',
    corridorId: 'GDG-BGK-BJP-IDR',
    baseSpeed: 100,
    speedDelta: 0.012,
    direction: 'UP',
    progress: 0.40,
    locoType: 'WAP-7 #30514 ELS UBL',
    origin: 'Mysuru Junction (MYS)',
    destination: 'Vijayapura (BJP)',
    nextStation: 'Bagalkote (BGK)',
    eta: '18 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'train-07329',
    number: '07329',
    name: 'Braganza Ghat Mountain Shuttle (WDG-4 Bankers)',
    type: 'PASSENGER',
    corridorId: 'UBL-LD-CLR-MAO',
    baseSpeed: 38,
    speedDelta: 0.007,
    direction: 'UP',
    progress: 0.65,
    locoType: 'Twin WDG-4 #12045+#12046 DLS UBL (Dynamic Braking)',
    origin: 'Castle Rock (CLR)',
    destination: 'Kulem (QLM)',
    nextStation: 'Dudhsagar Waterfalls (DDS)',
    eta: '6 mins',
    status: 'RESTRICTED_CAUTION',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'freight-jsw-882',
    number: 'BOXN-882',
    name: 'JSW Steel Pellets Heavy Mineral Haul',
    type: 'FREIGHT',
    corridorId: 'UBL-GDG-HPT-BAY',
    baseSpeed: 65,
    speedDelta: 0.008,
    direction: 'DOWN',
    progress: 0.72,
    locoType: 'WAG-9HC Twin #31822+#31823 ELS BAY (12,000 HP)',
    origin: 'Toranagallu JSW Siding',
    destination: 'Mangaluru Port (NMPT)',
    nextStation: 'Hosapete (HPT)',
    eta: '22 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'freight-fci-441',
    number: 'BCN-441',
    name: 'FCI Essential Foodgrain rake (Raichur → SBC)',
    type: 'FREIGHT',
    corridorId: 'GTL-RC-YG-WADI-KLBG-BIDR',
    baseSpeed: 70,
    speedDelta: 0.009,
    direction: 'UP',
    progress: 0.38,
    locoType: 'WAG-9HC #32001 ELS KZJ',
    origin: 'Raichur Grain Silos',
    destination: 'Whitefield Satellite Goods',
    nextStation: 'Wadi Junction (WADI)',
    eta: '25 mins',
    status: 'RUNNING_NORMAL',
    rtisStatus: 'ISRO RTIS REAL-TIME (SIL-4 LORa/NavIC Locked)',
  },
  {
    id: 'machine-ttm-09',
    number: 'TTM-0932',
    name: 'Plasser Dynamic Track Tamping Machine',
    type: 'MAINTENANCE_MACHINE',
    corridorId: 'SBC-MYS',
    baseSpeed: 45,
    speedDelta: 0.006,
    direction: 'UP',
    progress: 0.76,
    locoType: 'Self-Propelled Track Tamping Unit (SIL-4 Interlocked)',
    origin: 'Mandya (MYA) Possession Base',
    destination: 'Pandavapura (PANP)',
    nextStation: 'Pandavapura (PANP)',
    eta: 'Work In Progress',
    status: 'APPROACHING_BLOCK',
    rtisStatus: 'ISRO RTIS ACTIVE TELEMETRY (GPS + Laser Alignment)',
  },
  {
    id: 'machine-ohe-04',
    number: 'OHE-TWR-04',
    name: '25kV AC Overhead Catenary Inspection Tower Car',
    type: 'MAINTENANCE_MACHINE',
    corridorId: 'SBC-MYS',
    baseSpeed: 35,
    speedDelta: 0.005,
    direction: 'UP',
    progress: 0.60,
    locoType: 'Diesel-Hydraulic 8-Wheeler Tower Car',
    origin: 'Ramanagara (RMGM)',
    destination: 'Mandya (MYA)',
    nextStation: 'Mandya (MYA)',
    eta: 'Possession Active',
    status: 'APPROACHING_BLOCK',
    rtisStatus: 'ISRO RTIS ACTIVE TELEMETRY (OHE Inspection Active)',
  },
];

export function getPointAlongPolyline(points: [number, number][], progress: number): [number, number] {
  if (!points || points.length === 0) return [12.9781, 77.5696];
  if (points.length === 1) return points[0];
  const clamped = Math.max(0, Math.min(1, progress));

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dLat = points[i + 1][0] - points[i][0];
    const dLng = points[i + 1][1] - points[i][1];
    const len = Math.sqrt(dLat * dLat + dLng * dLng);
    segmentLengths.push(len);
    totalLength += len;
  }
  if (totalLength === 0) return points[0];

  const targetDist = clamped * totalLength;
  let currentDist = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    if (currentDist + segmentLengths[i] >= targetDist || i === segmentLengths.length - 1) {
      const segRatio = segmentLengths[i] === 0 ? 0 : (targetDist - currentDist) / segmentLengths[i];
      const lat = points[i][0] + (points[i + 1][0] - points[i][0]) * segRatio;
      const lng = points[i][1] + (points[i + 1][1] - points[i][1]) * segRatio;
      return [lat, lng];
    }
    currentDist += segmentLengths[i];
  }
  return points[points.length - 1];
}

export function getKarnatakaStation(code: string): KarnatakaStation | undefined {
  return ALL_KARNATAKA_STATIONS.find((s) => s.code.toUpperCase() === code.toUpperCase());
}

export function getKarnatakaCorridor(id: string): KarnatakaCorridor | undefined {
  return ALL_KARNATAKA_CORRIDORS.find((c) => c.id.toUpperCase() === id.toUpperCase());
}
