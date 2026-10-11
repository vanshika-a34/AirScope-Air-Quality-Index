# Architecture

## Proposed shape
- **Frontend:** React + Vite. Renders the responsive dashboard and handles search, navigation, charts and loading/error states.
- **Backend:** FastAPI. Provides a small stable API to the frontend, validates inputs, normalizes provider responses and hides any secret provider credentials.
- **External AQI provider:** Supplies actual observations and/or forecasts. Exact provider must be verified and approved.
- **Optional ML module:** Separate service/module for AirScope's own prediction. Must not be confused with provider forecasts.
- **No database for MVP:** Avoid persistent storage unless a confirmed feature needs it.

## Data flow
1. User searches/selects a location.
2. Frontend calls the AirScope backend.
3. Backend validates the request and calls the verified provider.
4. Backend normalizes available fields while preserving source, timestamp, units, AQI standard and missing-field status.
5. Frontend displays data with attribution.
6. If any step fails, the frontend shows an honest fallback state.

## Suggested API shape (confirm against provider)
- `GET /api/health` — app health only; not proof the data provider is healthy.
- `GET /api/air-quality?lat=...&lon=...` or a supported location query — current/available air quality.
- `GET /api/forecast?lat=...&lon=...` — only if provider forecast is available.
Use clear response schemas, validation and timeouts. Do not invent fields the provider does not return.

## Security
- Keep keys in `.env`; commit `.env.example` with placeholder variable names only.
- Never expose server secrets to Vite/client variables.
- Validate coordinates/location input and handle provider errors.
- Do not log secrets or unnecessary personal data.

## Deployment
Deployment platform is undecided. Ask before choosing if it affects cost, API secrets, build steps or public availability.
