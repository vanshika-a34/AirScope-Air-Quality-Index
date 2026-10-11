export interface PollutantItem {
  code: string;
  name: string;
  value: number | null;
  unit: string;
  status: string;
  status_color: string;
  bar_percent: number;
  sub_index?: number | null;
}

export interface LocationInfo {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherInfo {
  temperature_c?: number;
  weather_code?: number;
  condition?: string;
}

export interface AirQualityCurrentResponse {
  location: LocationInfo;
  timestamp: string;
  retrieved_at: string;
  aqi_standard: string;
  aqi_value: number | null;
  aqi_category: string;
  aqi_color: string;
  critical_pollutant?: string | null;
  health_guidance: string;
  health_guidance_source: string;
  pollutants: Record<string, PollutantItem>;
  weather?: WeatherInfo;
  provider: string;
  provider_terms: string;
  epa_calculated_aqi?: number | null;
  provider_reported_aqi?: number | null;
}

export interface DailyForecastItem {
  date: string;
  day_name: string;
  aqi_value: number | null;
  aqi_category: string;
  aqi_color: string;
  temp_max_c?: number;
  temp_min_c?: number;
  weather_code?: number;
  condition?: string;
}

export interface HourlyForecastItem {
  time: string;
  aqi_value: number | null;
  is_forecast: boolean;
}

export interface ForecastResponse {
  location: LocationInfo;
  aqi_standard: string;
  provider: string;
  provider_terms: string;
  retrieved_at: string;
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
}

export interface SearchResultItem {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

export interface RegionalCityItem {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  aqi_value: number | null;
  aqi_category: string;
  aqi_color: string;
  pm25: number | null;
  pm10: number | null;
  critical_pollutant?: string | null;
  timestamp: string;
}

export interface RegionalCitiesResponse {
  cities: RegionalCityItem[];
  retrieved_at: string;
  provider: string;
  aqi_standard: string;
}

export interface MLMetrics {
  mae: number;
  rmse: number;
  persistence_mae: number;
  persistence_rmse: number;
}

export interface HistoricalSampleRecord {
  date: string;
  actual: number;
  model_pred: number;
  model_abs_error: number;
  persistence_pred: number;
  persistence_abs_error: number;
}

export interface MLEvaluationResponse {
  model_name: string;
  city: string;
  target: string;
  training_data_end: string;
  train_split_fraction: number;
  features: string[];
  coefficients: Record<string, number>;
  intercept: number;
  metrics: MLMetrics;
  status_label: string;
  limitation_note: string;
  is_live_forecast: boolean;
  test_sample_records?: HistoricalSampleRecord[];
}
