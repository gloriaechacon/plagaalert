import type { PredictionResponse } from "../types/prediction";
import DashboardCardHeader from "./DashboardCardHeader";

type ResultScreenProps = {
  data: PredictionResponse | null;
  onViewEvolution?: () => void;
  onBack?: () => void;
};

function getRiskColor(value: number) {
  if (value >= 70) return "#ef4444";
  if (value >= 40) return "#f59e0b";
  return "#10b981";
}

function getTrendClass(trend: string) {
  const lowerTrend = trend.toLowerCase();
  if (lowerTrend.includes("increasing") || lowerTrend.includes("peak")) return "danger";
  if (lowerTrend.includes("decreasing") || lowerTrend.includes("stable")) return "success";
  return "warning";
}

export default function ResultScreen({ data, onViewEvolution, onBack }: ResultScreenProps) {
  const riskValue = data?.risk ?? 0;
  const riskLabel = data?.risk_level ?? "UNKNOWN";
  const riskColor = getRiskColor(riskValue);
  const trend = data?.trend ?? "Risk trend unavailable";
  const trendClass = getTrendClass(trend);

  const temperature = data?.factors?.temperature ?? 0;
  const humidity = data?.factors?.humidity ?? 0;
  const rainfall = data?.factors?.rainfall ?? 0;

  const mainCause = data?.main_cause ?? "Unable to determine primary risk driver";
  const recommendations = data?.recommendations ?? [];
  const impact = data?.impact ?? "Impact data unavailable";
  const confidence = data?.confidence ?? 0;
  const locationName = data?.location?.name ?? "Unknown location";
  const crop = data?.crop ?? "Unknown crop";

  const aiInsight =
    (data as PredictionResponse & { ai_insight?: string })?.ai_insight ??
    "AI-generated agronomic insight will appear here once Gemini is connected. For now, this prediction is based on real climate data and our internal risk engine.";

  const getTemperatureNote = (temp: number) => {
    if (temp >= 28) return "Above optimal threshold";
    if (temp >= 20) return "Within normal range";
    return "Below optimal threshold";
  };

  const getHumidityNote = (hum: number) => {
    if (hum >= 70) return "High humidity";
    if (hum >= 40) return "Moderate humidity";
    return "Low humidity";
  };

  const getRainfallNote = (rain: number) => {
    if (rain >= 10) return "Recent rainfall";
    if (rain > 0) return "Light rainfall";
    return "No recent rainfall";
  };

  const getRecommendationIcon = (index: number) => {
    const icons = ["✅", "👁️", "🕒", "📋", "🌿", "💧"];
    return icons[index % icons.length];
  };

  return (
    <div className="page">
      <div className="card result-card">
        <DashboardCardHeader
          title="Risk Analysis Result"
          subtitle={`${locationName} — ${crop.charAt(0).toUpperCase() + crop.slice(1)}`}
        />

        <div className="gauge-section">
          <div
            className="gauge"
            style={
              {
                "--value": `${riskValue}`,
                "--risk-color": riskColor,
              } as React.CSSProperties
            }
          >
            <div className="gauge-inner">
              <div className="gauge-value">{riskValue}%</div>
              <div className="gauge-label" style={{ color: riskColor }}>
                {riskLabel}
              </div>
              <div className="gauge-note">
                {riskValue >= 70
                  ? "High probability of pest outbreak"
                  : riskValue >= 40
                    ? "Moderate risk of pest activity"
                    : "Low probability of pest outbreak"}
              </div>
            </div>
          </div>
        </div>

        <div className={`trend-banner ${trendClass}`}>
          <span className="trend-icon">{trend.toLowerCase().includes("increasing") ? "↗" : "→"}</span>
          <span>{trend}</span>
        </div>

        <div className="factors-grid">
          <div className="factor-card">
            <div className="factor-icon">🌡️</div>
            <div className="factor-title">Temperature</div>
            <div className="factor-value">{temperature}°C</div>
            <div className="factor-note">{getTemperatureNote(temperature)}</div>
          </div>

          <div className="factor-card">
            <div className="factor-icon">💧</div>
            <div className="factor-title">Humidity</div>
            <div className="factor-value">{humidity}%</div>
            <div className="factor-note">{getHumidityNote(humidity)}</div>
          </div>

          <div className="factor-card">
            <div className="factor-icon">🌧️</div>
            <div className="factor-title">Rainfall</div>
            <div className="factor-value">{rainfall} mm</div>
            <div className="factor-note">{getRainfallNote(rainfall)}</div>
          </div>
        </div>

        <div className="cause-card">
          <div className="section-label">Primary Risk Driver</div>
          <div className="cause-text">{mainCause}</div>
        </div>

        <div className="cause-card">
          <div className="section-label">AI Insight</div>
          <div className="cause-text">{aiInsight}</div>
        </div>

        <div className="recommendations-card">
          <div className="recommendations-title">
            Recommended Actions (Next 3 Days)
          </div>

          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">{getRecommendationIcon(index)}</span>
                <span>{rec}</span>
              </div>
            ))
          ) : (
            <div className="recommendation-item">
              <span className="recommendation-icon">ℹ️</span>
              <span>No specific recommendations available</span>
            </div>
          )}
        </div>

        <div className="impact-card">
          <span className="impact-icon">⚠️</span>
          <span>{impact}</span>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">Confidence</div>
            <div className="meta-value">{Math.round(confidence * 100)}%</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">Data</div>
            <div className="meta-value">Real-time climate API</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">Model</div>
            <div className="meta-value">Risk engine + AI layer</div>
          </div>
        </div>

        <div className="dual-actions">
          <button className="secondary-btn" onClick={onBack}>
            New Prediction
          </button>

          <button className="submit-btn" onClick={onViewEvolution}>
            View Risk Evolution (7 Days)
          </button>
        </div>
      </div>
    </div>
  );
}