# Tech Stack

## Proposed stack
- **Frontend:** React + Vite + TypeScript if setup remains quick; otherwise ask before switching to JavaScript.
- **Styling:** CSS modules or plain organized CSS with design tokens; no UI framework required unless it speeds delivery without hurting fidelity.
- **Charts:** Recharts or another small chart library only if installed/usable quickly; chart must handle missing values and label source.
- **Backend:** Python + FastAPI + Uvicorn.
- **Data handling:** `httpx` for provider HTTP requests; Pydantic response/request schemas.
- **ML (optional):** scikit-learn + joblib, only after reviewing exact feature order, preprocessing and validity.
- **Testing:** pytest for backend logic; frontend build/lint and a manual smoke test. Add more tooling only if already available or clearly worthwhile.
- **Version control:** Git; secrets excluded via `.gitignore`.

## Decisions that need verification
- AQI provider, AQI standard and allowed use.
- Whether a provider API key is required.
- Whether to include the custom ML model in this MVP.
- Hosting/deployment platform.
- Whether map implementation is feasible with permitted data and time.

Do not silently add paid services, a database, authentication or heavyweight 3D dependencies.
