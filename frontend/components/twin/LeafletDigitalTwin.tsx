'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  KarnatakaStation,
  KarnatakaCorridor,
  LiveTrain,
  getPointAlongPolyline,
} from '../../lib/karnatakaGis';

interface LeafletDigitalTwinProps {
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
}

export function LeafletDigitalTwin({
  corridors,
  stations,
  trains,
  selectedCorridorId,
  selectedStation,
  selectedTrain,
  activeEmergency,
  onSelectCorridor,
  onSelectStation,
  onSelectTrain,
}: LeafletDigitalTwinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{
    corridors: any[];
    stations: any[];
    trains: any[];
  }>({
    corridors: [],
    stations: [],
    trains: [],
  });

  // 1. Initialize Map once
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [14.5, 75.8],
        zoom: 7,
        minZoom: 6,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // High-contrast CartoDB Dark Matter tiles (Sleek Mission-Control Theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom top-left zoom control
      L.control.zoom({ position: 'topleft' }).addTo(map);

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Corridors and Stations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let isMounted = true;
    async function updateStaticLayers() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapInstanceRef.current) return;

      // Clean up previous corridor and station layers
      layersRef.current.corridors.forEach((l) => l.remove());
      layersRef.current.stations.forEach((l) => l.remove());
      layersRef.current.corridors = [];
      layersRef.current.stations = [];

      // A. Render Corridors
      corridors.forEach((corridor) => {
        const isSelected = selectedCorridorId === corridor.id;
        const isCorridorBlocked =
          corridor.status === 'POSSESSION_ACTIVE' ||
          (activeEmergency && corridor.id === 'SBC-MYS');

        const polyline = L.polyline(corridor.path, {
          color: isCorridorBlocked ? '#ef4444' : isSelected ? '#38bdf8' : corridor.color,
          weight: isSelected ? 6 : selectedCorridorId === 'ALL' ? 4 : 2,
          opacity: selectedCorridorId === 'ALL' || isSelected ? 0.9 : 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        });

        polyline.on('click', () => onSelectCorridor(corridor.id));
        polyline.bindTooltip(
          `<strong>${corridor.name}</strong><br/><span style="color:#94a3b8">Status: ${corridor.status} • ${corridor.line_speed} km/h</span>`,
          { className: 'leaflet-dark-tooltip', sticky: true }
        );

        polyline.addTo(map);
        layersRef.current.corridors.push(polyline);
      });

      // B. Render Stations (159 Karnataka stations)
      stations.forEach((stn) => {
        const isMatchCorridor =
          selectedCorridorId === 'ALL' || stn.corridors.includes(selectedCorridorId);
        if (!isMatchCorridor) return;

        const isHub = stn.category === 'HUB_JUNCTION';
        const isGhat = stn.category === 'GHAT_SECTION';
        const isTerminal = stn.category === 'MAJOR_TERMINAL';

        const markerColor = isHub
          ? '#22d3ee'
          : isGhat
          ? '#f59e0b'
          : isTerminal
          ? '#34d399'
          : '#94a3b8';

        const marker = L.circleMarker([stn.lat, stn.lng], {
          radius: isHub ? 6 : isTerminal || isGhat ? 5 : 3.5,
          color: '#0f172a',
          weight: 1.5,
          fillColor: markerColor,
          fillOpacity: 0.95,
        });

        marker.on('click', () => onSelectStation(stn));
        marker.bindTooltip(
          `<strong>${stn.name} (${stn.code})</strong><br/><span style="color:#67e8f9">${stn.category} • ${stn.district}</span>`,
          { className: 'leaflet-dark-tooltip', direction: 'top', offset: [0, -6] }
        );

        marker.addTo(map);
        layersRef.current.stations.push(marker);
      });
    }

    updateStaticLayers();

    return () => {
      isMounted = false;
    };
  }, [corridors, stations, selectedCorridorId, activeEmergency, onSelectCorridor, onSelectStation]);

  // 3. Pan / Zoom when selectedCorridorId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedCorridorId !== 'ALL') {
      const c = corridors.find((x) => x.id === selectedCorridorId);
      if (c && c.path.length > 0) {
        const mid = c.path[Math.floor(c.path.length / 2)];
        map.flyTo(mid, 9, { duration: 0.8 });
        return;
      }
    }
    map.flyTo([14.5, 75.8], 7, { duration: 0.8 });
  }, [selectedCorridorId, corridors]);

  // 4. Update Moving Train Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let isMounted = true;
    async function updateTrains() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapInstanceRef.current) return;

      layersRef.current.trains.forEach((l) => l.remove());
      layersRef.current.trains = [];

      trains.forEach((train) => {
        const corridor = corridors.find((c) => c.id === train.corridorId);
        if (!corridor) return;

        const [tLat, tLng] = getPointAlongPolyline(corridor.path, train.progress);
        const isVandeBharat = train.type === 'VANDE_BHARAT';
        const isFreight = train.type === 'FREIGHT';
        const isMachine = train.type === 'MAINTENANCE_MACHINE';

        const badgeBg = isVandeBharat
          ? '#0284c7'
          : isFreight
          ? '#d97706'
          : isMachine
          ? '#ea580c'
          : '#059669';

        const iconHtml = `
          <div style="transform: translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="background:${badgeBg}; color:white; font-size:9px; font-weight:bold; font-family:monospace; padding:1px 4px; border-radius:4px; border:1px solid rgba(255,255,255,0.4); white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.6);">
              🚂 ${train.number} | ${train.baseSpeed}km/h
            </div>
            <div style="width:8px; height:8px; border-radius:50%; background:#38bdf8; border:2px solid #0f172a; margin-top:2px; box-shadow:0 0 8px #38bdf8;"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-train-marker',
          iconSize: [80, 30],
        });

        const trainMarker = L.marker([tLat, tLng], { icon: customIcon });
        trainMarker.on('click', () => onSelectTrain(train));
        trainMarker.addTo(map);

        layersRef.current.trains.push(trainMarker);
      });
    }

    updateTrains();

    return () => {
      isMounted = false;
    };
  }, [trains, corridors, onSelectTrain]);

  return <div ref={containerRef} className="w-full h-full min-h-[420px]" />;
}
