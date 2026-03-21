import type { PredictionResponse, ForecastDay } from "../types/prediction";

type SimulationScreenProps = {
  data: PredictionResponse | null;
  onBack?: () => void;
  onRunAgain?: () => void;
};

// Default forecast data as fallback
const defaultForecastData: ForecastDay[] = [
  { day: "Day 1", risk: 50 },
  { day: "Day 2", risk: 55 },
  { day: "Day 3", risk: 60 },
  { day: "Day 4", risk: 65 },
  { day: "Day 5", risk: 60 },
  { day: "Day 6", risk: 55 },
  { day: "Day 7", risk: 50 },
];

function formatForecastDay(dayString: string): string {
  // If it's already a short format, return as-is
  if (dayString.length <= 5) return dayString;
  
  // Try to parse as date
  try {
    const date = new Date(dayString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
  } catch {
    // Fall through to return original
  }
  return dayString;
}

function generateWithActionData(forecastData: ForecastDay[]): ForecastDay[] {
  // Simulate preventive action reducing risk by ~20-30%
  return forecastData.map((item, index) => {
    const reduction = Math.min(0.3, 0.1 + index * 0.03);
    const reducedRisk = Math.max(20, Math.round(item.risk * (1 - reduction)));
    return {
      day: item.day,
      risk: reducedRisk,
    };
  });
}

function buildPoints(data: ForecastDay[]) {
  const width = 620;
  const height = 260;
  const paddingX = 28;
  const paddingY = 20;
  const maxRisk = 100;

  return data
    .map((item, index) => {
      const x =
        paddingX +
        (index * (width - paddingX * 2)) / (data.length - 1 || 1);
      const y =
        height - paddingY - (item.risk / maxRisk) * (height - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function buildAreaPath(data: ForecastDay[]) {
  const width = 620;
  const height = 260;
  const paddingX = 28;
  const paddingY = 20;
  const maxRisk = 100;

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index * (width - paddingX * 2)) / (data.length - 1 || 1);
    const y =
      height - paddingY - (item.risk / maxRisk) * (height - paddingY * 2);
    return { x, y };
  });

  if (points.length === 0) return "";

  const first = points[0];
  const last = points[points.length - 1];

  return `
    M ${first.x} ${height - paddingY}
    L ${first.x} ${first.y}
    ${points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")}
    L ${last.x} ${height - paddingY}
    Z
  `;
}

export default function SimulationScreen({
  data,
  onBack,
  onRunAgain,
}: SimulationScreenProps) {
  // Use real forecast data or fallback
  const forecastData: ForecastDay[] = data?.forecast?.length
    ? data.forecast.map((item) => ({
        day: formatForecastDay(item.day),
        risk: item.risk,
      }))
    : defaultForecastData;

  const withActionData = generateWithActionData(forecastData);

  const withoutActionPoints = buildPoints(forecastData);
  const withActionPoints = buildPoints(withActionData);
  const withoutActionArea = buildAreaPath(forecastData);

  // Find peak day
  const peakIndex = forecastData.reduce(
    (maxIdx, item, idx, arr) =>
      item.risk > arr[maxIdx].risk ? idx : maxIdx,
    0
  );
  const peakDay = forecastData[peakIndex]?.day ?? "N/A";
  const peakRisk = forecastData[peakIndex]?.risk ?? 0;
  const peakRiskWithAction = withActionData[peakIndex]?.risk ?? 0;
  const riskReduction = peakRisk - peakRiskWithAction;

  const locationName = data?.location?.name ?? "Unknown location";
  const crop = data?.crop ?? "Unknown crop";

  return (
    <div className="page">
      <div className="card simulation-card">
        <div className="icon-wrapper">
          <span className="icon">📈</span>
        </div>

        <h1 className="title">Risk Evolution</h1>
        <p className="subtitle">
          {locationName} - {crop.charAt(0).toUpperCase() + crop.slice(1)} | {forecastData.length}-day forecast
        </p>

        <div className="chart-card">
          <div className="chart-header-row">
            <div>
              <div className="section-label">{forecastData.length}-Day Simulation</div>
              <div className="chart-title">Projected pest risk trajectory</div>
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot red" />
                <span>Without action</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot green" />
                <span>With preventive action</span>
              </div>
            </div>
          </div>

          <div className="chart-wrapper">
            <div className="chart-y-labels">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="chart-main">
              <svg
                viewBox="0 0 620 260"
                className="risk-chart"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="riskAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgba(239,68,68,0.22)" />
                    <stop offset="100%" stopColor="rgba(239,68,68,0.02)" />
                  </linearGradient>
                </defs>

                <line x1="28" y1="20" x2="592" y2="20" className="grid-line" />
                <line x1="28" y1="75" x2="592" y2="75" className="grid-line" />
                <line x1="28" y1="130" x2="592" y2="130" className="grid-line" />
                <line x1="28" y1="185" x2="592" y2="185" className="grid-line" />
                <line x1="28" y1="240" x2="592" y2="240" className="grid-line" />

                <path d={withoutActionArea} fill="url(#riskAreaGradient)" />

                <polyline
                  points={withoutActionPoints}
                  fill="none"
                  className="chart-line red-line"
                />

                <polyline
                  points={withActionPoints}
                  fill="none"
                  className="chart-line green-line"
                />

                {forecastData.map((point, index) => {
                  const x = 28 + (index * (620 - 56)) / (forecastData.length - 1 || 1);
                  const y = 260 - 20 - (point.risk / 100) * (260 - 40);

                  return (
                    <circle
                      key={`red-${index}`}
                      cx={x}
                      cy={y}
                      r={index === peakIndex ? 6 : 4}
                      className={index === peakIndex ? "peak-point" : "red-point"}
                    />
                  );
                })}

                {withActionData.map((point, index) => {
                  const x =
                    28 + (index * (620 - 56)) / (withActionData.length - 1 || 1);
                  const y = 260 - 20 - (point.risk / 100) * (260 - 40);

                  return (
                    <circle
                      key={`green-${index}`}
                      cx={x}
                      cy={y}
                      r={4}
                      className="green-point"
                    />
                  );
                })}
              </svg>

              <div className="chart-x-labels">
                {forecastData.map((item, index) => (
                  <span key={index}>{item.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="simulation-insight danger-soft">
          <span className="trend-icon">⚠️</span>
          <span>Risk is expected to peak on {peakDay} without intervention</span>
        </div>

        <div className="scenario-grid">
          <div className="scenario-card danger">
            <div className="section-label">Scenario A</div>
            <div className="scenario-title">Without action</div>
            <div className="scenario-value red-text">Peak risk: {peakRisk}%</div>
            <div className="scenario-note">
              Conditions remain highly favorable for pest expansion.
            </div>
          </div>

          <div className="scenario-card success">
            <div className="section-label">Scenario B</div>
            <div className="scenario-title">With preventive action</div>
            <div className="scenario-value green-text">Peak risk: {peakRiskWithAction}%</div>
            <div className="scenario-note">
              Preventive response reduces spread and stabilizes risk.
            </div>
          </div>
        </div>

        <div className="recommendations-card">
          <div className="recommendations-title">Simulation Insights</div>

          <div className="recommendation-item">
            <span className="recommendation-icon">📉</span>
            <span>Preventive action reduces projected peak risk by {riskReduction} points</span>
          </div>

          <div className="recommendation-item">
            <span className="recommendation-icon">💰</span>
            <span>Potential yield preserved: +{Math.round(riskReduction * 0.8)}% compared to no intervention</span>
          </div>

          <div className="recommendation-item">
            <span className="recommendation-icon">🗓️</span>
            <span>Best intervention window: next 72 hours</span>
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">Peak Day</div>
            <div className="meta-value">{peakDay}</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">Reduction</div>
            <div className="meta-value">-{Math.round((riskReduction / peakRisk) * 100) || 0}%</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">Forecast</div>
            <div className="meta-value">{forecastData.length} Days</div>
          </div>
        </div>

        <div className="dual-actions">
          <button className="secondary-btn" onClick={onBack}>
            Back to Results
          </button>

          <button className="submit-btn" onClick={onRunAgain}>
            Run Another Prediction
          </button>
        </div>
      </div>
    </div>
  );
}
