// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  ALL_KARNATAKA_STATIONS,
  ALL_KARNATAKA_CORRIDORS,
  INITIAL_KARNATAKA_FLEET,
  getPointAlongPolyline,
  KarnatakaStation,
  KarnatakaCorridor,
  LiveTrain,
} from '../../lib/karnatakaGis';
import { useAppStore } from '../../lib/store';
import {
  Train,
  Shield,
  Radio,
  CheckCircle2,
  Compass,
  RefreshCw,
  MapPin,
  X,
  Layers,
} from 'lucide-react';
import { LeafletDigitalTwin } from './LeafletDigitalTwin';

export type MapFilterType = 'ALL' | 'RUNNING' | 'MAINTENANCE' | 'EMERGENCY';
export type MapLayerType = 'dark' | 'satellite' | 'railway' | 'osm';

interface InnerTwinMapProps {
  height?: string;
  onSectionSelect?: (sectionCode: string) => void;
  filter?: MapFilterType;
  layerType?: MapLayerType;
  focusSection?: string | null;
}

// Built-in Google Maps Platform Key (from backend configuration)
const GMP_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyDgqLOkIOR6X0w7JRuTe_VeSN1ANClssHQ';

// Custom Google Maps Polyline Component for Tracks
function TrackPolyline({
  path,
  color,
  strokeWeight = 4,
  strokeOpacity = 0.85,
  isBlocked = false,
  isHovered = false,
  onClick,
}: {
  path: [number, number][];
  color: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  isBlocked?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google || !window.google.maps) return;

    const polyline = new google.maps.Polyline({
      path: path.map(([lat, lng]) => ({ lat, lng })),
      geodesic: true,
      strokeColor: isBlocked ? '#ef4444' : isHovered ? '#38bdf8' : color,
      strokeOpacity: isBlocked ? 0.95 : isHovered ? 1.0 : strokeOpacity,
      strokeWeight: isBlocked ? 7 : isHovered ? 6 : strokeWeight,
      zIndex: isBlocked ? 30 : isHovered ? 25 : 10,
      map,
    });

    if (onClick) {
      polyline.addListener('click', onClick);
    }

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, color, strokeWeight, strokeOpacity, isBlocked, isHovered, onClick]);

  return null;
}

// Helper to center the map when focus corridor changes
function MapCameraController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);
  return null;
}

// Google Maps Viewport with all 159 stations and live trains
function GoogleMapsDigitalTwin({
  corridors,
  stations,
  trains,
  selectedCorridorId,
  selectedStation,
  selectedTrain,
  mapType,
  activeEmergency,
  onSelectCorridor,
  onSelectStation,
  onSelectTrain,
}: {
  corridors: KarnatakaCorridor[];
  stations: KarnatakaStation[];
  trains: LiveTrain[];
  selectedCorridorId: string;
  selectedStation: KarnatakaStation | null;
  selectedTrain: LiveTrain | null;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  activeEmergency: boolean;
  onSelectCorridor: (id: string) => void;
  onSelectStation: (stn: KarnatakaStation | null) => void;
  onSelectTrain: (tr: LiveTrain | null) => void;
}) {
  const centerConfig = useMemo(() => {
    if (selectedCorridorId !== 'ALL') {
      const c = corridors.find((x) => x.id === selectedCorridorId);
      if (c && c.path.length > 0) {
        const mid = c.path[Math.floor(c.path.length / 2)];
        return { center: { lat: mid[0], lng: mid[1] }, zoom: 9 };
      }
    }
    return { center: { lat: 14.5, lng: 75.8 }, zoom: 7 };
  }, [selectedCorridorId, corridors]);

  return (
    <Map
      id="karnataka-twin-gmp-map"
      mapId="DEMO_MAP_ID"
      defaultCenter={centerConfig.center}
      defaultZoom={centerConfig.zoom}
      mapTypeId={mapType}
      gestureHandling="greedy"
      disableDefaultUI={false}
      zoomControl={true}
      streetViewControl={false}
      fullscreenControl={true}
      colorScheme="DARK"
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
      className="w-full h-full"
    >
      <MapCameraController center={centerConfig.center} zoom={centerConfig.zoom} />

      {/* 1. Track Polylines across all Karnataka Corridors */}
      {corridors.map((corridor) => {
        const isSelected = selectedCorridorId === corridor.id;
        const isCorridorBlocked =
          corridor.status === 'POSSESSION_ACTIVE' ||
          (activeEmergency && corridor.id === 'SBC-MYS');

        return (
          <TrackPolyline
            key={corridor.id}
            path={corridor.path}
            color={corridor.color}
            strokeWeight={isSelected ? 6 : 4}
            strokeOpacity={selectedCorridorId === 'ALL' || isSelected ? 0.9 : 0.35}
            isBlocked={isCorridorBlocked}
            isHovered={isSelected}
            onClick={() => onSelectCorridor(corridor.id)}
          />
        );
      })}

      {/* 2. Stations (159 across Karnataka) */}
      {stations.map((stn) => {
        const isMatchCorridor =
          selectedCorridorId === 'ALL' ||
          stn.corridors.includes(selectedCorridorId);
        if (!isMatchCorridor) return null;

        const isHub = stn.category === 'HUB_JUNCTION';
        const isGhat = stn.category === 'GHAT_SECTION';
        const isTerminal = stn.category === 'MAJOR_TERMINAL';

        return (
          <AdvancedMarker
            key={stn.code}
            position={{ lat: stn.lat, lng: stn.lng }}
            onClick={() => onSelectStation(stn)}
            title={`${stn.name} (${stn.code}) - ${stn.district} - ${stn.line_speed} km/h`}
            zIndex={isHub ? 40 : 20}
          >
            {isHub ? (
              <div className="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
                <div className="w-4 h-4 bg-cyan-400 border-2 border-slate-900 rounded-sm rotate-45 shadow-[0_0_10px_#22d3ee] flex items-center justify-center" />
                <span className="absolute -bottom-4 text-[9px] font-black font-mono tracking-tighter bg-slate-950/90 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/40 shadow-xs pointer-events-none whitespace-nowrap">
                  {stn.code}
                </span>
              </div>
            ) : isGhat ? (
              <div className="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
                <div className="w-3.5 h-3.5 bg-amber-400 border-2 border-slate-900 rounded-full shadow-[0_0_8px_#f59e0b] flex items-center justify-center" />
                <span className="absolute -bottom-4 text-[8px] font-mono bg-slate-950/80 text-amber-300 px-1 rounded border border-amber-500/30 pointer-events-none whitespace-nowrap">
                  {stn.code}
                </span>
              </div>
            ) : isTerminal ? (
              <div className="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
                <div className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-sm shadow-[0_0_8px_#34d399]" />
                <span className="absolute -bottom-4 text-[8px] font-mono bg-slate-950/80 text-emerald-300 px-1 rounded border border-emerald-500/30 pointer-events-none whitespace-nowrap">
                  {stn.code}
                </span>
              </div>
            ) : (
              <div className="group relative flex items-center justify-center cursor-pointer">
                <div className="w-2 h-2 bg-slate-300 rounded-full border border-slate-900 shadow-xs hover:w-3 hover:h-3 hover:bg-white transition-all" />
              </div>
            )}
          </AdvancedMarker>
        );
      })}

      {/* 3. Live Train Fleet Markers (ISRO RTIS Moving Trains) */}
      {trains.map((train) => {
        const corridor = corridors.find((c) => c.id === train.corridorId);
        if (!corridor) return null;
        const [tLat, tLng] = getPointAlongPolyline(corridor.path, train.progress);

        const isVandeBharat = train.type === 'VANDE_BHARAT';
        const isFreight = train.type === 'FREIGHT';
        const isMachine = train.type === 'MAINTENANCE_MACHINE';

        return (
          <AdvancedMarker
            key={train.id}
            position={{ lat: tLat, lng: tLng }}
            onClick={() => onSelectTrain(train)}
            title={`${train.number} ${train.name} (${train.baseSpeed} km/h)`}
            zIndex={100}
          >
            <div className="cursor-pointer group flex flex-col items-center">
              <div
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg border whitespace-nowrap flex items-center gap-1 ${
                  isVandeBharat
                    ? 'bg-blue-600 text-white border-blue-400'
                    : isFreight
                    ? 'bg-amber-600 text-white border-amber-400'
                    : isMachine
                    ? 'bg-orange-600 text-white border-orange-400 animate-pulse'
                    : 'bg-emerald-600 text-white border-emerald-400'
                }`}
              >
                <Train className="w-2.5 h-2.5" />
                <span>{train.number}</span>
                <span className="opacity-75">| {train.baseSpeed}km/h</span>
              </div>

              <div className="relative mt-0.5">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg ${
                    isVandeBharat
                      ? 'bg-cyan-400'
                      : isFreight
                      ? 'bg-amber-400'
                      : isMachine
                      ? 'bg-orange-500'
                      : 'bg-emerald-400'
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                </div>
                <div
                  className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                    isVandeBharat
                      ? 'bg-cyan-400'
                      : isFreight
                      ? 'bg-amber-400'
                      : isMachine
                      ? 'bg-orange-500'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}

// MAIN EXPORT COMPONENT
export default function InnerTwinMap({
  height = '560px',
  onSectionSelect,
  filter = 'ALL',
  layerType: initialLayerType = 'dark',
  focusSection,
}: InnerTwinMapProps) {
  const selectedSection = useAppStore((s) => s.selectedSection);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);
  const activePlan = useAppStore((s) => s.activePlan);

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<KarnatakaStation | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google'>('leaflet');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>(
    initialLayerType === 'satellite' ? 'hybrid' : 'roadmap'
  );

  const [trains, setTrains] = useState<LiveTrain[]>(INITIAL_KARNATAKA_FLEET);

  // Suppress unbilled Google Maps alert popup dialog so demo never breaks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalAlert = window.alert;
    window.alert = function (msg: any) {
      if (
        typeof msg === 'string' &&
        (msg.includes('Google Maps') || msg.includes('own this website'))
      ) {
        console.warn('Suppressed Google Maps unbilled project alert. Fallback to High-Contrast Rail GIS.');
        setMapEngine('leaflet');
        return;
      }
      return originalAlert.apply(window, arguments as any);
    };

    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Auth/Billing required. Switching to High-Contrast Rail GIS.');
      setMapEngine('leaflet');
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Live Train Movement Simulation (Every 1.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setTrains((prev) =>
        prev.map((t) => {
          let nextProgress = t.progress + t.speedDelta;
          let nextDelta = t.speedDelta;

          if (nextProgress > 0.96) {
            nextProgress = 0.96;
            nextDelta = -Math.abs(t.speedDelta);
          } else if (nextProgress < 0.04) {
            nextProgress = 0.04;
            nextDelta = Math.abs(t.speedDelta);
          }

          return {
            ...t,
            progress: nextProgress,
            speedDelta: nextDelta,
            direction: nextDelta >= 0 ? 'UP' : 'DOWN',
          };
        })
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (focusSection && focusSection !== selectedCorridorId) {
      setSelectedCorridorId(focusSection);
    }
  }, [focusSection, selectedCorridorId]);

  const handleSelectCorridor = (id: string) => {
    setSelectedCorridorId(id);
    setSelectedSection(id);
    if (onSectionSelect) {
      onSectionSelect(id);
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] flex flex-col shadow-2xl font-mono"
      style={{ height }}
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="z-10 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-black tracking-wider text-sm uppercase">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
            <span>Karnataka Railway Twin</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/40">
            SWR HUBBALLI HQ • KONKAN RAILWAY
          </span>
          <span className="text-slate-400 text-[11px]">
            {ALL_KARNATAKA_STATIONS.length} Stations • 12 Corridors
          </span>
        </div>

        {/* Engine Switcher: Leaflet vs Google Maps */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMapEngine('leaflet')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              mapEngine === 'leaflet'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="High-Contrast Offline Rail GIS (Zero API Key / Zero Quota limits)"
          >
            <Layers className="w-3 h-3" />
            <span>High-Contrast Rail GIS</span>
            <span className="text-[9px] bg-slate-950/40 text-slate-950 px-1 rounded font-mono font-bold">100% FREE</span>
          </button>
          <button
            onClick={() => setMapEngine('google')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              mapEngine === 'google'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Google Maps Platform"
          >
            <span>Google Maps</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              mapType === 'roadmap'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Railway
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              mapType === 'hybrid'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              mapType === 'terrain'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mapEngine === 'leaflet' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rail GIS Online (159 Stations)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Maps Platform Active</span>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedCorridorId('ALL');
              setSelectedStation(null);
              setSelectedTrain(null);
            }}
            title="Reset Map View"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CORRIDOR SELECTION BAR */}
      <div className="z-10 bg-slate-950/80 backdrop-blur-xs border-b border-slate-800/60 px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
        <button
          onClick={() => handleSelectCorridor('ALL')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition ${
            selectedCorridorId === 'ALL'
              ? 'bg-cyan-400 text-slate-950 shadow-md'
              : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Karnataka (12 Lines)
        </button>

        {ALL_KARNATAKA_CORRIDORS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelectCorridor(c.id)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCorridorId === c.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: c.color }}
            />
            <span>{c.name.split(':')[0]}</span>
          </button>
        ))}
      </div>

      {/* MAP BODY CONTAINER */}
      <div className="relative flex-1 w-full h-full min-h-[420px]">
        {mapEngine === 'leaflet' ? (
          <LeafletDigitalTwin
            corridors={ALL_KARNATAKA_CORRIDORS}
            stations={ALL_KARNATAKA_STATIONS}
            trains={trains}
            selectedCorridorId={selectedCorridorId}
            selectedStation={selectedStation}
            selectedTrain={selectedTrain}
            mapType={mapType}
            activeEmergency={isEmergencyActive}
            onSelectCorridor={handleSelectCorridor}
            onSelectStation={setSelectedStation}
            onSelectTrain={setSelectedTrain}
          />
        ) : (
          <APIProvider apiKey={GMP_API_KEY} solutionChannel="GMP_antigravity_railblock_v1">
            <GoogleMapsDigitalTwin
              corridors={ALL_KARNATAKA_CORRIDORS}
              stations={ALL_KARNATAKA_STATIONS}
              trains={trains}
              selectedCorridorId={selectedCorridorId}
              selectedStation={selectedStation}
              selectedTrain={selectedTrain}
              mapType={mapType}
              activeEmergency={isEmergencyActive}
              onSelectCorridor={handleSelectCorridor}
              onSelectStation={setSelectedStation}
              onSelectTrain={setSelectedTrain}
            />
          </APIProvider>
        )}

        {/* FLOATING STATION DOSSIER MODAL */}
        {selectedStation && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-white">{selectedStation.name}</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300">
                  CODE: {selectedStation.code} • {selectedStation.district}
                </span>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Division</span>
                <span className="font-bold text-slate-200">{selectedStation.division}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Line Speed</span>
                <span className="font-bold text-cyan-400">{selectedStation.line_speed} km/h</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Platforms</span>
                <span className="font-bold text-slate-200">{selectedStation.platforms} Running</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Electrification</span>
                <span className="font-bold text-emerald-400">25kV AC Catenary</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
              <span className="text-slate-400 block text-[10px]">Corridor Connections</span>
              <div className="flex flex-wrap gap-1">
                {selectedStation.corridors.map((cId) => (
                  <span
                    key={cId}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/40"
                  >
                    {cId}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>SIL-4 Interlocking Locked</span>
              </span>
              <span className="text-[10px] text-slate-400">Track Circuit Clear</span>
            </div>
          </div>
        )}

        {/* FLOATING TRAIN TELEMETRY MODAL */}
        {selectedTrain && (
          <div className="absolute bottom-4 left-4 z-30 w-84 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">{selectedTrain.name}</span>
                  <span className="text-[11px] font-mono text-cyan-300">
                    TRAIN #{selectedTrain.number} • {selectedTrain.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrain(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Speed (Telemetry)</span>
                <span className="font-bold text-cyan-300 text-sm">{selectedTrain.baseSpeed} km/h</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Next Station ETA</span>
                <span className="font-bold text-emerald-400">{selectedTrain.eta}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Locomotive Class</span>
                <span className="text-slate-200 font-bold">{selectedTrain.locoType}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Next Station</span>
                <span className="text-cyan-300 font-bold">{selectedTrain.nextStation}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-500/30 p-2 rounded-lg text-[10px] text-blue-300">
              <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{selectedTrain.rtisStatus}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
