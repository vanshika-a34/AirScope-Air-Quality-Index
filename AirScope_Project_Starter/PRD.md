# Product Requirements Document

## Overview
**Product:** AirScope — AQI Intelligence  
**Purpose:** Help people understand air quality through a polished, weather-app-like experience while making data source, standard, freshness and uncertainty visible.

## Target users
- Students and commuters checking air quality before going outside.
- Residents comparing supported cities or locations.
- People who want simple explanations of pollutants and AQI categories.
- Curious users exploring historical trends and forecast changes.

AirScope is informational, not a medical device or emergency service.

## User problem
AQI information can be technical, fragmented, hard to interpret, and easy to confuse with a forecast. Users need understandable values, timestamps, sources and limitations.

## USP
A premium Earth-inspired AQI dashboard that brings together genuine air-quality data, transparent provider forecasts, pollutant explanations and a clearly separated experimental ML experience.

## Core user stories
1. Check a supported location without creating an account.
2. See AQI value/category, AQI standard, source and timestamp where available.
3. See pollutant concentrations and units only when actually provided.
4. Explore a forecast only when the selected source provides it.
5. Understand general precautions with reputable source attribution.
6. See clear loading, empty, unsupported-location, stale-data, offline, rate-limit and server-error states.
7. Use the dashboard on desktop and mobile.
8. Inspect historical analysis/experimental ML only when its inputs and limitations are clearly described.

## Main areas
- **Home:** search, location, AQI hero, Earth visual, pollutant panel, health guidance, forecast chart and daily cards.
- **Map:** map and city/station markers only if a real, permitted data source and map implementation are confirmed.
- **Forecast:** genuine provider forecast with date range and source label.
- **Insights:** verified historical trends and model evaluation; no invented metrics.
- **Settings:** minimal units/theme/preferences if useful. No profile/account.

## MVP acceptance criteria
- Search produces genuine data or an honest unavailable state.
- No fake environmental values appear in production UI.
- Provider, AQI standard and timestamps are visible where available.
- Provider forecasts and AirScope ML predictions are distinct.
- UI responds to desktop and mobile widths.
- Setup/run/test instructions are accurate.

## Unique features / ideas
- Earth-atmosphere hero with selected-location marker.
- Pollutant panel with units and short plain-language explanations.
- AQI trend chart that visually separates observed values from forecasts.
- “What this means” health guidance based on the correct standard.
- “What may be driving the AQI?” only when supported by pollutant data; never infer emissions sources without evidence.
- Multi-city comparison only for locations with supported data.
- Experimental ML panel with validation metrics and an explicit limitation note.

## Out of scope for first MVP
Accounts, profile, social feed, medical diagnosis, push alerts, unsupported global coverage claims, production ML claims, complex interactive 3D Earth, and any feature that requires unverified data.

## Product principles
Trust before decoration. Source labels before confident claims. Unavailable is better than made up.
