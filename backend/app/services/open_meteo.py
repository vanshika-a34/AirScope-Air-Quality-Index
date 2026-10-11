import asyncio
import datetime
import httpx
from typing import Optional, Dict, Any, List
from app.models import (
    AirQualityCurrentResponse,
    DailyForecastItem,
    ForecastResponse,
    HourlyForecastItem,
    LocationInfo,
    PollutantItem,
    RegionalCityItem,
    RegionalCitiesResponse,
    SearchResultItem,
    SearchResponse,
    WeatherInfo,
)
from app.services.aqi_calculator import (
    calculate_us_epa_composite_aqi,
    compute_pm25_aqi,
    compute_pm10_aqi,
    compute_co_aqi,
    compute_so2_aqi,
    compute_no2_aqi,
    compute_o3_aqi,
)

OPEN_METEO_AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
OPEN_METEO_GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
HTTP_TIMEOUT = 9.0

# Verified coordinates for regional cities shown on map
REGIONAL_CITIES_META = [
    {"name": "Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090},
    {"name": "Lahore", "country": "Pakistan", "lat": 31.5497, "lon": 74.3436},
    {"name": "Karachi", "country": "Pakistan", "lat": 24.8607, "lon": 67.0011},
    {"name": "Mumbai", "country": "India", "lat": 19.0760, "lon": 72.8777},
    {"name": "Kolkata", "country": "India", "lat": 22.5726, "lon": 88.3639},
    {"name": "Bengaluru", "country": "India", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai", "country": "India", "lat": 13.0827, "lon": 80.2707},
]

WMO_WEATHER_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
}

def get_aqi_category_and_guidance(aqi: Optional[int]):
    if aqi is None:
        return {
            "category": "Unavailable",
            "color": "#64748b",
            "guidance": "Air quality data is currently unavailable for this location.",
        }
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#22c55e",
            "guidance": "Air quality is satisfactory, and air pollution poses little or no risk.",
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "color": "#eab308",
            "guidance": "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.",
        }
    elif aqi <= 150:
        return {
            "category": "Poor",
            "color": "#ff7a00",
            "guidance": "Air quality is unhealthy for sensitive groups. Limit prolonged outdoor exertion.",
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy",
            "color": "#ef4444",
            "guidance": "Some members of the public may experience health effects. Avoid prolonged outdoor activity.",
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "color": "#a855f7",
            "guidance": "Health alert: The risk of health effects is increased for everyone. Avoid outdoor exertion.",
        }
    else:
        return {
            "category": "Severe",
            "color": "#991b1b",
            "guidance": "Emergency health warning: Everyone is likely to be affected. Remain indoors and keep activity levels low.",
        }

def compute_pollutant_item(code: str, raw_value: Optional[float], sub_index: Optional[int] = None) -> PollutantItem:
    if raw_value is None:
        return PollutantItem(
            code=code,
            name=code,
            value=None,
            unit="μg/m³",
            status="Unavailable",
            status_color="#64748b",
            bar_percent=0.0,
            sub_index=None,
        )

    val = float(raw_value)
    if code == "PM2.5":
        name = "PM2.5"
        unit = "μg/m³"
        pct = min(100.0, max(5.0, (val / 120.0) * 100.0))
        if val <= 12.0:
            status, color = "Good", "#22c55e"
        elif val <= 35.4:
            status, color = "Moderate", "#eab308"
        elif val <= 55.4:
            status, color = "High", "#ff7a00"
        else:
            status, color = "Very High", "#ef4444"
        return PollutantItem(code="PM2.5", name=name, value=round(val, 1), unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    elif code == "PM10":
        name = "PM10"
        unit = "μg/m³"
        pct = min(100.0, max(5.0, (val / 250.0) * 100.0))
        if val <= 54.0:
            status, color = "Good", "#22c55e"
        elif val <= 154.0:
            status, color = "Moderate", "#eab308"
        elif val <= 254.0:
            status, color = "High", "#ff7a00"
        else:
            status, color = "Very High", "#ef4444"
        return PollutantItem(code="PM10", name=name, value=round(val, 1), unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    elif code == "NO2":
        name = "NO₂"
        unit = "μg/m³"
        pct = min(100.0, max(5.0, (val / 150.0) * 100.0))
        if val <= 53.0:
            status, color = "Good", "#22c55e"
        elif val <= 100.0:
            status, color = "Moderate", "#eab308"
        else:
            status, color = "High", "#ff7a00"
        return PollutantItem(code="NO2", name=name, value=round(val, 1), unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    elif code == "SO2":
        name = "SO₂"
        unit = "μg/m³"
        pct = min(100.0, max(5.0, (val / 100.0) * 100.0))
        if val <= 35.0:
            status, color = "Good", "#22c55e"
        elif val <= 75.0:
            status, color = "Moderate", "#eab308"
        else:
            status, color = "High", "#ff7a00"
        return PollutantItem(code="SO2", name=name, value=round(val, 1), unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    elif code == "CO":
        name = "CO"
        mg_val = round(val / 1000.0, 1)
        unit = "mg/m³"
        pct = min(100.0, max(5.0, (mg_val / 10.0) * 100.0))
        if mg_val <= 4.4:
            status, color = "Good", "#22c55e"
        elif mg_val <= 9.4:
            status, color = "Moderate", "#eab308"
        else:
            status, color = "High", "#ef4444"
        return PollutantItem(code="CO", name=name, value=mg_val, unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    elif code == "O3":
        name = "O₃"
        unit = "μg/m³"
        pct = min(100.0, max(5.0, (val / 180.0) * 100.0))
        if val <= 54.0:
            status, color = "Good", "#22c55e"
        elif val <= 70.0:
            status, color = "Moderate", "#eab308"
        else:
            status, color = "High", "#ff7a00"
        return PollutantItem(code="O3", name=name, value=round(val, 1), unit=unit, status=status, status_color=color, bar_percent=round(pct, 1), sub_index=sub_index)

    return PollutantItem(code=code, name=code, value=round(val, 1), unit="μg/m³", status="Normal", status_color="#22c55e", bar_percent=20.0, sub_index=sub_index)


async def search_cities(query: str) -> SearchResponse:
    if not query or len(query.strip()) < 2:
        return SearchResponse(query=query, results=[])

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        params = {
            "name": query.strip(),
            "count": 6,
            "language": "en",
            "format": "json",
        }
        resp = await client.get(OPEN_METEO_GEO_URL, params=params)
        if resp.status_code != 200:
            return SearchResponse(query=query, results=[])

        data = resp.json()
        raw_results = data.get("results", [])
        results = []
        for r in raw_results:
            results.append(
                SearchResultItem(
                    id=r.get("id", 0),
                    name=r.get("name", ""),
                    admin1=r.get("admin1"),
                    country=r.get("country"),
                    country_code=r.get("country_code"),
                    latitude=r.get("latitude", 0.0),
                    longitude=r.get("longitude", 0.0),
                    timezone=r.get("timezone", "UTC"),
                )
            )
        return SearchResponse(query=query, results=results)


async def fetch_current_air_quality(
    lat: float,
    lon: float,
    city_name: str = "Selected Location",
    admin1: Optional[str] = None,
    country: Optional[str] = None,
) -> AirQualityCurrentResponse:
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        # 1. Fetch Air Quality
        aq_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
            "timezone": "auto",
        }
        aq_resp = await client.get(OPEN_METEO_AQ_URL, params=aq_params)
        if aq_resp.status_code != 200:
            raise RuntimeError(f"Open-Meteo Air Quality API returned status {aq_resp.status_code}")

        aq_data = aq_resp.json()
        current = aq_data.get("current", {})
        timezone_str = aq_data.get("timezone", "UTC")

        # 2. Fetch current weather for temperature and condition
        weather_info: Optional[WeatherInfo] = None
        try:
            weather_params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,weather_code",
                "timezone": "auto",
            }
            w_resp = await client.get(OPEN_METEO_WEATHER_URL, params=weather_params)
            if w_resp.status_code == 200:
                w_current = w_resp.json().get("current", {})
                w_code = w_current.get("weather_code")
                temp = w_current.get("temperature_2m")
                weather_info = WeatherInfo(
                    temperature_c=temp,
                    weather_code=w_code,
                    condition=WMO_WEATHER_MAP.get(w_code, "Fair"),
                )
        except Exception:
            weather_info = None

        raw_pm25 = current.get("pm2_5")
        raw_pm10 = current.get("pm10")
        raw_co = current.get("carbon_monoxide")
        raw_so2 = current.get("sulphur_dioxide")
        raw_no2 = current.get("nitrogen_dioxide")
        raw_o3 = current.get("ozone")

        # Compute EPA composite AQI and individual pollutant sub-indices
        epa_calc_aqi, critical_pollutant, sub_indices = calculate_us_epa_composite_aqi(
            pm25=raw_pm25,
            pm10=raw_pm10,
            co=raw_co,
            so2=raw_so2,
            no2=raw_no2,
            o3=raw_o3,
        )

        provider_aqi = current.get("us_aqi")
        # Final displayed AQI: provider-reported us_aqi when present, or our verified EPA calculated AQI
        final_aqi = provider_aqi if provider_aqi is not None else epa_calc_aqi
        cat_info = get_aqi_category_and_guidance(final_aqi)

        pollutants = {
            "pm25": compute_pollutant_item("PM2.5", raw_pm25, sub_indices.get("PM2.5")),
            "pm10": compute_pollutant_item("PM10", raw_pm10, sub_indices.get("PM10")),
            "no2": compute_pollutant_item("NO2", raw_no2, sub_indices.get("NO2")),
            "so2": compute_pollutant_item("SO2", raw_so2, sub_indices.get("SO2")),
            "co": compute_pollutant_item("CO", raw_co, sub_indices.get("CO")),
            "o3": compute_pollutant_item("O3", raw_o3, sub_indices.get("O3")),
        }

        location = LocationInfo(
            name=city_name,
            admin1=admin1,
            country=country,
            latitude=lat,
            longitude=lon,
            timezone=timezone_str,
        )

        return AirQualityCurrentResponse(
            location=location,
            timestamp=current.get("time", now_utc),
            retrieved_at=now_utc,
            aqi_standard="US EPA AQI",
            aqi_value=final_aqi,
            aqi_category=cat_info["category"],
            aqi_color=cat_info["color"],
            critical_pollutant=critical_pollutant,
            health_guidance=cat_info["guidance"],
            pollutants=pollutants,
            weather=weather_info,
            epa_calculated_aqi=epa_calc_aqi,
            provider_reported_aqi=provider_aqi,
        )


async def fetch_forecast(
    lat: float,
    lon: float,
    city_name: str = "Selected Location",
    admin1: Optional[str] = None,
    country: Optional[str] = None,
) -> ForecastResponse:
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        # Fetch 7 days hourly air quality for complete 24h, 5-day, and 7-day range views
        aq_params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "us_aqi,pm10,pm2_5",
            "timezone": "auto",
            "forecast_days": 7,
        }
        aq_resp = await client.get(OPEN_METEO_AQ_URL, params=aq_params)
        if aq_resp.status_code != 200:
            raise RuntimeError(f"Open-Meteo Air Quality API returned status {aq_resp.status_code}")

        aq_data = aq_resp.json()
        hourly_data = aq_data.get("hourly", {})
        timezone_str = aq_data.get("timezone", "UTC")

        # Fetch daily weather temperatures and codes for 7 days
        daily_weather = {}
        try:
            weather_params = {
                "latitude": lat,
                "longitude": lon,
                "daily": "temperature_2m_max,temperature_2m_min,weather_code",
                "timezone": "auto",
                "forecast_days": 7,
            }
            w_resp = await client.get(OPEN_METEO_WEATHER_URL, params=weather_params)
            if w_resp.status_code == 200:
                daily_weather = w_resp.json().get("daily", {})
        except Exception:
            daily_weather = {}

        times = hourly_data.get("time", [])
        us_aqi_list = hourly_data.get("us_aqi", [])

        hourly_items: List[HourlyForecastItem] = []
        for t, aqi in zip(times, us_aqi_list):
            hourly_items.append(
                HourlyForecastItem(
                    time=t,
                    aqi_value=aqi,
                    is_forecast=True,
                )
            )

        daily_map: Dict[str, List[int]] = {}
        for t, aqi in zip(times, us_aqi_list):
            if aqi is not None:
                day_key = t.split("T")[0]
                daily_map.setdefault(day_key, []).append(aqi)

        w_dates = daily_weather.get("time", [])
        w_maxes = daily_weather.get("temperature_2m_max", [])
        w_mins = daily_weather.get("temperature_2m_min", [])
        w_codes = daily_weather.get("weather_code", [])

        weather_by_date = {}
        for i, d in enumerate(w_dates):
            weather_by_date[d] = {
                "max": w_maxes[i] if i < len(w_maxes) else None,
                "min": w_mins[i] if i < len(w_mins) else None,
                "code": w_codes[i] if i < len(w_codes) else None,
            }

        daily_items: List[DailyForecastItem] = []
        for i, (day_str, aqi_vals) in enumerate(list(daily_map.items())[:7]):
            avg_aqi = int(round(sum(aqi_vals) / len(aqi_vals))) if aqi_vals else None
            cat_info = get_aqi_category_and_guidance(avg_aqi)
            dt = datetime.date.fromisoformat(day_str)
            day_name = "Today" if i == 0 else dt.strftime("%a")

            w_day = weather_by_date.get(day_str, {})
            w_code = w_day.get("code")

            daily_items.append(
                DailyForecastItem(
                    date=day_str,
                    day_name=day_name,
                    aqi_value=avg_aqi,
                    aqi_category=cat_info["category"],
                    aqi_color=cat_info["color"],
                    temp_max_c=w_day.get("max"),
                    temp_min_c=w_day.get("min"),
                    weather_code=w_code,
                    condition=WMO_WEATHER_MAP.get(w_code, "Fair") if w_code is not None else None,
                )
            )

        location = LocationInfo(
            name=city_name,
            admin1=admin1,
            country=country,
            latitude=lat,
            longitude=lon,
            timezone=timezone_str,
        )

        return ForecastResponse(
            location=location,
            aqi_standard="US EPA AQI",
            retrieved_at=now_utc,
            daily=daily_items,
            hourly=hourly_items,
        )


async def fetch_single_city_summary(client: httpx.AsyncClient, city: Dict[str, Any]) -> RegionalCityItem:
    """Fetch live air quality summary for a single regional city."""
    try:
        params = {
            "latitude": city["lat"],
            "longitude": city["lon"],
            "current": "us_aqi,pm10,pm2_5",
            "timezone": "auto",
        }
        res = await client.get(OPEN_METEO_AQ_URL, params=params)
        if res.status_code == 200:
            data = res.json()
            current = data.get("current", {})
            aqi_val = current.get("us_aqi")
            cat_info = get_aqi_category_and_guidance(aqi_val)
            pm25 = current.get("pm2_5")
            pm10 = current.get("pm10")
            ts = current.get("time", datetime.datetime.now(datetime.timezone.utc).isoformat())

            # Determine critical pollutant between PM2.5 and PM10
            pm25_idx = compute_pm25_aqi(pm25) if pm25 is not None else 0
            pm10_idx = compute_pm10_aqi(pm10) if pm10 is not None else 0
            crit = "PM2.5" if (pm25_idx or 0) >= (pm10_idx or 0) else "PM10"

            return RegionalCityItem(
                name=city["name"],
                country=city["country"],
                latitude=city["lat"],
                longitude=city["lon"],
                aqi_value=aqi_val,
                aqi_category=cat_info["category"],
                aqi_color=cat_info["color"],
                pm25=pm25,
                pm10=pm10,
                critical_pollutant=crit,
                timestamp=ts,
            )
    except Exception as e:
        print(f"Error fetching city {city['name']}: {e}")

    # Fallback to unavailable if city fetch failed
    return RegionalCityItem(
        name=city["name"],
        country=city["country"],
        latitude=city["lat"],
        longitude=city["lon"],
        aqi_value=None,
        aqi_category="Unavailable",
        aqi_color="#64748b",
        pm25=None,
        pm10=None,
        critical_pollutant=None,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )


async def fetch_regional_cities() -> RegionalCitiesResponse:
    """Fetch real-time air quality for all regional cities concurrently."""
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        tasks = [fetch_single_city_summary(client, c) for c in REGIONAL_CITIES_META]
        cities = await asyncio.gather(*tasks)

        return RegionalCitiesResponse(
            cities=list(cities),
            retrieved_at=now_utc,
            provider="Open-Meteo Air Quality API",
            aqi_standard="US EPA AQI",
        )
