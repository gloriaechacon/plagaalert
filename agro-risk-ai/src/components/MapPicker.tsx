import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type MapPickerProps = {
  value: LatLngLiteral | null;
  onChange: (coords: LatLngLiteral) => void;
};

function ClickHandler({ value, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!value) return null;

  return (
    <Marker
      position={value}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target as L.Marker;
          const position = marker.getLatLng();
          onChange({
            lat: position.lat,
            lng: position.lng,
          });
        },
      }}
    />
  );
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const defaultCenter: LatLngLiteral = value ?? { lat: -31.4201, lng: -64.1888 };

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={value ? 12 : 5}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}