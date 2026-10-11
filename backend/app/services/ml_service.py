import csv
import json
import os
from pathlib import Path
from typing import Optional, List
from app.models import MLEvaluationResponse, MLMetrics, HistoricalSampleRecord

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ML_DIR = PROJECT_ROOT / "aqi_project_files"

def get_ml_evaluation_data() -> MLEvaluationResponse:
    config_path = ML_DIR / "model_config.json"
    data_csv_path = ML_DIR / "delhi_model_data.csv"

    city = "Delhi"
    model_name = "Linear Regression"
    target = "next_day_AQI"
    features = [
        "aqi_today",
        "aqi_1_day_ago",
        "aqi_2_days_ago",
        "aqi_3_days_ago",
        "aqi_7_days_ago",
        "forecast_month",
        "forecast_day_of_week"
    ]
    data_end = "2020-06-30"
    train_split = 0.8

    if config_path.exists():
        try:
            with open(config_path, "r") as f:
                cfg = json.load(f)
                city = cfg.get("city", city)
                model_name = cfg.get("model", model_name)
                target = cfg.get("target", target)
                features = cfg.get("features", features)
                data_end = cfg.get("data_end_date", data_end)
                train_split = cfg.get("training_fraction", train_split)
        except Exception:
            pass

    # Exact coefficients from inspected delhi_aqi_model.joblib
    coefficients = {
        "aqi_today": 0.8760,
        "aqi_1_day_ago": -0.1879,
        "aqi_2_days_ago": 0.1237,
        "aqi_3_days_ago": 0.0431,
        "aqi_7_days_ago": 0.0756,
        "forecast_month": 0.7858,
        "forecast_day_of_week": -0.5916,
    }
    intercept = 16.0149

    metrics = MLMetrics(
        mae=32.11,
        rmse=43.64,
        persistence_mae=31.46,
        persistence_rmse=45.11,
    )

    test_samples: List[HistoricalSampleRecord] = []
    if data_csv_path.exists():
        try:
            with open(data_csv_path, "r") as f:
                reader = list(csv.DictReader(f))
                total_rows = len(reader)
                split_idx = int(total_rows * train_split)
                test_rows = reader[split_idx:]
                sample_indices = [0, 50, 100, 150, 200, 300, len(test_rows) - 1]
                for idx in sample_indices:
                    if idx < len(test_rows):
                        r = test_rows[idx]
                        y_true = float(r["target"])
                        x_today = float(r["aqi_today"])
                        x_1 = float(r["aqi_1_day_ago"])
                        x_2 = float(r["aqi_2_days_ago"])
                        x_3 = float(r["aqi_3_days_ago"])
                        x_7 = float(r["aqi_7_days_ago"])
                        x_m = float(r["forecast_month"])
                        x_d = float(r["forecast_day_of_week"])

                        y_pred = (
                            intercept
                            + coefficients["aqi_today"] * x_today
                            + coefficients["aqi_1_day_ago"] * x_1
                            + coefficients["aqi_2_days_ago"] * x_2
                            + coefficients["aqi_3_days_ago"] * x_3
                            + coefficients["aqi_7_days_ago"] * x_7
                            + coefficients["forecast_month"] * x_m
                            + coefficients["forecast_day_of_week"] * x_d
                        )

                        test_samples.append(
                            HistoricalSampleRecord(
                                date=r["Date"],
                                actual=round(y_true, 1),
                                model_pred=round(y_pred, 1),
                                model_abs_error=round(abs(y_pred - y_true), 1),
                                persistence_pred=round(x_today, 1),
                                persistence_abs_error=round(abs(x_today - y_true), 1),
                            )
                        )
        except Exception as e:
            print(f"Error reading historical test samples: {e}")

    limitation_note = (
        "This Linear Regression model was trained on historical Delhi daily air quality data concluding "
        "on July 1, 2020. On its chronological 80/20 test split (394 test days from 2019-06-03 to 2020-06-30), "
        "the model achieved an MAE of 32.11, which did not outperform the naive persistence baseline (MAE 31.46). "
        "Consequently, it has not been validated for live operational forecasting and is presented solely for educational evaluation."
    )

    return MLEvaluationResponse(
        model_name=model_name,
        city=city,
        target=target,
        training_data_end=data_end,
        train_split_fraction=train_split,
        features=features,
        coefficients=coefficients,
        intercept=intercept,
        metrics=metrics,
        status_label="Experimental Model — Historical Validation Only",
        limitation_note=limitation_note,
        is_live_forecast=False,
        test_sample_records=test_samples,
    )
