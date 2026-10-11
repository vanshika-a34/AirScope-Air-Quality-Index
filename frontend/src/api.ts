import type {
  AirQualityCurrentResponse,
  ForecastResponse,
  SearchResponse,
  MLEvaluationResponse,
  RegionalCitiesResponse,
} from './types';

const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_HOST}/api`;

export async function fetchCurrentAirQuality(
  lat: number,
  lon: number,
  city?: string,
  admin1?: string,
  country?: string
): Promise<AirQualityCurrentResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });
  if (city) params.append('city', city);
  if (admin1) params.append('admin1', admin1);
  if (country) params.append('country', country);

  const res = await fetch(`${BASE_URL}/air-quality?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch air quality data' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchForecastData(
  lat: number,
  lon: number,
  city?: string,
  admin1?: string,
  country?: string
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });
  if (city) params.append('city', city);
  if (admin1) params.append('admin1', admin1);
  if (country) params.append('country', country);

  const res = await fetch(`${BASE_URL}/forecast?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch forecast data' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function searchLocations(query: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to search locations' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchRegionalCities(): Promise<RegionalCitiesResponse> {
  const res = await fetch(`${BASE_URL}/regional-cities`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load regional cities' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMLEvaluation(): Promise<MLEvaluationResponse> {
  const res = await fetch(`${BASE_URL}/ml/evaluation`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load ML evaluation' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }
  return res.json();
}
