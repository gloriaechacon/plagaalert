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

export type PredictionResponse = {
  location: {
    name: string;
    country?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  crop: string;
  risk: number;
  risk_level: string;
  trend: string;
  factors: {
    temperature: number;
    humidity: number;
    rainfall: number;
    avg_max_temp_7d?: number;
    avg_min_temp_7d?: number;
    hot_days_7d?: number;
    wet_days_7d?: number;
    warm_nights_7d?: number;
    heat_stress_score?: number;
    fungal_pressure_score?: number;
    moisture_pressure_score?: number;
  };
  main_cause: string;
  recommendations: string[];
  impact: string;
  confidence: number;
  forecast: Array<{
    day: string;
    risk: number;
    heat_stress?: number;
    fungal_pressure?: number;
    moisture_pressure?: number;
  }>;
  ai_insight?: string;
};

export type PredictionRequest = {
  crop: string;
  explanation_style?: "simple" | "technical";
  latitude?: number;
  longitude?: number;
  location?: string;
};