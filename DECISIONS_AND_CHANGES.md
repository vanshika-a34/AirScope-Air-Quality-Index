# Decisions and Changes

Keep entries short and in easy language. Add an entry after every meaningful step.

## Confirmed product decisions
- Product name: AirScope — AQI Intelligence.
- Visual direction: match `design-reference.png` closely; dark Earth-inspired dashboard, orange accents, white typography, glassy dark cards, matching mobile layouts.
- No profile/account required to check AQI.
- No fake live data, fake forecasts, fake ML predictions, or unsupported accuracy claims.
- Use clear fallback states when data is missing or services fail.
- Agent must ask about material uncertainties instead of guessing.
- Keep changes and explanations short, plain and precise.

## Known ML limitation
The existing Delhi prototype uses data ending 2020-07-01. On its existing 80/20 test it scored MAE 32.11 and RMSE 43.64; persistence baseline MAE was 31.46. It is not currently justified as a reliable current forecast. Displayed exclusively under **"Experimental Model — Historical Validation Only"** with honest evaluation metrics.

| Date | Change | Why | Test/result | Open question |
|---|---|---|---|---|
| 2026-10-11 | Provider & AQI standard approved | Open-Meteo approved for air quality, geocoding, and weather; US EPA AQI (0–500) confirmed with explicit labeling | Live curl test verified Open-Meteo response with real Delhi readings | None |
| 2026-10-11 | Inspected & verified Colab ML model files | Verified model object, features, preprocessing, and test metrics match config and docs exactly | Computed MAE 32.11 and RMSE 43.64 vs persistence baseline 31.46; confirmed model will only be displayed as historical experiment | None |
| 2026-10-11 | Built FastAPI backend (`aqi/backend`) | Provide validated, secret-free endpoints for air quality, search, 5-day forecast, regional cities, and ML evaluation | 10/10 pytest tests passed (`test_api.py`); live Open-Meteo parsing verified | None |
| 2026-10-11 | Built React + Vite frontend (`aqi/frontend`) | Render responsive dashboard matching `design-reference.png` with live data and honest fallbacks | `npm run build` passed with zero errors; browser verified | None |
| 2026-10-11 | Dynamic Regional Cities Endpoint (`/api/regional-cities`) | Eliminate hardcoded mock data on Regional Map view | Live concurrent fetching for 7 regional cities using `asyncio.gather`; verified on Map view | None |
| 2026-10-11 | Authentic ML Evaluation Endpoint (`/api/ml/evaluation`) | Display real test partition records and exact mathematical coefficients from `aqi_project_files` | Endpoint serves exact MAE 32.11, RMSE 43.64, test partition samples, and feature coefficients; verified in Insights view | None |
| 2026-10-11 | Full State & Preference Wiring (`App.tsx`, `SettingsView.tsx`) | Wire up °C/°F toggling across all cards, user-controlled refresh button, and configurable auto-refresh interval | Verified in browser: switching to Fahrenheit updates Home and 5-Day forecast; localStorage persists settings | None |
| 2026-10-11 | Production Build & Test Validation | Ensure reproducible build and robust test suite | `pytest` 10/10 tests passed; `npm run build` succeeds cleanly with 0 TypeScript/ESLint warnings | None |

## Agent instructions
For each entry use this brief format:
- **Step/change:** What changed.
- **Why:** Why it was needed.
- **Test/result:** What was actually run and observed.
- **Next:** Smallest next step.
- **Question:** Any decision requiring the user's answer.
