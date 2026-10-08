"""
SafeRoad AI — Model Training & Dataset Analytics Pipeline
Trains genuine Random Forest models on:
1. Indian Road Accident Dataset (2022-2025) [sehaj1104]
2. Road Accident Severity in India [s3programmer]
Extracts authentic metrics, confusion matrices, feature importances, and statistical insights.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error,
    accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
)

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    path1 = os.path.join(data_dir, "indian_roads_dataset.csv")
    path2 = os.path.join(data_dir, "Road.csv")

    print(f"Loading Dataset 1 from {path1}...")
    df1 = pd.read_csv(path1)
    print(f"Dataset 1 shape: {df1.shape}")

    print(f"Loading Dataset 2 from {path2}...")
    df2 = pd.read_csv(path2)
    print(f"Dataset 2 shape: {df2.shape}")

    # =========================================================================
    # 1. PREPARE DATASET 1 FOR MODEL TRAINING
    # =========================================================================
    # Features for predicting risk_score and accident_severity
    cat_features = ['city', 'road_type', 'weather', 'visibility', 'traffic_density']
    num_features = ['lanes', 'traffic_signal', 'temperature', 'hour', 'is_weekend', 'is_peak_hour']
    all_feature_cols = cat_features + num_features

    # One-hot encode categoricals with consistent column naming
    df1_encoded = pd.get_dummies(df1[all_feature_cols], columns=cat_features, drop_first=False)
    feature_columns = df1_encoded.columns.tolist()

    X = df1_encoded
    y_risk = df1['risk_score'].astype(float)
    y_severity = df1['accident_severity'].astype(str)

    # Train-test split (80-20, fixed random seed for reproducibility)
    X_train, X_test, y_risk_train, y_risk_test, y_sev_train, y_sev_test = train_test_split(
        X, y_risk, y_severity, test_size=0.2, random_state=42, stratify=y_severity
    )

    # --- MODEL 1: Random Forest Regressor for Risk Score ---
    print("Training Random Forest Regressor (Risk Score)...")
    rf_regressor = RandomForestRegressor(n_estimators=100, max_depth=16, min_samples_split=4, random_state=42, n_jobs=-1)
    rf_regressor.fit(X_train, y_risk_train)

    y_risk_pred = rf_regressor.predict(X_test)
    r2 = float(r2_score(y_risk_test, y_risk_pred))
    mae = float(mean_absolute_error(y_risk_test, y_risk_pred))
    rmse = float(np.sqrt(mean_squared_error(y_risk_test, y_risk_pred)))

    print(f"Random Forest Regressor Results: R2={r2:.4f}, MAE={mae:.4f}, RMSE={rmse:.4f}")

    # --- MODEL 2: Random Forest Classifier for Accident Severity ---
    print("Training Random Forest Classifier (Accident Severity)...")
    rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=14, class_weight='balanced', random_state=42, n_jobs=-1)
    rf_classifier.fit(X_train, y_sev_train)

    y_sev_pred = rf_classifier.predict(X_test)
    classes = ['minor', 'major', 'fatal']  # canonical order
    acc = float(accuracy_score(y_sev_test, y_sev_pred))
    prec, rec, f1, support = precision_recall_fscore_support(y_sev_test, y_sev_pred, labels=classes, zero_division=0)
    cm = confusion_matrix(y_sev_test, y_sev_pred, labels=classes).tolist()

    # Global Feature Importances from the Risk Regressor
    importances = rf_regressor.feature_importances_
    fi_list = sorted(
        [{"feature": col, "importance": round(float(imp) * 100, 2)} for col, imp in zip(feature_columns, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )

    # Save models
    joblib.dump(rf_regressor, os.path.join(models_dir, "rf_risk_regressor.joblib"))
    joblib.dump(rf_classifier, os.path.join(models_dir, "rf_severity_classifier.joblib"))
    with open(os.path.join(models_dir, "feature_columns.json"), "w") as f:
        json.dump(feature_columns, f, indent=2)

    # =========================================================================
    # 2. EVALUATE DATASET 2 (BENCHMARK SEVERITY)
    # =========================================================================
    cols_d2 = ['Day_of_week', 'Age_band_of_driver', 'Type_of_vehicle', 'Types_of_Junction',
               'Road_surface_conditions', 'Light_conditions', 'Weather_conditions',
               'Number_of_vehicles_involved', 'Number_of_casualties']
    d2_clean = df2[cols_d2 + ['Accident_severity']].dropna()
    X2 = pd.get_dummies(d2_clean[cols_d2], drop_first=True)
    y2 = d2_clean['Accident_severity']

    X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42, stratify=y2)
    rf2 = RandomForestClassifier(n_estimators=100, max_depth=12, class_weight='balanced', random_state=42, n_jobs=-1)
    rf2.fit(X2_train, y2_train)
    y2_pred = rf2.predict(X2_test)
    d2_acc = float(accuracy_score(y2_test, y2_pred))
    d2_classes = sorted(y2.unique().tolist())
    d2_cm = confusion_matrix(y2_test, y2_pred, labels=d2_classes).tolist()
    d2_prec, d2_rec, d2_f1, _ = precision_recall_fscore_support(y2_test, y2_pred, labels=d2_classes, zero_division=0)

    # =========================================================================
    # 3. COMPILE REAL METADATA
    # =========================================================================
    metadata = {
        "dataset_1": {
            "name": "Indian Road Accident Dataset (2022–2025)",
            "source": "Kaggle (sehaj1104/indian-road-accident-dataset-20222025)",
            "total_records": len(df1),
            "total_features": len(df1.columns),
            "cities_covered": sorted(df1['city'].unique().tolist()),
            "regressor_metrics": {
                "model_type": "Random Forest Regressor (100 Trees)",
                "r2_score": round(r2, 4),
                "mae": round(mae, 4),
                "rmse": round(rmse, 4),
                "variance_explained_pct": round(r2 * 100, 2)
            },
            "classifier_metrics": {
                "model_type": "Random Forest Classifier (Balanced)",
                "accuracy": round(acc, 4),
                "classes": classes,
                "precision": {cls: round(float(p), 4) for cls, p in zip(classes, prec)},
                "recall": {cls: round(float(r), 4) for cls, r in zip(classes, rec)},
                "f1_score": {cls: round(float(f), 4) for cls, f in zip(classes, f1)},
                "confusion_matrix": {
                    "labels": classes,
                    "matrix": cm
                }
            },
            "feature_importances": fi_list[:15]
        },
        "dataset_2": {
            "name": "Road Accident Severity in India",
            "source": "Kaggle (s3programmer/road-accident-severity-in-india)",
            "total_records": len(df2),
            "total_features": len(df2.columns),
            "accuracy": round(d2_acc, 4),
            "classes": d2_classes,
            "confusion_matrix": {
                "labels": d2_classes,
                "matrix": d2_cm
            },
            "precision": {cls: round(float(p), 4) for cls, p in zip(d2_classes, d2_prec)},
            "recall": {cls: round(float(r), 4) for cls, r in zip(d2_classes, d2_rec)},
            "f1_score": {cls: round(float(f), 4) for cls, f in zip(d2_classes, d2_f1)}
        }
    }

    with open(os.path.join(models_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # =========================================================================
    # 4. PRECOMPUTE REAL ANALYTICAL INSIGHTS FOR FRONTEND
    # =========================================================================
    # City summaries with exact coordinates
    city_coords = {
        "Delhi": {"lat": 28.6139, "lng": 77.2090, "state": "Delhi"},
        "Mumbai": {"lat": 19.0760, "lng": 72.8777, "state": "Maharashtra"},
        "Bangalore": {"lat": 12.9716, "lng": 77.5946, "state": "Karnataka"},
        "Chandigarh": {"lat": 30.7333, "lng": 76.7794, "state": "Punjab/Haryana"},
        "Chennai": {"lat": 13.0827, "lng": 80.2707, "state": "Tamil Nadu"},
        "Kolkata": {"lat": 22.5726, "lng": 88.3639, "state": "West Bengal"},
        "Hyderabad": {"lat": 17.3850, "lng": 78.4867, "state": "Telangana"},
        "Pune": {"lat": 18.5204, "lng": 73.8567, "state": "Maharashtra"}
    }

    cities_stats = []
    for city, grp in df1.groupby('city'):
        coords = city_coords.get(city, {"lat": float(grp['latitude'].mean()), "lng": float(grp['longitude'].mean()), "state": grp['state'].iloc[0]})
        total = len(grp)
        avg_risk = round(float(grp['risk_score'].mean()) * 100, 1)
        fatal_count = int((grp['accident_severity'] == 'fatal').sum())
        major_count = int((grp['accident_severity'] == 'major').sum())
        minor_count = int((grp['accident_severity'] == 'minor').sum())
        top_cause = grp['cause'].mode().iloc[0] if 'cause' in grp else 'Traffic congestion'

        cities_stats.append({
            "city": city,
            "state": coords["state"],
            "lat": coords["lat"],
            "lng": coords["lng"],
            "total_accidents": total,
            "avg_risk_score": avg_risk,
            "fatal_accidents": fatal_count,
            "fatal_rate": round((fatal_count / total) * 100, 1),
            "major_accidents": major_count,
            "minor_accidents": minor_count,
            "top_cause": top_cause
        })
    cities_stats.sort(key=lambda x: x["total_accidents"], reverse=True)

    # Hourly distribution
    hourly_stats = []
    for hr, grp in df1.groupby('hour'):
        hourly_stats.append({
            "hour": int(hr),
            "time_label": f"{int(hr):02d}:00",
            "accidents": len(grp),
            "avg_risk": round(float(grp['risk_score'].mean()) * 100, 1),
            "is_peak": int(grp['is_peak_hour'].iloc[0]) if 'is_peak_hour' in grp else (1 if hr in [8, 9, 10, 17, 18, 19, 20] else 0)
        })
    hourly_stats.sort(key=lambda x: x["hour"])

    # Weather & Visibility Cross-tabulation
    weather_stats = []
    for w, grp in df1.groupby('weather'):
        weather_stats.append({
            "weather": w.capitalize(),
            "count": len(grp),
            "avg_risk": round(float(grp['risk_score'].mean()) * 100, 1),
            "fatal_pct": round(float((grp['accident_severity'] == 'fatal').mean()) * 100, 1)
        })

    visibility_stats = []
    for v, grp in df1.groupby('visibility'):
        visibility_stats.append({
            "visibility": v.capitalize(),
            "count": len(grp),
            "avg_risk": round(float(grp['risk_score'].mean()) * 100, 1),
            "fatal_pct": round(float((grp['accident_severity'] == 'fatal').mean()) * 100, 1)
        })

    # Road Type stats
    road_type_stats = []
    for rt, grp in df1.groupby('road_type'):
        road_type_stats.append({
            "road_type": rt.capitalize(),
            "count": len(grp),
            "avg_risk": round(float(grp['risk_score'].mean()) * 100, 1),
            "fatal_pct": round(float((grp['accident_severity'] == 'fatal').mean()) * 100, 1)
        })

    # Traffic Density stats
    traffic_density_stats = []
    for td, grp in df1.groupby('traffic_density'):
        traffic_density_stats.append({
            "traffic_density": td.capitalize(),
            "count": len(grp),
            "avg_risk": round(float(grp['risk_score'].mean()) * 100, 1)
        })

    # Severity distribution (Dataset 1)
    sev_counts = df1['accident_severity'].value_counts()
    severity_distribution = [
        {"name": "Minor", "count": int(sev_counts.get('minor', 0)), "percentage": round(float(sev_counts.get('minor', 0) / len(df1) * 100), 1), "color": "#10B981"},
        {"name": "Major", "count": int(sev_counts.get('major', 0)), "percentage": round(float(sev_counts.get('major', 0) / len(df1) * 100), 1), "color": "#F59E0B"},
        {"name": "Fatal", "count": int(sev_counts.get('fatal', 0)), "percentage": round(float(sev_counts.get('fatal', 0) / len(df1) * 100), 1), "color": "#EF4444"}
    ]

    # Dataset 2 top causes & environmental factors
    d2_causes = df2['Cause_of_accident'].value_counts().head(8)
    dataset2_causes = [{"cause": str(k), "count": int(v), "percentage": round(float(v / len(df2) * 100), 1)} for k, v in d2_causes.items()]

    d2_surface = df2['Road_surface_conditions'].value_counts().head(5)
    dataset2_surface = [{"surface": str(k), "count": int(v)} for k, v in d2_surface.items()]

    d2_light = df2['Light_conditions'].value_counts().head(5)
    dataset2_light = [{"light": str(k), "count": int(v)} for k, v in d2_light.items()]

    d2_vehicles = df2['Type_of_vehicle'].value_counts().head(6)
    dataset2_vehicles = [{"vehicle": str(k), "count": int(v)} for k, v in d2_vehicles.items()]

    d2_severity_distribution = [
        {"name": "Slight Injury", "count": int((df2['Accident_severity'] == 'Slight Injury').sum()), "percentage": round(float((df2['Accident_severity'] == 'Slight Injury').mean() * 100), 1), "color": "#10B981"},
        {"name": "Serious Injury", "count": int((df2['Accident_severity'] == 'Serious Injury').sum()), "percentage": round(float((df2['Accident_severity'] == 'Serious Injury').mean() * 100), 1), "color": "#F59E0B"},
        {"name": "Fatal Injury", "count": int((df2['Accident_severity'] == 'Fatal injury').sum()), "percentage": round(float((df2['Accident_severity'] == 'Fatal injury').mean() * 100), 1), "color": "#EF4444"}
    ]

    insights_data = {
        "summary": {
            "total_incidents_analyzed": len(df1) + len(df2),
            "primary_dataset_records": len(df1),
            "supporting_dataset_records": len(df2),
            "cities_count": len(cities_stats),
            "overall_avg_risk_score": round(float(df1['risk_score'].mean()) * 100, 1),
            "peak_hour_risk_jump_pct": round(((df1[df1['is_peak_hour'] == 1]['risk_score'].mean() - df1[df1['is_peak_hour'] == 0]['risk_score'].mean()) / df1[df1['is_peak_hour'] == 0]['risk_score'].mean()) * 100, 1),
            "fog_risk_multiplier": round(float(df1[df1['weather'] == 'fog']['risk_score'].mean() / df1[df1['weather'] == 'clear']['risk_score'].mean()), 2),
            "low_visibility_risk_multiplier": round(float(df1[df1['visibility'] == 'low']['risk_score'].mean() / df1[df1['visibility'] == 'high']['risk_score'].mean()), 2)
        },
        "cities": cities_stats,
        "hourly": hourly_stats,
        "weather": weather_stats,
        "visibility": visibility_stats,
        "road_types": road_type_stats,
        "traffic_density": traffic_density_stats,
        "severity_distribution": severity_distribution,
        "dataset2": {
            "severity_distribution": d2_severity_distribution,
            "top_causes": dataset2_causes,
            "road_surface": dataset2_surface,
            "light_conditions": dataset2_light,
            "vehicle_types": dataset2_vehicles
        }
    }

    with open(os.path.join(models_dir, "dataset_insights.json"), "w") as f:
        json.dump(insights_data, f, indent=2)

    print("Pipeline completed successfully! Models and authentic insights saved.")

if __name__ == "__main__":
    train_and_evaluate()
