"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const icon = new L.Icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BrigadeMapProps {
  address: string;
}

async function getCoordinates(address: string): Promise<[number, number]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data && data[0]) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return [20.6597, -103.3496];
}

export function BrigadeMap({ address }: BrigadeMapProps) {
  const [position, setPosition] = useState<[number, number]>([20.6597, -103.3496]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoordinates(address).then((coords) => {
      setPosition(coords);
      setLoading(false);
    });
  }, [address]);

  if (loading) {
    return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      className="h-48 rounded-xl"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={icon} />
    </MapContainer>
  );
}
