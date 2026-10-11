import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.models import (
    AirQualityCurrentResponse,
    ForecastResponse,
    SearchResponse,
    RegionalCitiesResponse,
    MLEvaluationResponse,
)
from app.services.open_meteo import (
    fetch_current_air_quality,
    fetch_forecast,
    fetch_regional_cities,
    search_cities,
)
from app.services.ml_service import get_ml_evaluation_data

app = FastAPI(
    title="AirScope — AQI Intelligence API",
    description="FastAPI backend providing verified real-time air quality, forecasts, regional city monitoring, and ML evaluation metadata.",
    version="1.0.0",
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Health check for backend server process (not a claim about external provider availability)."""
    return {
        "status": "healthy",
        "service": "AirScope Backend",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "provider": "Open-Meteo Air Quality & Weather API",
        "aqi_standard": "US EPA AQI",
    }

@app.get("/api/search", response_model=SearchResponse)
async def search_endpoint(
    q: str = Query(..., min_length=1, description="City or location name query")
):
    """Search for locations using Open-Meteo Geocoding API."""
    try:
        return await search_cities(q)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Location search service unavailable: {str(e)}")

@app.get("/api/air-quality", response_model=AirQualityCurrentResponse)
async def air_quality_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    city: str = Query("Selected Location", description="City name"),
    admin1: Optional[str] = Query(None, description="State/Province/Admin1"),
    country: Optional[str] = Query(None, description="Country name"),
):
    """Retrieve current real-time air quality observations, pollutant levels, and weather for coordinates."""
    try:
        return await fetch_current_air_quality(
            lat=lat,
            lon=lon,
            city_name=city,
            admin1=admin1,
            country=country,
        )
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching air quality: {str(e)}")

@app.get("/api/forecast", response_model=ForecastResponse)
async def forecast_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    city: str = Query("Selected Location", description="City name"),
    admin1: Optional[str] = Query(None, description="State/Province/Admin1"),
    country: Optional[str] = Query(None, description="Country name"),
):
    """Retrieve 7-day provider forecast (hourly trend + daily aggregated cards)."""
    try:
        return await fetch_forecast(
            lat=lat,
            lon=lon,
            city_name=city,
            admin1=admin1,
            country=country,
        )
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching forecast: {str(e)}")

@app.get("/api/regional-cities", response_model=RegionalCitiesResponse)
async def regional_cities_endpoint():
    """Retrieve live real-time air quality for all regional cities shown on the interactive map."""
    try:
        return await fetch_regional_cities()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error fetching regional cities: {str(e)}")

@app.get("/api/ml/evaluation", response_model=MLEvaluationResponse)
async def ml_evaluation_endpoint():
    """Retrieve verified evaluation metrics and metadata for the experimental Delhi ML model."""
    try:
        return get_ml_evaluation_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading ML evaluation data: {str(e)}")
