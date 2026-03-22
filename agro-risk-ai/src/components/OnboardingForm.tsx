import { useState } from "react";
import type { LatLngLiteral } from "leaflet";
import MapPicker from "./MapPicker";
import type { PredictionResponse, PredictionRequest } from "../types/prediction";
import logo from "../assets/plagaalert_logo.png";

function predictUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (trimmed) {
    const base = trimmed.replace(/\/+$/, "");
    return `${base}/predict`;
  }
  if (import.meta.env.DEV) {
    return "/api/predict";
  }
  return "http://127.0.0.1:8000/predict";
}

const cropOptions = [
  { value: "maize", label: "Maize" },
  { value: "soybean", label: "Soybean" },
];

type OnboardingFormProps = {
  onPredictionSuccess: (data: PredictionResponse) => void;
};

type ExplanationStyle = "simple" | "technical";

export default function OnboardingForm({ onPredictionSuccess }: OnboardingFormProps) {
  const [location, setLocation] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<LatLngLiteral | null>(null);
  const [crop, setCrop] = useState("");
  const [useCurrentConditions, setUseCurrentConditions] = useState(true);
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>("simple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!crop) {
      setError("Please select a crop.");
      return;
    }

    if (!selectedPoint && !location.trim()) {
      setError("Please select a point on the map or enter a fallback text location.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const requestBody: PredictionRequest = {
        crop,
        explanation_style: explanationStyle,
        latitude: selectedPoint?.lat,
        longitude: selectedPoint?.lng,
        location: location.trim() || undefined,
      };

      const response = await fetch(predictUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const rawText = await response.text();

      type ErrorResponse = {
        detail?: string;
      };

      let data: PredictionResponse | ErrorResponse = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error("Invalid response from server.");
      }

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      onPredictionSuccess(data as PredictionResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch prediction. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card onboarding-card">
        <img
          src={logo}
          alt="PlagaAlert"
        />

        <h2 className="subtitle">Anticipate pest outbreaks and monitor crop risks with real-time environmental data.</h2>

        <p className="subtitle">
          Select an exact point on the map and choose your crop to get an{" "}
          <span className="badge">AI-powered</span> risk forecast
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="field-group">
            <label className="label">Field Location</label>
            <MapPicker value={selectedPoint} onChange={setSelectedPoint} />
            {selectedPoint && (
              <p className="toggle-help" style={{ marginTop: "8px" }}>
                Selected point: {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="field-group">
            <label className="label" htmlFor="location">
              Or Text Location (optional)
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📍</span>
              <input
                id="location"
                type="text"
                placeholder="Córdoba, Argentina"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="crop">
              Crop Type
            </label>
            <select
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="select"
              disabled={loading}
            >
              <option value="">Select a crop</option>
              {cropOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="explanationStyle">
              Explanation Style
            </label>
            <select
              id="explanationStyle"
              value={explanationStyle}
              onChange={(e) => setExplanationStyle(e.target.value as ExplanationStyle)}
              className="select"
              disabled={loading}
            >
              <option value="simple">Simple</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div className="toggle-row">
            <div>
              <p className="toggle-label">Use current conditions</p>
              <p className="toggle-help">
                Auto-detect climate conditions for the selected location
              </p>
            </div>

            <button
              type="button"
              className={`toggle ${useCurrentConditions ? "active" : ""}`}
              onClick={() => setUseCurrentConditions((prev) => !prev)}
              aria-pressed={useCurrentConditions}
              disabled={loading}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Generating..." : "✦ Generate Prediction"}
          </button>
        </form>

        <div className="helper-row">
          <span className="helper-chip">Exact map selection</span>
          <span className="helper-chip">Real-time climate data</span>
          <span className="helper-chip">Fast risk forecast</span>
        </div>
      </div>
    </div>
  );
}