# Frontend and UI Specification

## Visual source of truth
Use `design-reference.png` as the exact composition/style target. Aim to match it closely in spacing, layout, color, hierarchy, card shapes and responsive previews. A raster reference cannot guarantee pixel-perfect reproduction, but do not redesign it into a generic dashboard. Reuse its layout and visual language consistently across pages.

## Design system
- Background: near-black / deep navy-charcoal.
- Text: white and cool gray.
- Signature accent: vivid orange for logo, selected navigation, AQI gauge, focus states and forecast line.
- AQI category colors: use only according to the chosen AQI standard and display legend/labels; never imply color alone is enough.
- Cards: dark translucent surfaces, subtle blue-gray borders, rounded corners, restrained shadows/glow.
- Typography: clean modern sans-serif; clear hierarchy and generous spacing.
- Motion: subtle transitions only; respect reduced-motion preferences.
- Icons: consistent icon set; no profile/avatar. Use settings icon or omit it.

## Desktop Home page — follow reference composition
1. Left vertical sidebar with AirScope mark and Home, Map, Forecast, Insights, Settings.
2. Top search field for city/location.
3. Top-right weather/temperature only if genuine weather data is integrated; otherwise omit it. Show selected location and settings icon.
4. Hero zone: location name, local time only if reliably available, large AQI gauge and category, short standard-based health note.
5. Large glowing Earth image/visual in the center. It is decorative unless backed by real geospatial data; never imply its glow is measured live pollution.
6. Right pollutant card with available pollutants, units, relative indicator only when meaningful, and “See all” if details page exists.
7. Health Advice card with general source-based guidance.
8. Lower forecast chart with range controls only for supported data windows. Distinguish observed vs forecast line style.
9. Daily forecast cards with date, AQI/category and provider attribution.

## Map page
- Dark map treatment with legend, location search and supported markers.
- Render only locations with actual coordinates and genuine values.
- If map API/data cannot be verified, do not fabricate dots or city values. Defer map or show an honest unavailable state.

## Forecast page
- Large interactive chart and selectable forecast period.
- Show source, timestamp/update time, AQI standard and units.
- Actual/observed and forecast series must be visually distinct.
- If the provider does not offer a requested period, disable it or explain availability.

## Insights page
- Historical trend and pollutant comparisons only when real historical data exists.
- If ML is included, show evaluation window, MAE/RMSE and baseline comparison from actual recorded evaluation.
- Explain that model output is experimental if it is not validated enough for practical forecasts.
- Never invent explanations or causal claims.

## Settings page
- Minimal settings such as theme (dark default), units if relevant, and data-source/standards information.
- No account, profile or login.

## Mobile behavior
- Treat the provided phone screens as the visual target.
- Replace sidebar with compact top bar and bottom navigation: Home, Map, Forecast, Insights.
- Put AQI gauge first; then pollutant summary, forecast preview, and health guidance.
- Forecast cards scroll horizontally.
- Cards stack cleanly, charts remain legible, and touch targets are comfortably sized.
- Settings is accessible from the top bar; no profile/avatar.

## Required UI states
- Initial loading/skeleton
- Search empty/no results
- Unsupported location
- API unavailable/network error
- Rate limit/authentication error
- No pollutant data
- No forecast data
- Stale/old observation (show timestamp; do not call it current)
- Partial response (show available fields and label missing ones)
- Backend unavailable
- Reduced-motion/accessibility behavior

## Critical visual/data rule
The reference image contains illustrative values such as AQI 142 and pollutant values. They are visual mockup content only. Never display those values as actual data unless the live provider truly returns them for the selected place/time.
