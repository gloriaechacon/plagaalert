export interface PredictionLocation {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface PredictionFactors {
  temperature: number;
  humidity: number;
  rainfall: number;
  avg_max_temp_7d: number;
  avg_min_temp_7d: number;
}

export interface ForecastDay {
  day: string;
  risk: number;
}

export interface PredictionResponse {
  location: PredictionLocation;
  crop: string;
  risk: number;
  risk_level: string;
  trend: string;
  factors: PredictionFactors;
  main_cause: string;
  recommendations: string[];
  impact: string;
  confidence: number;
  forecast: ForecastDay[];
}

export interface PredictionRequest {
  location: string;
  crop: string;
}
