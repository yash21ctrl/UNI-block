'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore, EmergencyDetails } from '../../lib/store';
import { CORRIDORS } from '../../lib/constants';
import {
  AlertTriangle,
  X,
  Radio,
  Train,
  Clock,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface StationOption {
  name: string;
  code: string;
  kmPost: number;
  lat: number;
  lng: number;
}

const CORRIDOR_STATIONS: Record<string, StationOption[]> = {
  // Northern & North Central
  'NDLS-AGC': [
    { name: 'Palwal', code: 'PWL', kmPost: 58.2, lat: 28.143, lng: 77.327 },
    { name: 'Kosi Kalan', code: 'KSV', kmPost: 88.4, lat: 27.794, lng: 77.433 },
    { name: 'Mathura Jn', code: 'MTJ', kmPost: 141.2, lat: 27.492, lng: 77.674 },
    { name: 'Raja Ki Mandi', code: 'RKM', kmPost: 188.0, lat: 27.198, lng: 77.994 },
    { name: 'Agra Cantt', code: 'AGC', kmPost: 195.0, lat: 27.159, lng: 78.006 },
  ],
  'AGC-JHS': [
    { name: 'Dholpur', code: 'DHO', kmPost: 52.4, lat: 26.697, lng: 77.897 },
    { name: 'Morena', code: 'MRA', kmPost: 79.8, lat: 26.498, lng: 77.995 },
    { name: 'Gwalior Jn', code: 'GWL', kmPost: 118.5, lat: 26.218, lng: 78.183 },
    { name: 'Dabra', code: 'DBA', kmPost: 161.0, lat: 25.892, lng: 78.334 },
    { name: 'Jhansi', code: 'JHS', kmPost: 215.0, lat: 25.448, lng: 78.569 },
  ],
  'JHS-BPL': [
    { name: 'Babina', code: 'BAB', kmPost: 25.0, lat: 25.234, lng: 78.471 },
    { name: 'Lalitpur', code: 'LAR', kmPost: 90.0, lat: 24.686, lng: 78.414 },
    { name: 'Bina Jn', code: 'BINA', kmPost: 153.0, lat: 24.175, lng: 78.186 },
    { name: 'Ganj Basoda', code: 'BAQ', kmPost: 199.0, lat: 23.852, lng: 77.935 },
    { name: 'Vidisha', code: 'BHS', kmPost: 238.0, lat: 23.525, lng: 77.818 },
    { name: 'Bhopal', code: 'BPL', kmPost: 292.0, lat: 23.260, lng: 77.413 },
  ],
  'NDLS-GZB': [
    { name: 'New Delhi', code: 'NDLS', kmPost: 0.0, lat: 28.643, lng: 77.219 },
    { name: 'Anand Vihar', code: 'ANVT', kmPost: 12.5, lat: 28.650, lng: 77.315 },
    { name: 'Sahibabad', code: 'SBB', kmPost: 18.0, lat: 28.667, lng: 77.375 },
    { name: 'Ghaziabad', code: 'GZB', kmPost: 25.0, lat: 28.668, lng: 77.438 },
  ],
  'GZB-ALJN': [
    { name: 'Ghaziabad', code: 'GZB', kmPost: 0.0, lat: 28.668, lng: 77.438 },
    { name: 'Dadri', code: 'DER', kmPost: 26.0, lat: 28.552, lng: 77.554 },
    { name: 'Khurja Jn', code: 'KRJ', kmPost: 52.0, lat: 28.254, lng: 77.854 },
    { name: 'Aligarh Jn', code: 'ALJN', kmPost: 106.0, lat: 27.897, lng: 78.088 },
  ],
  'ALJN-CNB': [
    { name: 'Aligarh Jn', code: 'ALJN', kmPost: 0.0, lat: 27.897, lng: 78.088 },
    { name: 'Tundla Jn', code: 'TDL', kmPost: 78.0, lat: 27.208, lng: 78.241 },
    { name: 'Etawah Jn', code: 'ETW', kmPost: 170.0, lat: 26.776, lng: 79.027 },
    { name: 'Phaphund', code: 'PHD', kmPost: 226.0, lat: 26.565, lng: 79.467 },
    { name: 'Kanpur Central', code: 'CNB', kmPost: 304.0, lat: 26.455, lng: 80.351 },
  ],
  'CNB-PRYJ': [
    { name: 'Kanpur Central', code: 'CNB', kmPost: 0.0, lat: 26.455, lng: 80.351 },
    { name: 'Fatehpur', code: 'FTP', kmPost: 78.0, lat: 25.928, lng: 80.812 },
    { name: 'Sirathu', code: 'SRO', kmPost: 138.0, lat: 25.648, lng: 81.319 },
    { name: 'Prayagraj', code: 'PRYJ', kmPost: 194.0, lat: 25.45, lng: 81.828 },
  ],
  'PRYJ-DDU': [
    { name: 'Naini Jn', code: 'NYN', kmPost: 7.4, lat: 25.385, lng: 81.868 },
    { name: 'Mirzapur', code: 'MZP', kmPost: 89.2, lat: 25.146, lng: 82.569 },
    { name: 'Chunar Jn', code: 'CAR', kmPost: 120.5, lat: 25.124, lng: 82.883 },
    { name: 'Pt Deen Dayal Upadhyaya', code: 'DDU', kmPost: 153.0, lat: 25.28, lng: 83.121 },
  ],
  'NDLS-UMB': [
    { name: 'Sonipat', code: 'SNP', kmPost: 44.0, lat: 28.988, lng: 77.019 },
    { name: 'Panipat', code: 'PNP', kmPost: 89.0, lat: 29.390, lng: 76.963 },
    { name: 'Karnal', code: 'KUN', kmPost: 123.0, lat: 29.686, lng: 76.990 },
    { name: 'Kurukshetra', code: 'KKDE', kmPost: 156.0, lat: 29.969, lng: 76.878 },
    { name: 'Ambala Cantt', code: 'UMB', kmPost: 198.0, lat: 30.361, lng: 76.838 },
  ],
  'UMB-LDH': [
    { name: 'Rajpura Jn', code: 'RPJ', kmPost: 28.0, lat: 30.484, lng: 76.594 },
    { name: 'Sirhind Jn', code: 'SIR', kmPost: 53.0, lat: 30.642, lng: 76.385 },
    { name: 'Khanna', code: 'KNN', kmPost: 71.0, lat: 30.702, lng: 76.216 },
    { name: 'Ludhiana', code: 'LDH', kmPost: 114.0, lat: 30.901, lng: 75.857 },
  ],
  'NDLS-RE': [
    { name: 'Delhi Cantt', code: 'DEC', kmPost: 14.0, lat: 28.591, lng: 77.121 },
    { name: 'Gurgaon', code: 'GGN', kmPost: 31.0, lat: 28.468, lng: 77.018 },
    { name: 'Pataudi Road', code: 'PTRD', kmPost: 61.0, lat: 28.324, lng: 76.782 },
    { name: 'Rewari', code: 'RE', kmPost: 84.0, lat: 28.192, lng: 76.619 },
  ],
  'BSB-DDU': [
    { name: 'Varanasi Jn', code: 'BSB', kmPost: 0.0, lat: 25.327, lng: 82.987 },
    { name: 'Kashi', code: 'KEI', kmPost: 6.0, lat: 25.315, lng: 83.032 },
    { name: 'Pt Deen Dayal Upadhyaya', code: 'DDU', kmPost: 18.0, lat: 25.28, lng: 83.121 },
  ],

  // South Indian Railway Corridors (Southern Railway, South Central, South Western)
  'MAS-SBC': [
    { name: 'MGR Chennai Central', code: 'MAS', kmPost: 0.0, lat: 13.0827, lng: 80.2707 },
    { name: 'Arakkonam Jn', code: 'AJJ', kmPost: 68.5, lat: 13.0784, lng: 79.6685 },
    { name: 'Katpadi Jn', code: 'KPD', kmPost: 129.8, lat: 12.9698, lng: 79.1368 },
    { name: 'Jolarpettai Jn', code: 'JTJ', kmPost: 213.4, lat: 12.5684, lng: 78.5835 },
    { name: 'Bangarapet Jn', code: 'BWT', kmPost: 288.7, lat: 12.9961, lng: 78.2017 },
    { name: 'Krishnarajapuram', code: 'KJM', kmPost: 345.0, lat: 12.9996, lng: 77.6836 },
    { name: 'KSR Bengaluru City', code: 'SBC', kmPost: 359.0, lat: 12.9784, lng: 77.5696 },
  ],
  'MAS-BZA': [
    { name: 'MGR Chennai Central', code: 'MAS', kmPost: 0.0, lat: 13.0827, lng: 80.2707 },
    { name: 'Gummidipundi', code: 'GPD', kmPost: 47.0, lat: 13.4072, lng: 80.1297 },
    { name: 'Gudur Jn', code: 'GDR', kmPost: 138.2, lat: 14.1481, lng: 79.8497 },
    { name: 'Nellore', code: 'NLR', kmPost: 176.5, lat: 14.4426, lng: 79.9865 },
    { name: 'Ongole', code: 'OGL', kmPost: 293.0, lat: 15.5057, lng: 80.0499 },
    { name: 'Chirala', code: 'CLX', kmPost: 342.5, lat: 15.8252, lng: 80.3541 },
    { name: 'Tenali Jn', code: 'TEL', kmPost: 400.0, lat: 16.2437, lng: 80.6480 },
    { name: 'Vijayawada Jn', code: 'BZA', kmPost: 431.0, lat: 16.5173, lng: 80.6200 },
  ],
  'BZA-SC': [
    { name: 'Vijayawada Jn', code: 'BZA', kmPost: 0.0, lat: 16.5173, lng: 80.6200 },
    { name: 'Madhira', code: 'MDR', kmPost: 54.0, lat: 16.9205, lng: 80.3644 },
    { name: 'Khammam', code: 'KMT', kmPost: 99.0, lat: 17.2473, lng: 80.1514 },
    { name: 'Mahbubabad', code: 'MABD', kmPost: 147.0, lat: 17.5986, lng: 80.0041 },
    { name: 'Warangal', code: 'WL', kmPost: 207.0, lat: 17.9689, lng: 79.5941 },
    { name: 'Kazipet Jn', code: 'KZJ', kmPost: 217.0, lat: 17.9787, lng: 79.5192 },
    { name: 'Jangaon', code: 'ZN', kmPost: 265.0, lat: 17.7247, lng: 79.1554 },
    { name: 'Bhongir', code: 'BG', kmPost: 302.0, lat: 17.5117, lng: 78.8893 },
    { name: 'Secunderabad Jn', code: 'SC', kmPost: 349.0, lat: 17.4344, lng: 78.5017 },
  ],
  'SBC-MYS': [
    { name: 'KSR Bengaluru City', code: 'SBC', kmPost: 0.0, lat: 12.9784, lng: 77.5696 },
    { name: 'Kengeri', code: 'KGI', kmPost: 12.2, lat: 12.9090, lng: 77.4815 },
    { name: 'Bidadi', code: 'BID', kmPost: 30.0, lat: 12.7983, lng: 77.3828 },
    { name: 'Ramanagaram', code: 'RMGM', kmPost: 44.5, lat: 12.7226, lng: 77.2831 },
    { name: 'Channapatna', code: 'CPT', kmPost: 56.0, lat: 12.6517, lng: 77.2023 },
    { name: 'Mandya', code: 'MYA', kmPost: 93.0, lat: 12.5273, lng: 76.8986 },
    { name: 'Srirangapatna', code: 'S', kmPost: 123.5, lat: 12.4216, lng: 76.6874 },
    { name: 'Mysuru Jn', code: 'MYS', kmPost: 138.0, lat: 12.3164, lng: 76.6433 },
  ],
  'MAS-CBE': [
    { name: 'MGR Chennai Central', code: 'MAS', kmPost: 0.0, lat: 13.0827, lng: 80.2707 },
    { name: 'Katpadi Jn', code: 'KPD', kmPost: 129.8, lat: 12.9698, lng: 79.1368 },
    { name: 'Jolarpettai Jn', code: 'JTJ', kmPost: 213.4, lat: 12.5684, lng: 78.5835 },
    { name: 'Morappur', code: 'MAP', kmPost: 268.0, lat: 12.1287, lng: 78.3986 },
    { name: 'Salem Jn', code: 'SA', kmPost: 334.0, lat: 11.6643, lng: 78.1460 },
    { name: 'Erode Jn', code: 'ED', kmPost: 394.0, lat: 11.3410, lng: 77.7172 },
    { name: 'Tiruppur', code: 'TUP', kmPost: 444.0, lat: 11.1085, lng: 77.3411 },
    { name: 'Coimbatore Jn', code: 'CBE', kmPost: 497.0, lat: 11.0016, lng: 76.9628 },
  ],
  'CBE-PGT': [
    { name: 'Coimbatore Jn', code: 'CBE', kmPost: 0.0, lat: 11.0016, lng: 76.9628 },
    { name: 'Podanur Jn', code: 'PTJ', kmPost: 6.0, lat: 10.9634, lng: 76.9744 },
    { name: 'Madukkarai', code: 'MDKI', kmPost: 16.0, lat: 10.9022, lng: 76.9620 },
    { name: 'Walayar', code: 'WRA', kmPost: 29.0, lat: 10.8407, lng: 76.8552 },
    { name: 'Kanjikode', code: 'KJKD', kmPost: 41.5, lat: 10.7909, lng: 76.7497 },
    { name: 'Palakkad Jn', code: 'PGT', kmPost: 54.0, lat: 10.8037, lng: 76.6493 },
  ],
  'ERS-TVC': [
    { name: 'Ernakulam Jn', code: 'ERS', kmPost: 0.0, lat: 9.9676, lng: 76.2882 },
    { name: 'Tripunithura', code: 'TRTR', kmPost: 10.0, lat: 9.9511, lng: 76.3533 },
    { name: 'Kottayam', code: 'KTYM', kmPost: 60.0, lat: 9.5916, lng: 76.5222 },
    { name: 'Changanassery', code: 'CGY', kmPost: 78.0, lat: 9.4447, lng: 76.5392 },
    { name: 'Tiruvalla', code: 'TRVL', kmPost: 86.0, lat: 9.3853, lng: 76.5746 },
    { name: 'Chengannur', code: 'CNGR', kmPost: 95.0, lat: 9.3175, lng: 76.6163 },
    { name: 'Mavelikara', code: 'MVLK', kmPost: 107.0, lat: 9.2678, lng: 76.5492 },
    { name: 'Kayamkulam Jn', code: 'KYJ', kmPost: 115.0, lat: 9.1724, lng: 76.5028 },
    { name: 'Kollam Jn', code: 'QLN', kmPost: 156.0, lat: 8.8879, lng: 76.5956 },
    { name: 'Varkala Sivagiri', code: 'VAK', kmPost: 179.0, lat: 8.7339, lng: 76.7164 },
    { name: 'Thiruvananthapuram Central', code: 'TVC', kmPost: 206.0, lat: 8.4875, lng: 76.9525 },
  ],
  'RU-GTL': [
    { name: 'Renigunta Jn', code: 'RU', kmPost: 0.0, lat: 13.6521, lng: 79.5161 },
    { name: 'Koduru', code: 'KOU', kmPost: 41.0, lat: 13.9572, lng: 79.3512 },
    { name: 'Razampeta', code: 'RJP', kmPost: 74.5, lat: 14.1950, lng: 79.1601 },
    { name: 'Kadapa', code: 'HX', kmPost: 125.0, lat: 14.4753, lng: 78.8251 },
    { name: 'Yerraguntla Jn', code: 'YA', kmPost: 164.0, lat: 14.6347, lng: 78.5364 },
    { name: 'Tadipatri', code: 'TU', kmPost: 233.0, lat: 14.9083, lng: 78.0142 },
    { name: 'Gooty Jn', code: 'GY', kmPost: 281.0, lat: 15.1167, lng: 77.6333 },
    { name: 'Guntakal Jn', code: 'GTL', kmPost: 310.0, lat: 15.1667, lng: 77.3667 },
  ],
};

const DEFECT_TYPES = [
  {
    id: 'CRITICAL_USFD_RAIL_FRACTURE',
    label: '💥 Ultrasonic Rail Fracture',
    department: 'Engineering' as const,
    defaultMinutes: 180,
    desc: 'Deep transverse crack on running railhead detected by USFD trolley.',
  },
  {
    id: 'OHE_CATENARY_SNAP',
    label: '⚡ OHE Catenary Wire Snap',
    department: 'TRD' as const,
    defaultMinutes: 120,
    desc: '25kV AC overhead contact wire severed. Immediate power block mandatory.',
  },
  {
    id: 'SIGNAL_INTERLOCKING_FAILURE',
    label: '🚨 Point Machine & Signal Failure',
    department: 'Signal & Telecom' as const,
    defaultMinutes: 60,
    desc: 'Points unable to lock in reverse position; all signals defaulting to Danger (Red).',
  },
  {
    id: 'TRACK_OBSTRUCTION_BOULDER',
    label: '🛑 Track Obstruction / Tree Fall',
    department: 'Operating' as const,
    defaultMinutes: 90,
    desc: 'Physical obstruction blocking Up/Down line. Complete traffic suspension.',
  },
];

export function StationMasterEmergencyModal() {
  const emergencyModalOpen = useAppStore((s) => s.emergencyModalOpen);
  const setEmergencyModalOpen = useAppStore((s) => s.setEmergencyModalOpen);
  const triggerEmergency = useAppStore((s) => s.triggerEmergency);
  const selectedSection = useAppStore((s) => s.selectedSection);
  const selectedBlock = useAppStore((s) => s.selectedBlock);

  const initialCorridor = selectedBlock?.section || selectedSection || 'NDLS-AGC';
  const [corridor, setCorridor] = useState<string>(initialCorridor);
  const [selectedStationCode, setSelectedStationCode] = useState<string>('KSV');
  const [defectTypeId, setDefectTypeId] = useState<string>('CRITICAL_USFD_RAIL_FRACTURE');
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [customKm, setCustomKm] = useState<string>('88.4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens or selected block changes
  React.useEffect(() => {
    if (emergencyModalOpen) {
      const target = selectedBlock?.section || selectedSection || 'NDLS-AGC';
      setCorridor(target);
      const stations = CORRIDOR_STATIONS[target] || [
        { name: 'Kosi Kalan', code: 'KSV', kmPost: 88.4, lat: 27.794, lng: 77.433 },
      ];
      if (stations.length > 0) {
        // Smart match station from selectedBlock's reason, name, or code
        let matchedStation = stations[0];
        if (selectedBlock?.reason) {
          const rLower = selectedBlock.reason.toLowerCase();
          const found = stations.find(
            (st) => rLower.includes(st.name.toLowerCase()) || rLower.includes(`(${st.code.toLowerCase()})`) || rLower.includes(st.code.toLowerCase())
          );
          if (found) matchedStation = found;
        }
        setSelectedStationCode(matchedStation.code);
        setCustomKm(matchedStation.kmPost.toString());
      }
    }
  }, [emergencyModalOpen, selectedBlock, selectedSection]);

  // Available stations for selected corridor
  const availableStations = useMemo(() => {
    return (
      CORRIDOR_STATIONS[corridor] || [
        { name: 'Kosi Kalan', code: 'KSV', kmPost: 88.4, lat: 27.794, lng: 77.433 },
        { name: 'Palwal', code: 'PWL', kmPost: 58.2, lat: 28.143, lng: 77.327 },
      ]
    );
  }, [corridor]);

  // Current station
  const currentStation = useMemo(() => {
    return (
      availableStations.find((s) => s.code === selectedStationCode) || availableStations[0]
    );
  }, [availableStations, selectedStationCode]);

  // Selected defect
  const currentDefect = useMemo(() => {
    return DEFECT_TYPES.find((d) => d.id === defectTypeId) || DEFECT_TYPES[0];
  }, [defectTypeId]);

  if (!emergencyModalOpen) return null;

  const handleCorridorChange = (newCorridor: string) => {
    setCorridor(newCorridor);
    const stations = CORRIDOR_STATIONS[newCorridor];
    if (stations && stations.length > 0) {
      setSelectedStationCode(stations[0].code);
      setCustomKm(stations[0].kmPost.toString());
    }
  };

  const handleStationChange = (code: string) => {
    setSelectedStationCode(code);
    const st = availableStations.find((s) => s.code === code);
    if (st) {
      setCustomKm(st.kmPost.toString());
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const km = parseFloat(customKm) || currentStation.kmPost;

    await triggerEmergency({
      corridor,
      stationName: currentStation.name,
      stationCode: currentStation.code,
      kmPost: km,
      lat: currentStation.lat,
      lng: currentStation.lng,
      defectType: currentDefect.id,
      department: currentDefect.department,
      durationMinutes,
      targetBlockId: selectedBlock?.section === corridor ? selectedBlock?.block_id : undefined,
      description: `Station Master [${currentStation.code}] issued Red Emergency Notice for ${currentDefect.label} at km ${km} on ${corridor}. All oncoming traffic buffered safely.`,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none font-mono">
      <div className="bg-[#0B101B] border-2 border-rose-600/80 rounded-2xl w-full max-w-2xl shadow-2xl shadow-rose-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 p-4 border-b border-rose-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950 animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Station Master Emergency Dispatch Console
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-rose-900 uppercase">
                  RED CAUTION
                </span>
              </div>
              <p className="text-[11px] text-rose-200">
                Indian Railways Control Office (COA) • Instant 208ms Corridor Safe Injection
              </p>
            </div>
          </div>

          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="text-rose-200 hover:text-white p-1.5 rounded-lg hover:bg-rose-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs text-slate-200">
          {/* Step 1: Corridor & Station Selection */}
          <div className="space-y-2">
            {selectedBlock && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-600/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
                  <span className="text-slate-300">
                    Targeting Selected Block: <b className="text-rose-300">{selectedBlock.block_id}</b> on{' '}
                    <b className="text-cyan-300">{selectedBlock.section}</b> ({selectedBlock.department})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold uppercase tracking-wider shrink-0">
                  Target Locked
                </span>
              </div>
            )}

            <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <span>1. Select Corridor & Station Location</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Railway Corridor:</label>
                <select
                  value={corridor}
                  onChange={(e) => handleCorridorChange(e.target.value)}
                  className="w-full bg-surface-muted text-white border border-surface-border rounded-lg p-2.5 font-mono focus:outline-none focus:border-rose-500"
                >
                  {CORRIDORS.map((c) => (
                    <option key={c.section_code} value={c.section_code}>
                      {c.section_code} ({c.section_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Station / Block Hut:</label>
                <select
                  value={selectedStationCode}
                  onChange={(e) => handleStationChange(e.target.value)}
                  className="w-full bg-surface-muted text-white border border-surface-border rounded-lg p-2.5 font-mono focus:outline-none focus:border-rose-500"
                >
                  {availableStations.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code}) — km {st.kmPost}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exact KM Post override */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-slate-400">Kilometre Post:</span>
              <input
                type="text"
                value={customKm}
                onChange={(e) => setCustomKm(e.target.value)}
                placeholder="e.g. 88.4"
                className="w-24 bg-surface-muted border border-surface-border rounded px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500">
                (GPS: {currentStation.lat.toFixed(3)}° N, {currentStation.lng.toFixed(3)}° E)
              </span>
            </div>
          </div>

          {/* Step 2: Emergency Defect Type */}
          <div className="space-y-2 pt-2 border-t border-surface-border/80">
            <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              2. Defect Classification & Department
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFECT_TYPES.map((defect) => {
                const isSelected = defect.id === defectTypeId;
                return (
                  <div
                    key={defect.id}
                    onClick={() => {
                      setDefectTypeId(defect.id);
                      setDurationMinutes(defect.defaultMinutes);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition space-y-1 ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500 shadow-md'
                        : 'bg-surface-muted/60 border-surface-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{defect.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                          defect.department === 'Engineering'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600'
                            : defect.department === 'TRD'
                            ? 'bg-blue-950 text-blue-300 border border-blue-600'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        }`}
                      >
                        {defect.department}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{defect.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Required Possession Window */}
          <div className="space-y-2 pt-2 border-t border-surface-border/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                3. Requested Possession Window
              </label>
              <span className="text-white font-bold text-sm">{durationMinutes} Minutes</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[60, 120, 180].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-lg font-bold border transition text-center ${
                    durationMinutes === mins
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-surface-muted border-surface-border text-slate-300 hover:text-white'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Safety & Train Protection Guarantee */}
          <div className="p-3 rounded-xl bg-surface-muted/80 border border-surface-border flex items-start space-x-2.5 text-[11px]">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-300">Guardian Autonomous Safety Lock:</p>
              <p className="text-slate-400 text-[10px]">
                Oncoming trains (e.g. Bhopal Shatabdi 12002 and Vande Bharat 22436) will be held at
                preceding station loops or re-routed with guaranteed ≥30 min safety buffer.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-[#070A10] p-4 border-t border-surface-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(false)}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white border border-surface-border hover:bg-slate-800 transition text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white transition shadow-lg shadow-rose-950 flex items-center justify-center space-x-2"
          >
            <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>
              {isSubmitting ? 'Injecting in 208ms...' : '🚨 Transmit Red Caution & Lock Block'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
