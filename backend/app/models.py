from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class PollutantItem(BaseModel):
    code: str
    name: str
    value: Optional[float] = None
    unit: str
    status: str
    status_color: str
    bar_percent: float = Field(default=0.0, ge=0.0, le=100.0)
    sub_index: Optional[int] = None

class LocationInfo(BaseModel):
    name: str
    admin1: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    timezone: str = "UTC"

class WeatherInfo(BaseModel):
    temperature_c: Optional[float] = None
    weather_code: Optional[int] = None
    condition: Optional[str] = None

class AirQualityCurrentResponse(BaseModel):
    location: LocationInfo
    timestamp: str
    retrieved_at: str
    aqi_standard: str = "US EPA AQI"
    aqi_value: Optional[int] = None
    aqi_category: str
    aqi_color: str
    critical_pollutant: Optional[str] = None
    health_guidance: str
    health_guidance_source: str = "US EPA Air Quality Guidelines"
    pollutants: Dict[str, PollutantItem]
    weather: Optional[WeatherInfo] = None
    provider: str = "Open-Meteo Air Quality API"
    provider_terms: str = "CC BY 4.0 (Weather data by Open-Meteo.com)"
    epa_calculated_aqi: Optional[int] = None
    provider_reported_aqi: Optional[int] = None

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    aqi_value: Optional[int] = None
    aqi_category: str
    aqi_color: str
    temp_max_c: Optional[float] = None
    temp_min_c: Optional[float] = None
    weather_code: Optional[int] = None
    condition: Optional[str] = None

class HourlyForecastItem(BaseModel):
    time: str
    aqi_value: Optional[int] = None
    is_forecast: bool = True

class ForecastResponse(BaseModel):
    location: LocationInfo
    aqi_standard: str = "US EPA AQI"
    provider: str = "Open-Meteo Air Quality API"
    provider_terms: str = "CC BY 4.0 (Weather data by Open-Meteo.com)"
    retrieved_at: str
    daily: List[DailyForecastItem]
    hourly: List[HourlyForecastItem]

class SearchResultItem(BaseModel):
    id: int
    name: str
    admin1: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    latitude: float
    longitude: float
    timezone: Optional[str] = "UTC"

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]

class RegionalCityItem(BaseModel):
    name: str
    country: str
    latitude: float
    longitude: float
    aqi_value: Optional[int] = None
    aqi_category: str
    aqi_color: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    critical_pollutant: Optional[str] = None
    timestamp: str

class RegionalCitiesResponse(BaseModel):
    cities: List[RegionalCityItem]
    retrieved_at: str
    provider: str = "Open-Meteo Air Quality API"
    aqi_standard: str = "US EPA AQI"

class MLMetrics(BaseModel):
    mae: float
    rmse: float
    persistence_mae: float
    persistence_rmse: float

class HistoricalSampleRecord(BaseModel):
    date: str
    actual: float
    model_pred: float
    model_abs_error: float
    persistence_pred: float
    persistence_abs_error: float

class MLEvaluationResponse(BaseModel):
    model_name: str
    city: str
    target: str
    training_data_end: str
    train_split_fraction: float
    features: List[str]
    coefficients: Dict[str, float]
    intercept: float
    metrics: MLMetrics
    status_label: str = "Experimental Model — Historical Validation Only"
    limitation_note: str
    is_live_forecast: bool = False
    test_sample_records: Optional[List[HistoricalSampleRecord]] = None
