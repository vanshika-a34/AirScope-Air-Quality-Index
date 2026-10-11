# AirScope — Comprehensive Project & Architecture Audit

**Date:** 2026-10-11  
**Auditor:** Antigravity AI Senior Engineer  
**Objective:** Audit existing full-stack codebase (`backend/`, `frontend/`, `aqi_project_files/`, configurations, and tests) to identify working features, gaps, mocked/hardcoded data, and necessary architectural upgrades.

---

## 1. Feature Classification Matrix

| Feature / Component | Status | Location | Evidence / Findings |
| :--- | :--- | :--- | :--- |
| **Backend Core Server** | **Working and verified** | `backend/app/main.py` | FastAPI server with CORS, Pydantic schemas, and `/api/health` passed automated tests. |
| **Live Geocoding Search** | **Working and verified** | `backend/app/services/open_meteo.py`, `TopBar.tsx` | Queries Open-Meteo Geocoding API (`search_cities`). Returns real matching places with lat/lon and updates active location. |
| **Current Air Quality (Selected City)** | **Working and verified** | `backend/app/services/open_meteo.py`, `AQIGauge.tsx`, `PollutantsCard.tsx` | Fetches real observations from Open-Meteo for coordinates. Renders real PM2.5, PM10, NO2, SO2, CO, O3. |
| **Weather Information** | **Working and verified** | `backend/app/services/open_meteo.py`, `TopBar.tsx` | Fetches real temperature and WMO weather condition code from Open-Meteo Weather API. |
| **5-Day Forecast & Daily Cards** | **Working and verified** | `backend/app/services/open_meteo.py`, `FiveDayCards.tsx`, `ForecastChart.tsx` | Generates 5 daily cards with real min/max temps, AQI values, and Open-Meteo attribution. |
| **Forecast Range Controls (24h / 5d / 7d)** | **Partially implemented** | `backend/app/services/open_meteo.py`, `ForecastChart.tsx` | Backend requested `forecast_days=5`, limiting 7-day tab fidelity. Needs `forecast_days=7` in backend so `7d` tab renders genuine 7-day forecast. |
| **Regional Map Experience** | **Mocked / Hardcoded** | `frontend/src/components/MapView.tsx` | Regional city nodes (Delhi, Lahore, Karachi, Mumbai, Kolkata, Bengaluru, Chennai) currently use a hardcoded static array rather than querying live data. |
| **ML Evaluation Tab** | **Mocked / Hardcoded (Partial)** | `frontend/src/components/AIExperimentalView.tsx` | Metrics table (MAE 32.11 vs 31.46) is verified from artifacts, but the left card contains hardcoded illustrative values (`128 (±15)` and projected bars for May 6–12). Must be replaced with authentic historical test evaluation data. |
| **Colab ML Model & Artifacts** | **Working and verified (Historical)** | `aqi_project_files/` | `delhi_aqi_model.joblib`, `model_config.json`, `delhi_model_data.csv`, `model_comparison.csv`, `time_window_comparison.csv` verified. Chronological test metrics match documented figures. |
| **Settings & Preferences** | **Partially implemented** | `frontend/src/components/SettingsView.tsx` | Renders static transparency information. Does not persist user preferences (e.g. °C vs °F unit toggle, refresh rate) to `localStorage`. |
| **Refresh & Retry Controls** | **Partially implemented** | `frontend/src/App.tsx` | Retry button exists on error banner. Needs a dedicated, always-accessible Refresh button in the TopBar and last-updated timestamp indicator. |
| **US EPA AQI Calculation & Verification** | **Partially implemented** | `backend/app/services/open_meteo.py` | Relies on Open-Meteo's `us_aqi` response field. Needs explicit EPA formula and breakpoint calculation engine to verify and document individual pollutant sub-indices and truncation rules. |
| **Responsive Mobile Layout** | **Working and verified** | `frontend/src/components/MobileView.tsx` | Mobile phone mockup renders top bar, circular gauge, quick badges, bottom tabs, and full 5-day forecast view. |
| **Automated Backend Tests** | **Working and verified** | `backend/tests/test_api.py` | 8/8 pytest tests passed in 9.30s. Needs separation between mocked unit tests and live integration tests. |
| **Frontend Production Build** | **Working and verified** | `frontend/` | `npm run build` succeeds (`tsc -b && vite build`) in 1.08s with zero TypeScript errors. |

---

## 2. Detailed Findings & Architectural Issues

### A. Mocked / Hardcoded Operational Data (Violation of Data Trust Policy)
1. **Map View (`MapView.tsx`):**
   - **Issue:** Cities array hardcodes static AQI values (e.g. `Delhi: 157, Lahore: 142, Karachi: 82, Mumbai: 83, Kolkata: 109, Bengaluru: 65, Chennai: 78`).
   - **Fix:** Add a dedicated backend endpoint `GET /api/regional-cities` that queries Open-Meteo in parallel for these coordinates and returns genuine live AQI, pollutant levels, and timestamps.
2. **AI Prediction View (`AIExperimentalView.tsx`):**
   - **Issue:** Hardcoded illustrative numbers `128 (±15)` and artificial bars for May 6–12.
   - **Fix:** Remove the arbitrary prediction values. Instead, title the view **Experimental Model — Historical Validation Only** and display the authentic test evaluation samples from `delhi_model_data.csv` (1,966 records from 2015 to 2020), showing the chronological test comparison (2019-06-03 to 2020-06-30) where the model achieved MAE 32.11 vs Persistence Baseline 31.46. Provide an interactive historical prediction calculator showing how the formula processes real feature inputs.

### B. AQI Calculation & US EPA Standard Integrity
- **Current implementation:** Directly passes `current.us_aqi` from Open-Meteo.
- **Requirement:** According to US EPA technical documents:
  - PM2.5 requires 24-hr truncation to 1 decimal place and breakpoint sub-index mapping ($I_{PM2.5}$).
  - PM10 requires 24-hr truncation to integer and breakpoint mapping ($I_{PM10}$).
  - $O_3$ requires 8-hr truncation (ppm/ppb) and breakpoint mapping ($I_{O3}$).
  - $CO$ requires 8-hr truncation to 1 decimal place (ppm) and breakpoint mapping ($I_{CO}$).
  - $SO_2$ and $NO_2$ require 1-hr truncation to integer.
  - Overall AQI is $\max(I_{p})$ and identifies the critical driving pollutant.
- **Action:** Implement an EPA calculation engine in `backend/app/services/aqi_calculator.py` that computes exact sub-indices for all available pollutants, compares against Open-Meteo's `us_aqi`, and provides full transparency in the API response.

### C. UI Interactivity & Functional Controls
- **TopBar:** Missing a direct "Refresh Now" action and clear "Last updated at" timestamp indicator.
- **Settings:** Missing interactive preference switches (e.g., Temperature unit: Celsius / Fahrenheit) persisted in `localStorage`.
- **Forecast Period:** Backend currently fetches `forecast_days=5`. Updating to `forecast_days=7` will allow the `7d` forecast tab to render real data points rather than clamping.

### D. Testing Architecture
- Existing tests in `test_api.py` run against the live Open-Meteo API.
- Need to separate offline mocked unit tests (fast, reliable in CI/offline environments) from live network integration tests.

---

## 3. Implementation Plan to Address All Audit Findings

1. **Phase 2 (Data Correctness & EPA AQI Engine):**
   - Create `backend/app/services/aqi_calculator.py` with official US EPA breakpoint tables, truncation rules, sub-index formulas, and critical pollutant detection.
   - Verify calculation against official EPA benchmarks.

2. **Phase 3 (Backend Enhancements):**
   - Upgrade `/api/forecast` to fetch 7 full days (`forecast_days=7`).
   - Add `GET /api/regional-cities` endpoint returning live data for regional map nodes.
   - Add detailed EPA breakdown (critical pollutant, individual sub-indices) to `/api/air-quality`.
   - Add separate unit tests with fixtures and live integration tests.

3. **Phase 4 & 6 (Frontend Interactivity & Hardcoded Data Removal):**
   - Update `MapView.tsx` to load genuine live regional cities data from `/api/regional-cities`.
   - Update `AIExperimentalView.tsx` to remove hardcoded `128 (±15)` and replace with authentic historical test results and interactive weight formula inspection.
   - Make Settings interactive with temperature unit toggle (°C / °F) stored in `localStorage`.
   - Add manual Refresh button and exact last-updated timestamp to `TopBar.tsx`.
   - Ensure `ForecastChart.tsx` 24h, 5d, and 7d tabs display genuine corresponding data.

4. **Phase 7 (Verification & Documentation):**
   - Run full pytest test suite (unit + integration).
   - Build frontend for production (`npm run build`).
   - Run browser verification of all updated views.
   - Update `README.md` and `DECISIONS_AND_CHANGES.md`.
