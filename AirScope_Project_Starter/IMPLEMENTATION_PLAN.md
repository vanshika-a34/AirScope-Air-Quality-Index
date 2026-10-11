# Implementation Plan

Target: a credible MVP in about three hours. This is a time budget, not a promise. If real data integration takes longer, reduce features rather than fake data.

## Phase 1 — Inspect and verify (10–15 min)
- Read all docs and inspect repository.
- Check runtime versions and current project structure.
- Research/verify candidate AQI API: coverage, current vs forecast fields, AQI standard, units, attribution, rate limits, authentication, licensing and terms.
- Ask the user to approve the provider if any material detail is uncertain.

## Phase 2 — Thin end-to-end slice (30–40 min)
- Set up React + Vite and FastAPI if confirmed in `TECH_STACK.md`.
- Add one backend endpoint for AQI lookup.
- Connect one verified provider.
- Render a genuine result with source, AQI standard and timestamp when supplied.
- Implement loading, no-data, offline, rate-limit and server-error states.
- Test the flow before adding visual complexity.

## Phase 3 — Main dashboard visual (35–45 min)
- Match `design-reference.png`: sidebar, search/top bar, Earth hero, AQI gauge, pollutant card, health guidance, forecast chart and day cards.
- Use actual data only. If an individual field is not provided, show “Not available.”
- Do not copy the mockup's sample values into the app.
- Use a static decorative Earth image if no suitable real-time globe is available; do not imply it is a live pollution map.

## Phase 4 — Forecast and secondary views (25–35 min)
- Add provider forecast if the verified API supports it.
- Add Map and Insights only if real data and time allow; otherwise show a clear “Not available in this MVP” or defer the tab instead of fake markers/charts.
- Make mobile views responsive and interactive.

## Phase 5 — ML integration (optional within the time box)
- Inspect the saved model and feature-generation pipeline before integrating.
- The current Delhi model is trained on historical data ending 2020-07-01; test MAE 32.11 and RMSE 43.64 on the 80/20 split, while persistence baseline MAE is 31.46. It does not beat that baseline on MAE.
- Do not use this model for current forecasts without suitable recent input data and a defensible evaluation. Prefer an “Experimental model not currently available” panel until this is solved.
- If the model cannot be integrated honestly within the time budget, leave it out of the live path and document why.

## Phase 6 — Verify and package (15–20 min)
- Run frontend/backend, smoke-test primary flow and failure states.
- Test responsive layout and console/server errors.
- Write accurate run instructions and known limitations.
- Update `DECISIONS_AND_CHANGES.md`.

## Stop conditions
Pause and ask the user if provider terms/standard are unclear, credentials are needed, data values conflict, the UI would need fabricated content, or a decision changes the intended product.
