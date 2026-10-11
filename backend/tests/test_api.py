import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.services.open_meteo import get_aqi_category_and_guidance, compute_pollutant_item
from app.services.aqi_calculator import (
    compute_pm25_aqi,
    compute_pm10_aqi,
    compute_co_aqi,
    compute_so2_aqi,
    compute_no2_aqi,
    compute_o3_aqi,
    calculate_us_epa_composite_aqi,
)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["provider"] == "Open-Meteo Air Quality & Weather API"
    assert data["aqi_standard"] == "US EPA AQI"

def test_epa_aqi_formula_calculations():
    # PM2.5 tests: 10 ug/m³ is in [0, 12] -> AQI ~ 42
    aqi_pm25_low = compute_pm25_aqi(10.0)
    assert aqi_pm25_low is not None
    assert 35 <= aqi_pm25_low <= 45

    # PM2.5: 25.0 ug/m³ is in [12.1, 35.4] -> AQI ~ 78
    aqi_pm25_mod = compute_pm25_aqi(25.0)
    assert aqi_pm25_mod is not None
    assert 70 <= aqi_pm25_mod <= 85

    # PM2.5: 60.0 ug/m³ is in [55.5, 150.4] -> AQI ~ 153
    aqi_pm25_unhealthy = compute_pm25_aqi(60.0)
    assert aqi_pm25_unhealthy is not None
    assert 150 <= aqi_pm25_unhealthy <= 160

    # PM10 test
    aqi_pm10 = compute_pm10_aqi(100.0)
    assert aqi_pm10 is not None
    assert 70 <= aqi_pm10 <= 80

    # Composite EPA AQI calculation and critical pollutant detection
    composite, crit, sub = calculate_us_epa_composite_aqi(
        pm25=65.0, # AQI ~ 156
        pm10=40.0, # AQI ~ 37
        co=300.0,
        so2=10.0,
        no2=15.0,
        o3=20.0,
    )
    assert crit == "PM2.5"
    assert composite is not None
    assert composite > 150

def test_ml_evaluation_endpoint():
    response = client.get("/api/ml/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "Linear Regression"
    assert data["city"] == "Delhi"
    assert data["is_live_forecast"] is False
    assert data["metrics"]["mae"] == 32.11
    assert data["metrics"]["rmse"] == 43.64
    assert data["metrics"]["persistence_mae"] == 31.46
    assert "did not outperform the naive persistence baseline" in data["limitation_note"]
    assert "test_sample_records" in data
    assert len(data["test_sample_records"]) > 0

def test_aqi_category_thresholds():
    assert get_aqi_category_and_guidance(25)["category"] == "Good"
    assert get_aqi_category_and_guidance(75)["category"] == "Moderate"
    assert get_aqi_category_and_guidance(125)["category"] == "Poor"
    assert get_aqi_category_and_guidance(175)["category"] == "Unhealthy"
    assert get_aqi_category_and_guidance(250)["category"] == "Very Unhealthy"
    assert get_aqi_category_and_guidance(450)["category"] == "Severe"
    assert get_aqi_category_and_guidance(None)["category"] == "Unavailable"

def test_pollutant_item_computation():
    pm25 = compute_pollutant_item("PM2.5", 78.0, sub_index=163)
    assert pm25.unit == "μg/m³"
    assert pm25.status == "Very High"
    assert pm25.value == 78.0
    assert pm25.sub_index == 163

    co = compute_pollutant_item("CO", 800.0)
    assert co.unit == "mg/m³"
    assert co.value == 0.8
    assert co.status == "Good"

    none_item = compute_pollutant_item("SO2", None)
    assert none_item.status == "Unavailable"
    assert none_item.value is None

def test_invalid_coordinates_validation():
    response = client.get("/api/air-quality?lat=120.0&lon=77.0")
    assert response.status_code == 422
    response = client.get("/api/air-quality?lat=28.0&lon=200.0")
    assert response.status_code == 422

def test_search_endpoint_real_query():
    response = client.get("/api/search?q=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) > 0

def test_regional_cities_endpoint():
    response = client.get("/api/regional-cities")
    assert response.status_code == 200
    data = response.json()
    assert "cities" in data
    assert len(data["cities"]) >= 5
    for c in data["cities"]:
        assert "name" in c
        assert "latitude" in c
        assert "longitude" in c
        assert "aqi_category" in c

def test_air_quality_endpoint_live():
    response = client.get("/api/air-quality?lat=28.6139&lon=77.2090&city=Delhi&country=India")
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["name"] == "Delhi"
    assert data["aqi_standard"] == "US EPA AQI"
    assert data["provider"] == "Open-Meteo Air Quality API"
    assert data["retrieved_at"] is not None
    assert "critical_pollutant" in data

def test_forecast_endpoint_live():
    response = client.get("/api/forecast?lat=28.6139&lon=77.2090&city=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["aqi_standard"] == "US EPA AQI"
    assert len(data["daily"]) >= 5
    assert len(data["hourly"]) > 48
    assert data["daily"][0]["day_name"] == "Today"
