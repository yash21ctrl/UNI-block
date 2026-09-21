export interface JEUserProfile {
  id: string; // e.g. "01", "02", "03", "04"
  name: string;
  role: string;
  employeeId: string;
  department: 'Engineering' | 'Signal & Telecom' | 'Traction Distribution';
  section: string;
  defaultKmFrom: number;
  defaultKmTo: number;
  stationCode: string;
  stationName: string;
  avatarColor: string;
  workNatureDefault: string;
  workDescriptionDefault: string;
}

export const DEFAULT_JE_USERS: Record<string, JEUserProfile> = {
  '01': {
    id: '01',
    name: 'P. Ramesh',
    role: 'Junior Engineer (JE / P-Way)',
    employeeId: 'IR-JE-01',
    department: 'Engineering',
    section: 'SBC-MYS',
    defaultKmFrom: 105.0,
    defaultKmTo: 108.0,
    stationCode: 'MYA',
    stationName: 'Mandya',
    avatarColor: 'bg-blue-600 text-white',
    workNatureDefault: 'Through Rail Renewal (TRR) & Weld Testing',
    workDescriptionDefault: 'USFD rail crack renewal and track tamping required near Mandya Yard.',
  },
  '02': {
    id: '02',
    name: 'Suresh Kumar',
    role: 'Junior Engineer (JE / S&T)',
    employeeId: 'IR-JE-02',
    department: 'Signal & Telecom',
    section: 'SBC-MYS',
    defaultKmFrom: 45.0,
    defaultKmTo: 46.2,
    stationCode: 'RMGM',
    stationName: 'Ramanagara',
    avatarColor: 'bg-emerald-600 text-white',
    workNatureDefault: 'Point Machine Motor Overhaul & Interlocking Test',
    workDescriptionDefault: 'Switch blade gap > 4mm at Ramanagara Down Yard point 22A. Motor calibration required.',
  },
  '03': {
    id: '03',
    name: 'K. Venkatesh',
    role: 'Junior Engineer (JE / TRD)',
    employeeId: 'IR-JE-03',
    department: 'Traction Distribution',
    section: 'SBC-MYS',
    defaultKmFrom: 18.0,
    defaultKmTo: 22.5,
    stationCode: 'KGI',
    stationName: 'Kengeri',
    avatarColor: 'bg-amber-600 text-white',
    workNatureDefault: '25kV OHE Catenary Inspection & Power Isolation',
    workDescriptionDefault: 'Contact wire height adjustment and dropper replacement on Up Main line near Kengeri.',
  },
  '04': {
    id: '04',
    name: 'Ananya Sharma',
    role: 'Junior Engineer (JE / Track Maintenance)',
    employeeId: 'IR-JE-04',
    department: 'Engineering',
    section: 'SBC-MYS',
    defaultKmFrom: 34.0,
    defaultKmTo: 36.5,
    stationCode: 'BID',
    stationName: 'Bidadi',
    avatarColor: 'bg-purple-600 text-white',
    workNatureDefault: 'Deep Ballast Screening & Mechanical Tamping',
    workDescriptionDefault: 'Ballast cleaning and dynamic track stabilizer pass at Bidadi crossover point 11B.',
  },
};

export function getJEUser(id: string | null | undefined): JEUserProfile {
  if (!id) return DEFAULT_JE_USERS['01'];
  const clean = id.trim().padStart(2, '0');
  if (DEFAULT_JE_USERS[clean]) return DEFAULT_JE_USERS[clean];

  // Dynamically generate a valid profile for any custom user ID (e.g. 05, 12, 99)
  return {
    id: clean,
    name: `Er. Field JE-${clean}`,
    role: 'Junior Engineer (JE / P-Way)',
    employeeId: `IR-JE-${clean}`,
    department: 'Engineering',
    section: 'SBC-MYS',
    defaultKmFrom: 50.0,
    defaultKmTo: 52.0,
    stationCode: 'BID',
    stationName: 'Bidadi',
    avatarColor: 'bg-slate-700 text-white',
    workNatureDefault: 'Track Maintenance Requisition',
    workDescriptionDefault: `Track maintenance and safety inspection registered by Operator ID ${clean}.`,
  };
}
