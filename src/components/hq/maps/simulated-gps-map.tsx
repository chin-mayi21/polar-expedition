"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapMarker } from "@/lib/maps/expedition-map-data";

const kindColor: Record<MapMarker["kind"], string> = {
  station: "#127475",
  checkin: "#1CA7C4",
  incident: "#C1272D",
};

export function SimulatedGpsMap({
  markers,
  center,
}: {
  markers: MapMarker[];
  center: [number, number];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom: 4,
      attributionControl: {},
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    mapRef.current = map;

    const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });

    map.on("load", () => {
      for (const m of markers) {
        const el = document.createElement("div");
        el.className = "h-3 w-3 rounded-full border-2 border-white shadow-md";
        el.style.backgroundColor = kindColor[m.kind];

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map);

        el.addEventListener("mouseenter", () => {
          popup
            .setLngLat([m.lng, m.lat])
            .setHTML(
              `<strong>${m.title}</strong><br/><span style="font-size:11px">${m.subtitle}</span>${
                m.at ? `<br/><span style="font-size:10px;font-family:monospace">${m.at.slice(0, 19)}Z</span>` : ""
              }`
            )
            .addTo(map);
        });
        el.addEventListener("mouseleave", () => popup.remove());
        marker.getElement().setAttribute("aria-label", `${m.kind}: ${m.title}`);
      }

      if (markers.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        markers.forEach((m) => bounds.extend([m.lng, m.lat]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 6 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [markers, center]);

  return (
    <div className="overflow-hidden border border-border bg-surface rounded-[2px]">
      <div className="border-b border-border px-4 py-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber">Simulated GPS — MapLibre</p>
        <p className="text-xs text-text-secondary">
          Stations, last check-in per mission, and open incident positions. Not live tracking.
        </p>
      </div>
      <div ref={containerRef} className="h-[min(420px,55vh)] w-full" role="img" aria-label="Antarctic expedition map with simulated positions" />
      <ul className="flex flex-wrap gap-3 border-t border-border px-4 py-2 text-[10px] text-text-secondary">
        <li><span className="inline-block h-2 w-2 rounded-full bg-teal" /> Station</li>
        <li><span className="inline-block h-2 w-2 rounded-full bg-cyan" /> Check-in</li>
        <li><span className="inline-block h-2 w-2 rounded-full bg-red" /> Incident</li>
      </ul>
    </div>
  );
}
