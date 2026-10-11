# Data and ML Integrity Policy

## Data provider
Before implementation, verify and record:
- Provider name and official documentation.
- Supported geography and station/cell resolution.
- Current observation vs forecast availability.
- AQI standard (for example, US AQI, European AQI or India's CPCB AQI).
- Pollutant units and timestamps/time zone.
- Rate limits, authentication, licensing, attribution and caching rules.
If any material point is unclear, ask the user.

## AQI standards
Different AQI standards can yield different categories for the same pollutant readings. Never relabel one standard as another. Keep the standard attached to every AQI value.

## Freshness
- Display the observation time and provider update time if available.
- Define a stale-data rule only after checking provider update behavior.
- Never silently present cached/stale values as current.
- If only historical data exists, label it historical.

## Model facts currently known
- Historical source: Kaggle air-quality dataset; Delhi subset.
- Data ends: 2020-07-01.
- Model: Linear Regression prototype with time/lag features.
- Existing 80/20 chronological test: MAE 32.11, RMSE 43.64.
- Persistence baseline on same test: MAE 31.46, RMSE 45.11.
- Therefore, current model does not beat the persistence baseline on MAE and must not be represented as a reliable operational forecast.
- A one-step prediction from the last historical row is a historical demonstration, not a 2026/current forecast.

## ML integration gate
Before integrating:
1. Inspect exact saved model, feature order, preprocessing, and feature-generation code.
2. Verify required inputs exist and are recent enough for the intended use.
3. Evaluate against simple baselines using time-aware validation.
4. Confirm model output units and target AQI standard.
5. Show validation window, MAE/RMSE and baseline result in Insights.
6. If any gate fails, do not expose a live forecast; display “Experimental ML forecast unavailable/not validated” and explain briefly.

## Health guidance
Use recognized official public-health guidance and cite/link the source. Keep it general, not diagnostic. Do not claim a specific individual is safe or unsafe. Match guidance to the relevant AQI standard.
