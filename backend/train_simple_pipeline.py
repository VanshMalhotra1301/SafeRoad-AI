"""
================================================================================
SafeRoad AI — Simple & Production-Grade ML Training Pipeline
================================================================================
Purpose:
  Trains a Random Forest Regressor to predict Road Accident Risk Score (0.0 to 1.0)
  following the complete standard Machine Learning Lifecycle:
  1. Data Ingestion & Inspection
  2. Data Cleaning & Missing Value Handling
  3. Feature Preprocessing (One-Hot Encoding + Standardization via ColumnTransformer)
  4. Hyperparameter Tuning using K-Fold Cross-Validation (GridSearchCV)
  5. Holdout Test Set Evaluation (R2, MAE, RMSE)
  6. Feature Importance Extraction & Model Export
================================================================================
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


def run_training_pipeline():
    print("=" * 70)
    print("[STEP 1] DATA INGESTION & INSPECTION")
    print("=" * 70)

    # Resolve dataset path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "data", "indian_roads_dataset.csv")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    # Load raw dataset
    df = pd.read_csv(dataset_path)
    print(f"[+] Dataset loaded successfully.")
    print(f"  - Total records (rows): {df.shape[0]:,}")
    print(f"  - Total features (cols): {df.shape[1]}")
    print(f"  - Sample columns: {df.columns.tolist()[:8]} ...")

    print("\n" + "=" * 70)
    print("[STEP 2] DATA CLEANING & PREPARATION")
    print("=" * 70)

    # Check and drop duplicate rows if any exist
    duplicates_count = df.duplicated().sum()
    if duplicates_count > 0:
        df = df.drop_duplicates()
        print(f"[+] Removed {duplicates_count} duplicate rows.")
    else:
        print("[+] No duplicate records found.")

    # Target variable: 'risk_score' (Continuous value from 0.0 to 1.0)
    target_column = 'risk_score'

    # Drop rows where target is missing
    df = df.dropna(subset=[target_column])

    # Select relevant feature subsets
    # (Exclude identifiers or leaky outcome targets like 'accident_id', 'accident_severity', 'casualties')
    categorical_features = ['city', 'road_type', 'weather', 'visibility', 'traffic_density']
    numerical_features = ['lanes', 'traffic_signal', 'temperature', 'hour', 'is_weekend', 'is_peak_hour']

    X = df[categorical_features + numerical_features]
    y = df[target_column]

    print(f"[+] Selected {len(numerical_features)} numerical features: {numerical_features}")
    print(f"[+] Selected {len(categorical_features)} categorical features: {categorical_features}")
    print(f"[+] Target variable: '{target_column}' (Mean: {y.mean():.3f}, Min: {y.min():.2f}, Max: {y.max():.2f})")

    print("\n" + "=" * 70)
    print("[STEP 3] TRAIN / TEST SPLIT (PREVENT DATA LEAKAGE)")
    print("=" * 70)

    # 80% Training, 20% Holdout Testing with fixed random_state for exact reproducibility
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"[+] Training samples: {X_train.shape[0]:,} (80%)")
    print(f"[+] Holdout testing samples: {X_test.shape[0]:,} (20%)")

    print("\n" + "=" * 70)
    print("[STEP 4] PREPROCESSING PIPELINES & NORMALIZATION")
    print("=" * 70)

    # Pipeline A: Numerical Preprocessing
    # 1. Impute missing numbers with median
    # 2. Standardize/Normalize to 0 mean and unit variance (Z-score scaling)
    numerical_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # Pipeline B: Categorical Preprocessing
    # 1. Impute missing categories with most frequent value
    # 2. One-Hot Encode categories (creates binary 0/1 indicator columns)
    categorical_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    # Combine both into a single unified ColumnTransformer
    preprocessor = ColumnTransformer(transformers=[
        ('num', numerical_pipeline, numerical_features),
        ('cat', categorical_pipeline, categorical_features)
    ])
    print("[+] Preprocessor configured: StandardScaler for numericals, OneHotEncoder for categoricals.")

    # Complete End-to-End Pipeline: Preprocessing + Model
    full_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(random_state=42))
    ])
    print("[+] Full Pipeline assembled: Data Ingestion -> Transformer -> Random Forest Regressor.")

    print("\n" + "=" * 70)
    print("[STEP 5] HYPERPARAMETER TUNING VIA GRIDSEARCHCV")
    print("=" * 70)
    print("[*] Tuning hyperparameters with 3-Fold Cross-Validation on training split...")

    # Grid of candidate hyperparameters to test
    param_grid = {
        'model__n_estimators': [50, 100],          # Number of decision trees
        'model__max_depth': [10, 16],               # Maximum tree depth
        'model__min_samples_split': [2, 5]          # Minimum samples required to split a node
    }

    grid_search = GridSearchCV(
        estimator=full_pipeline,
        param_grid=param_grid,
        cv=3,                                       # 3-Fold Cross-Validation
        scoring='r2',                               # Metric to optimize
        n_jobs=-1,                                  # Use all available CPU cores
        verbose=1
    )

    grid_search.fit(X_train, y_train)

    print(f"\n[+] Hyperparameter tuning complete!")
    print(f"  - Best Hyperparameters: {grid_search.best_params_}")
    print(f"  - Best Cross-Validation R2: {grid_search.best_score_:.4f}")

    best_pipeline = grid_search.best_estimator_

    print("\n" + "=" * 70)
    print("[STEP 6] HOLDOUT TEST SET EVALUATION")
    print("=" * 70)

    # Predict on completely unseen holdout test set
    y_pred = best_pipeline.predict(X_test)

    # Evaluate standard regression metrics
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    explained_variance = r2 * 100

    print(f"[+] FINAL TEST METRICS (Holdout 4,000 samples):")
    print(f"  * R2 Score (Coefficient of Determination) : {r2:.4f} ({explained_variance:.2f}% variance explained)")
    print(f"  * Mean Absolute Error (MAE)               : {mae:.4f}")
    print(f"  * Root Mean Squared Error (RMSE)          : {rmse:.4f}")

    print("\n" + "=" * 70)
    print("[STEP 7] FEATURE IMPORTANCE EXTRACTION")
    print("=" * 70)

    # Extract fitted feature names after One-Hot Encoding
    encoded_cat_cols = best_pipeline.named_steps['preprocessor'] \
        .named_transformers_['cat'] \
        .named_steps['encoder'] \
        .get_feature_names_out(categorical_features).tolist()

    all_feature_names = numerical_features + encoded_cat_cols
    importances = best_pipeline.named_steps['model'].feature_importances_

    fi_df = pd.DataFrame({
        'Feature': all_feature_names,
        'Importance': importances * 100
    }).sort_values(by='Importance', ascending=False)

    print("Top 8 Most Influential Features:")
    for idx, row in fi_df.head(8).reset_index().iterrows():
        print(f"  {idx + 1}. {row['Feature']:<28} : {row['Importance']:.2f}%")

    print("\n" + "=" * 70)
    print("[STEP 8] MODEL EXPORT & ARTIFACT SERIALIZATION")
    print("=" * 70)

    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    export_path = os.path.join(models_dir, "best_pipeline_model.joblib")

    joblib.dump(best_pipeline, export_path)
    print(f"[+] Full model pipeline (preprocessing + trained RF) saved to:")
    print(f"  {export_path}")
    print("\n[SUCCESS] ML PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")

    return best_pipeline, {
        "r2_score": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "best_params": grid_search.best_params_
    }


if __name__ == "__main__":
    run_training_pipeline()
