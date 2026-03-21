import { useState } from "react";
import type { PredictionResponse, PredictionRequest } from "../types/prediction";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const cropOptions = [
  { value: "maize", label: "Maize" },
  { value: "soybean", label: "Soybean" },
];

type OnboardingFormProps = {
  onPredictionSuccess: (data: PredictionResponse) => void;
};

export default function OnboardingForm({ onPredictionSuccess }: OnboardingFormProps) {
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [useCurrentConditions, setUseCurrentConditions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!location.trim() || !crop) {
      setError("Please enter a location and select a crop.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const requestBody: PredictionRequest = {
        location: location.trim(),
        crop,
      };

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      onPredictionSuccess(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prediction. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="icon-wrapper">
          <span className="icon">🌱</span>
        </div>

        <h1 className="title">Predict Crop Risk</h1>

        <p className="subtitle">
          Enter your crop and location to get an{" "}
          <span className="badge">AI-powered</span> risk forecast
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="field-group">
            <label className="label" htmlFor="location">
              Location
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📍</span>
              <input
                id="location"
                type="text"
                placeholder="Enter location (e.g., Córdoba, Argentina)"
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

          <div className="toggle-row">
            <div>
              <p className="toggle-label">Use current conditions</p>
              <p className="toggle-help">
                Auto-detect climate conditions for this location
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
          <span className="helper-chip">AI-powered</span>
          <span className="helper-chip">Real-time climate data</span>
          <span className="helper-chip">Fast risk forecast</span>
        </div>
      </div>
    </div>
  );
}
