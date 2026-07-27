import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Robot, Drone, Alert } from '@/lib/supabase';

type Props = {
  robots?: Robot[];
  drones?: Drone[];
  alerts?: Alert[];
  hospitals?: { name: string; lat: number; lng: number }[];
  chargingStations?: { name: string; lat: number; lng: number }[];
  victims?: { name: string; lat: number; lng: number }[];
  missions?: { from: { lat: number; lng: number }; to: { lat: number; lng: number } }[];
  className?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
};

// Build a custom div-icon with a given emoji + color.
function makeIcon(emoji: string, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="font-size: 18px; filter: drop-shadow(0 0 6px ${color});">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const robotIcon = makeIcon('🤖', '#00e5ff');
const droneIcon = makeIcon('🚁', '#1e90ff');
const alertIcon = makeIcon('⚠️', '#ff2d55');
const hospitalIcon = makeIcon('🏥', '#00ff9f');
const chargingIcon = makeIcon('🔌', '#ffd60a');
const victimIcon = makeIcon('🆘', '#ff9500');

export default function DisasterMap({
  robots = [],
  drones = [],
  alerts = [],
  hospitals = [],
  chargingStations = [],
  victims = [],
  missions = [],
  className = '',
  height = '500px',
  center = [19.076, 72.8777],
  zoom = 11,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center, zoom, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    robots.forEach((r) => {
      if (r.latitude && r.longitude) {
        L.marker([r.latitude, r.longitude], { icon: robotIcon })
          .addTo(map)
          .bindPopup(`<b>${r.robot_name}</b><br/>${r.robot_id} • ${r.status}<br/>Battery: ${r.battery_percentage}%<br/>${r.current_location ?? ''}`);
      }
    });

    drones.forEach((d) => {
      if (d.latitude && d.longitude) {
        L.marker([d.latitude, d.longitude], { icon: droneIcon })
          .addTo(map)
          .bindPopup(`<b>${d.drone_name}</b><br/>${d.drone_id} • ${d.status}<br/>Battery: ${d.battery}%<br/>Alt: ${d.altitude}m`);
      }
    });

    alerts.filter((a) => a.active).forEach((a) => {
      if (a.latitude && a.longitude) {
        L.marker([a.latitude, a.longitude], { icon: alertIcon })
          .addTo(map)
          .bindPopup(`<b>${a.alert_type} Alert</b><br/>${a.severity} severity<br/>${a.location}<br/>${a.description ?? ''}`);
      }
    });

    hospitals.forEach((h) => {
      L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(map).bindPopup(`<b>${h.name}</b><br/>Hospital`);
    });

    chargingStations.forEach((c) => {
      L.marker([c.lat, c.lng], { icon: chargingIcon }).addTo(map).bindPopup(`<b>${c.name}</b><br/>Charging Station`);
    });

    victims.forEach((v) => {
      L.marker([v.lat, v.lng], { icon: victimIcon }).addTo(map).bindPopup(`<b>${v.name}</b><br/>Victim awaiting rescue`);
    });

    missions.forEach((m) => {
      L.polyline([[m.from.lat, m.from.lng], [m.to.lat, m.to.lng]], {
        color: '#00e5ff',
        weight: 2,
        opacity: 0.7,
        dashArray: '6 8',
      }).addTo(map);
    });
  }, [robots, drones, alerts, hospitals, chargingStations, victims, missions]);

  return <div ref={containerRef} className={`rounded-2xl overflow-hidden border border-cyber-cyan/20 ${className}`} style={{ height }} />;
}
