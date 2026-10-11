# Testing and Fallback Requirements

## Required fallbacks
1. **Loading:** skeleton/spinner with concise status; prevent confusing duplicate requests.
2. **No search input:** ask user to enter a location.
3. **Unsupported location:** explain it is not covered by the selected provider.
4. **No result:** say no data was returned for the location/time.
5. **Partial result:** render only real fields; label unavailable fields.
6. **No pollutant data:** show “Pollutant details unavailable,” not made-up bars.
7. **No forecast:** hide forecast chart or show a clear unavailable state.
8. **Network/backend failure:** explain data could not be loaded and offer Retry.
9. **Provider rate limit/auth failure:** show service unavailable; never bypass access controls or invent a response.
10. **Stale data:** show actual timestamp and “Last available reading,” not “Live.”
11. **Invalid input:** validate location/coordinates and show a helpful message.
12. **ML unavailable/not validated:** show an explicit experimental/unavailable state; never substitute an API forecast or fake model output.
13. **Missing timestamp/source/standard:** state “Not provided by source” where useful; do not guess.
14. **Map unavailable:** disable/defer map or explain no verified map data is available.
15. **Mobile/network slow:** layout remains usable; retry does not duplicate or corrupt state.

## Minimum tests
- Backend health endpoint is not confused with provider health.
- Provider success is parsed using observed response fields.
- Provider timeout, non-2xx response, malformed response and missing fields are handled.
- Invalid input is rejected.
- No secrets are returned to frontend.
- Frontend loading, success, empty and error states are checked.
- AQI value always retains its standard/source/time metadata when available.
- Forecast and ML prediction are labeled separately.
- No hard-coded mock values leak into production rendering.
- Desktop and mobile layout are manually smoke-tested.

## Test data
Automated tests may use clearly marked fixtures. Fixtures must never be used as a silent production fallback. Any screenshots/demo mode using fixtures must be explicitly labeled “Demo data.”
