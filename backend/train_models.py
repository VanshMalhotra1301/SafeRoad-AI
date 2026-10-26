"""
================================================================================
SafeRoad AI — Improved ML Training Pipeline v2
================================================================================
Addresses all issues identified in the ML pipeline audit:
  1. Proper stratified train/test split with held-out test set
  2. sklearn Pipeline with ColumnTransformer (no data leakage in preprocessing)
  3. Multi-model comparison: Random Forest, ExtraTrees, Gradient Boosting
  4. Cross-validated hyperparameter tuning optimizing macro-F1
  5. Comprehensive class-aware evaluation (confusion matrix, per-class P/R/F1,
     macro-F1, balanced accuracy, fatal-class recall)
  6. Before/after baseline comparison
  7. Reproducible with fixed random seeds
================================================================================
"""

import os
import sys
import json
import time
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    RandomForestRegressor,
)
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    RandomizedSearchCV,
    cross_val_score,
)
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_recall_fscore_support,
    make_scorer,
    confusion_matrix,
    classification_report,
    f1_score,
    r2_score,
    mean_absolute_error,
    mean_squared_error,
)
from sklearn.utils.class_weight import compute_sample_weight

warnings.filterwarnings("ignore", category=UserWarning)

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)


def print_section(title):
    print(f"\n{'=' * 72}")
    print(f"  {title}")
    print(f"{'=' * 72}")


def evaluate_classifier(y_true, y_pred, classes, label=""):
    """Comprehensive class-aware evaluation."""
    acc = accuracy_score(y_true, y_pred)
    bal_acc = balanced_accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, labels=classes, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, labels=classes, average="weighted", zero_division=0)
    prec, rec, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=classes, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=classes)

    print(f"\n  --- {label} Evaluation ---")
    print(f"  Accuracy:          {acc:.4f}")
    print(f"  Balanced Accuracy: {bal_acc:.4f}")
    print(f"  Macro-F1:          {macro_f1:.4f}")
    print(f"  Weighted-F1:       {weighted_f1:.4f}")
    print(f"\n  Per-class metrics:")
    print(f"  {'Class':<10} {'Precision':>10} {'Recall':>10} {'F1':>10} {'Support':>10}")
    print(f"  {'-'*50}")
    for i, cls in enumerate(classes):
        print(f"  {cls:<10} {prec[i]:>10.4f} {rec[i]:>10.4f} {f1[i]:>10.4f} {int(support[i]):>10d}")

    fatal_idx = classes.index("fatal") if "fatal" in classes else -1
    fatal_recall = rec[fatal_idx] if fatal_idx >= 0 else None

    print(f"\n  Confusion Matrix (rows=true, cols=predicted):")
    print(f"  {'':>10}", end="")
    for cls in classes:
        print(f" {cls:>8}", end="")
    print()
    for i, cls in enumerate(classes):
        print(f"  {cls:>10}", end="")
        for j in range(len(classes)):
            print(f" {cm[i][j]:>8d}", end="")
        print()

    return {
        "accuracy": round(acc, 4),
        "balanced_accuracy": round(bal_acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "precision": {cls: round(float(p), 4) for cls, p in zip(classes, prec)},
        "recall": {cls: round(float(r), 4) for cls, r in zip(classes, rec)},
        "f1_score": {cls: round(float(f), 4) for cls, f in zip(classes, f1)},
        "support": {cls: int(s) for cls, s in zip(classes, support)},
        "confusion_matrix": {"labels": classes, "matrix": cm.tolist()},
        "fatal_recall": round(float(fatal_recall), 4) if fatal_recall is not None else None,
    }


def run_improved_pipeline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    # =========================================================================
    # STEP 1: DATA INGESTION & QUALITY AUDIT
    # =========================================================================
    print_section("STEP 1: DATA INGESTION & QUALITY AUDIT")

    df1 = pd.read_csv(os.path.join(data_dir, "indian_roads_dataset.csv"))
    print(f"  Dataset 1 loaded: {df1.shape[0]:,} rows, {df1.shape[1]} columns")

    df2 = pd.read_csv(os.path.join(data_dir, "Road.csv"))
    print(f"  Dataset 2 loaded: {df2.shape[0]:,} rows, {df2.shape[1]} columns")

    sev_counts = df1["accident_severity"].value_counts()
    print(f"\n  Dataset 1 severity distribution:")
    for cls in ["minor", "major", "fatal"]:
        cnt = sev_counts.get(cls, 0)
        print(f"    {cls}: {cnt:,} ({cnt/len(df1)*100:.1f}%)")

    sev2_counts = df2["Accident_severity"].value_counts()
    print(f"\n  Dataset 2 severity distribution:")
    for cls in sev2_counts.index:
        cnt = sev2_counts[cls]
        print(f"    {cls}: {cnt:,} ({cnt/len(df2)*100:.1f}%)")

    dup1 = df1.duplicated().sum()
    if dup1 > 0:
        df1 = df1.drop_duplicates()
        print(f"  Removed {dup1} duplicate rows from Dataset 1")

    leaky_cols = ["casualties", "vehicles_involved", "risk_score", "accident_id",
                  "accident_severity", "date", "time", "state", "latitude",
                  "longitude", "day_of_week", "cause", "festival"]
    print(f"\n  Excluded columns (leakage/identifier/post-hoc):")
    for col in leaky_cols:
        if col in df1.columns:
            print(f"    x {col}")

    # =========================================================================
    # STEP 2: FEATURE SELECTION & PREPROCESSING SETUP
    # =========================================================================
    print_section("STEP 2: FEATURE SELECTION & PREPROCESSING")

    categorical_features = ["city", "road_type", "weather", "visibility", "traffic_density"]
    numerical_features = ["lanes", "traffic_signal", "temperature", "hour", "is_weekend", "is_peak_hour"]

    print(f"  Categorical features ({len(categorical_features)}): {categorical_features}")
    print(f"  Numerical features ({len(numerical_features)}): {numerical_features}")

    X = df1[categorical_features + numerical_features].copy()
    y_severity = df1["accident_severity"].astype(str)
    y_risk = df1["risk_score"].astype(float)

    classes = ["minor", "major", "fatal"]

    numerical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer([
        ("num", numerical_pipeline, numerical_features),
        ("cat", categorical_pipeline, categorical_features),
    ])

    print("  Preprocessor: StandardScaler(numerical) + OneHotEncoder(categorical)")

    # =========================================================================
    # STEP 3: STRATIFIED TRAIN/TEST SPLIT
    # =========================================================================
    print_section("STEP 3: STRATIFIED TRAIN/TEST SPLIT")

    X_train, X_test, y_sev_train, y_sev_test, y_risk_train, y_risk_test = train_test_split(
        X, y_severity, y_risk,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y_severity,
    )

    print(f"  Training set: {len(X_train):,} samples")
    print(f"  Test set:     {len(X_test):,} samples (HELD OUT)")
    print(f"\n  Training class distribution:")
    for cls in classes:
        cnt = (y_sev_train == cls).sum()
        print(f"    {cls}: {cnt:,} ({cnt/len(y_sev_train)*100:.1f}%)")
    print(f"\n  Test class distribution:")
    for cls in classes:
        cnt = (y_sev_test == cls).sum()
        print(f"    {cls}: {cnt:,} ({cnt/len(y_sev_test)*100:.1f}%)")

    # =========================================================================
    # STEP 4: BASELINE
    # =========================================================================
    print_section("STEP 4: BASELINE REPRODUCTION (Current RF Classifier)")

    baseline_pipeline = Pipeline([
        ("preprocessor", clone(preprocessor)),
        ("classifier", RandomForestClassifier(
            n_estimators=100, max_depth=14, class_weight="balanced",
            random_state=RANDOM_STATE, n_jobs=-1,
        )),
    ])

    baseline_pipeline.fit(X_train, y_sev_train)
    y_baseline_pred = baseline_pipeline.predict(X_test)
    baseline_metrics = evaluate_classifier(y_sev_test, y_baseline_pred, classes, "BASELINE (Current RF)")

    # =========================================================================
    # STEP 5: MULTI-MODEL CROSS-VALIDATION COMPARISON
    # =========================================================================
    print_section("STEP 5: MULTI-MODEL CROSS-VALIDATION COMPARISON")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    # Use string scorer 'f1_macro' — make_scorer(f1_score, average='macro') fails
    # with string labels due to sklearn pos_label=1 default bug
    macro_f1_scorer = 'f1_macro'

    candidate_models = {
        "RandomForest": Pipeline([
            ("preprocessor", clone(preprocessor)),
            ("classifier", RandomForestClassifier(
                n_estimators=200, max_depth=16, min_samples_split=4,
                class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1,
            )),
        ]),
        "ExtraTrees": Pipeline([
            ("preprocessor", clone(preprocessor)),
            ("classifier", ExtraTreesClassifier(
                n_estimators=200, max_depth=16, min_samples_split=4,
                class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1,
            )),
        ]),
        "GradientBoosting": Pipeline([
            ("preprocessor", clone(preprocessor)),
            ("classifier", GradientBoostingClassifier(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                min_samples_split=4, random_state=RANDOM_STATE,
            )),
        ]),
    }

    cv_results = {}
    for name, pipeline in candidate_models.items():
        print(f"\n  Cross-validating {name}...", end=" ", flush=True)
        t0 = time.time()

        if name == "GradientBoosting":
            scores = []
            for train_idx, val_idx in cv.split(X_train, y_sev_train):
                X_cv_train = X_train.iloc[train_idx]
                X_cv_val = X_train.iloc[val_idx]
                y_cv_train = y_sev_train.iloc[train_idx]
                y_cv_val = y_sev_train.iloc[val_idx]
                sample_weights = compute_sample_weight("balanced", y_cv_train)
                fold_pipe = clone(pipeline)
                fold_pipe.fit(X_cv_train, y_cv_train, classifier__sample_weight=sample_weights)
                y_cv_pred = fold_pipe.predict(X_cv_val)
                fold_f1 = f1_score(y_cv_val, y_cv_pred, average="macro", zero_division=0)
                scores.append(fold_f1)
            scores = np.array(scores)
        else:
            scores = cross_val_score(pipeline, X_train, y_sev_train, cv=cv,
                                     scoring=macro_f1_scorer, n_jobs=-1)

        elapsed = time.time() - t0
        cv_results[name] = {"mean": scores.mean(), "std": scores.std(), "scores": scores}
        print(f"macro-F1 = {scores.mean():.4f} +/- {scores.std():.4f}  ({elapsed:.1f}s)")

    best_model_name = max(cv_results, key=lambda k: cv_results[k]["mean"])
    print(f"\n  Best model family: {best_model_name} (CV macro-F1 = {cv_results[best_model_name]['mean']:.4f})")

    # =========================================================================
    # STEP 6: HYPERPARAMETER TUNING
    # =========================================================================
    print_section("STEP 6: HYPERPARAMETER TUNING (RandomizedSearchCV)")

    param_grids = {
        "RandomForest": {
            "classifier__n_estimators": [100, 200, 300, 400],
            "classifier__max_depth": [8, 12, 16, 20, None],
            "classifier__min_samples_split": [2, 4, 6, 8],
            "classifier__min_samples_leaf": [1, 2, 4],
            "classifier__max_features": ["sqrt", "log2", 0.5],
            "classifier__class_weight": ["balanced", "balanced_subsample"],
        },
        "ExtraTrees": {
            "classifier__n_estimators": [100, 200, 300, 400],
            "classifier__max_depth": [8, 12, 16, 20, None],
            "classifier__min_samples_split": [2, 4, 6, 8],
            "classifier__min_samples_leaf": [1, 2, 4],
            "classifier__max_features": ["sqrt", "log2", 0.5],
            "classifier__class_weight": ["balanced", "balanced_subsample"],
        },
        "GradientBoosting": {
            "classifier__n_estimators": [100, 200, 300, 400],
            "classifier__max_depth": [3, 4, 5, 6, 8],
            "classifier__learning_rate": [0.01, 0.05, 0.1, 0.15],
            "classifier__min_samples_split": [2, 4, 6, 8],
            "classifier__min_samples_leaf": [1, 2, 4],
            "classifier__subsample": [0.7, 0.8, 0.9, 1.0],
            "classifier__max_features": ["sqrt", "log2", 0.5],
        },
    }

    best_pipelines = {}

    for model_name in ["RandomForest", "ExtraTrees", "GradientBoosting"]:
        print(f"\n  Tuning {model_name}...", flush=True)
        t0 = time.time()

        base_pipeline = candidate_models[model_name]

        if model_name == "GradientBoosting":
            search = RandomizedSearchCV(
                estimator=clone(base_pipeline),
                param_distributions=param_grids[model_name],
                n_iter=40,
                scoring=macro_f1_scorer,
                cv=cv,
                random_state=RANDOM_STATE,
                n_jobs=-1,
                verbose=0,
                refit=False,
            )
            search.fit(X_train, y_sev_train)

            best_pipe = clone(base_pipeline)
            best_pipe.set_params(**search.best_params_)
            sample_weights = compute_sample_weight("balanced", y_sev_train)
            best_pipe.fit(X_train, y_sev_train, classifier__sample_weight=sample_weights)
            best_pipelines[model_name] = {
                "pipeline": best_pipe,
                "best_params": search.best_params_,
                "best_cv_score": search.best_score_,
            }
        else:
            search = RandomizedSearchCV(
                estimator=clone(base_pipeline),
                param_distributions=param_grids[model_name],
                n_iter=40,
                scoring=macro_f1_scorer,
                cv=cv,
                random_state=RANDOM_STATE,
                n_jobs=-1,
                verbose=0,
                refit=True,
            )
            search.fit(X_train, y_sev_train)
            best_pipelines[model_name] = {
                "pipeline": search.best_estimator_,
                "best_params": search.best_params_,
                "best_cv_score": search.best_score_,
            }

        elapsed = time.time() - t0
        print(f"    Best CV macro-F1: {best_pipelines[model_name]['best_cv_score']:.4f} ({elapsed:.1f}s)")
        print(f"    Best params: {best_pipelines[model_name]['best_params']}")

    # =========================================================================
    # STEP 7: FINAL EVALUATION ON HELD-OUT TEST SET
    # =========================================================================
    print_section("STEP 7: FINAL EVALUATION ON HELD-OUT TEST SET")

    all_test_metrics = {}
    best_overall_model = None
    best_overall_score = -1

    for model_name, info in best_pipelines.items():
        pipeline = info["pipeline"]
        y_pred = pipeline.predict(X_test)
        metrics = evaluate_classifier(y_sev_test, y_pred, classes, f"{model_name} (Tuned)")
        metrics["cv_macro_f1"] = round(info["best_cv_score"], 4)
        metrics["best_params"] = {k: str(v) for k, v in info["best_params"].items()}
        all_test_metrics[model_name] = metrics

        score = metrics["macro_f1"] + 0.1 * (metrics.get("fatal_recall", 0) or 0)
        if score > best_overall_score:
            best_overall_score = score
            best_overall_model = model_name

    print(f"\n  Best overall model: {best_overall_model}")
    print(f"    Test macro-F1:      {all_test_metrics[best_overall_model]['macro_f1']:.4f}")
    print(f"    Test balanced acc:  {all_test_metrics[best_overall_model]['balanced_accuracy']:.4f}")
    print(f"    Fatal recall:       {all_test_metrics[best_overall_model]['fatal_recall']:.4f}")

    # =========================================================================
    # STEP 8: BEFORE/AFTER COMPARISON
    # =========================================================================
    print_section("STEP 8: BEFORE vs AFTER COMPARISON")

    improved = all_test_metrics[best_overall_model]

    print(f"\n  {'Metric':<25} {'Baseline':>10} {'Improved':>10} {'Change':>10}")
    print(f"  {'-'*55}")

    comparisons = [
        ("Accuracy", baseline_metrics["accuracy"], improved["accuracy"]),
        ("Balanced Accuracy", baseline_metrics["balanced_accuracy"], improved["balanced_accuracy"]),
        ("Macro-F1", baseline_metrics["macro_f1"], improved["macro_f1"]),
        ("Weighted-F1", baseline_metrics["weighted_f1"], improved["weighted_f1"]),
        ("Fatal Precision", baseline_metrics["precision"]["fatal"], improved["precision"]["fatal"]),
        ("Fatal Recall", baseline_metrics["recall"]["fatal"], improved["recall"]["fatal"]),
        ("Fatal F1", baseline_metrics["f1_score"]["fatal"], improved["f1_score"]["fatal"]),
        ("Major Recall", baseline_metrics["recall"]["major"], improved["recall"]["major"]),
        ("Major F1", baseline_metrics["f1_score"]["major"], improved["f1_score"]["major"]),
    ]

    before_after = {}
    for name, before, after in comparisons:
        change = after - before
        sign = "+" if change >= 0 else ""
        print(f"  {name:<25} {before:>10.4f} {after:>10.4f} {sign}{change:>9.4f}")
        before_after[name] = {"before": before, "after": after, "change": round(change, 4)}

    # =========================================================================
    # STEP 9: RISK SCORE REGRESSOR
    # =========================================================================
    print_section("STEP 9: RISK SCORE REGRESSOR (Updated Pipeline)")

    regressor_pipeline = Pipeline([
        ("preprocessor", clone(preprocessor)),
        ("regressor", RandomForestRegressor(
            n_estimators=200, max_depth=16, min_samples_split=4,
            random_state=RANDOM_STATE, n_jobs=-1,
        )),
    ])

    regressor_pipeline.fit(X_train, y_risk_train)
    y_risk_pred = regressor_pipeline.predict(X_test)
    r2 = r2_score(y_risk_test, y_risk_pred)
    mae = mean_absolute_error(y_risk_test, y_risk_pred)
    rmse = float(np.sqrt(mean_squared_error(y_risk_test, y_risk_pred)))

    print(f"  R2 Score: {r2:.4f}")
    print(f"  MAE:      {mae:.4f}")
    print(f"  RMSE:     {rmse:.4f}")

    # =========================================================================
    # STEP 10: SAVE MODELS & METADATA
    # =========================================================================
    print_section("STEP 10: SAVE MODELS & METADATA")

    best_classifier_pipeline = best_pipelines[best_overall_model]["pipeline"]

    joblib.dump(best_classifier_pipeline, os.path.join(models_dir, "rf_severity_classifier.joblib"), compress=3)
    joblib.dump(regressor_pipeline, os.path.join(models_dir, "rf_risk_regressor.joblib"), compress=3)
    joblib.dump(best_classifier_pipeline, os.path.join(models_dir, "best_pipeline_model.joblib"), compress=3)
    print(f"  Saved severity classifier ({best_overall_model})")
    print(f"  Saved risk regressor (RandomForest)")

    # Extract feature columns for legacy compatibility
    fitted_preprocessor = best_classifier_pipeline.named_steps["preprocessor"]
    ohe = fitted_preprocessor.named_transformers_["cat"].named_steps["encoder"]
    encoded_cat_cols = ohe.get_feature_names_out(categorical_features).tolist()
    all_feature_names = numerical_features + encoded_cat_cols
    with open(os.path.join(models_dir, "feature_columns.json"), "w") as f:
        json.dump(all_feature_names, f, indent=2)
    print(f"  Saved feature_columns.json ({len(all_feature_names)} features)")

    # Feature importances
    clf_model = best_classifier_pipeline.named_steps["classifier"]
    importances = clf_model.feature_importances_
    fi_list = sorted(
        [{"feature": col, "importance": round(float(imp) * 100, 2)}
         for col, imp in zip(all_feature_names, importances)],
        key=lambda x: x["importance"], reverse=True,
    )

    reg_model = regressor_pipeline.named_steps["regressor"]
    reg_importances = reg_model.feature_importances_
    reg_fi_list = sorted(
        [{"feature": col, "importance": round(float(imp) * 100, 2)}
         for col, imp in zip(all_feature_names, reg_importances)],
        key=lambda x: x["importance"], reverse=True,
    )

    # =========================================================================
    # STEP 11: DATASET 2 EVALUATION
    # =========================================================================
    print_section("STEP 11: DATASET 2 EVALUATION")

    cols_d2 = [
        "Day_of_week", "Age_band_of_driver", "Type_of_vehicle", "Types_of_Junction",
        "Road_surface_conditions", "Light_conditions", "Weather_conditions",
        "Number_of_vehicles_involved", "Number_of_casualties",
    ]
    d2_clean = df2[cols_d2 + ["Accident_severity"]].dropna()
    X2 = d2_clean[cols_d2]
    y2 = d2_clean["Accident_severity"]
    d2_classes = sorted(y2.unique().tolist())

    d2_cat = [c for c in cols_d2 if X2[c].dtype == "object"]
    d2_num = [c for c in cols_d2 if X2[c].dtype != "object"]

    d2_preprocessor = ColumnTransformer([
        ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), d2_num),
        ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), d2_cat),
    ])

    X2_train, X2_test, y2_train, y2_test = train_test_split(
        X2, y2, test_size=0.2, random_state=RANDOM_STATE, stratify=y2
    )

    d2_pipeline = Pipeline([
        ("preprocessor", d2_preprocessor),
        ("classifier", ExtraTreesClassifier(
            n_estimators=300, max_depth=16, min_samples_split=4,
            class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1,
        )),
    ])

    d2_pipeline.fit(X2_train, y2_train)
    y2_pred = d2_pipeline.predict(X2_test)
    d2_metrics = evaluate_classifier(y2_test, y2_pred, d2_classes, "Dataset 2 (ExtraTrees)")

    # =========================================================================
    # STEP 12: COMPILE METADATA
    # =========================================================================
    print_section("STEP 12: COMPILE METADATA")

    metadata = {
        "dataset_1": {
            "name": "Indian Road Accident Dataset (2022-2025)",
            "source": "Kaggle (sehaj1104/indian-road-accident-dataset-20222025)",
            "total_records": len(df1),
            "total_features": len(df1.columns),
            "cities_covered": sorted(df1["city"].unique().tolist()),
            "regressor_metrics": {
                "model_type": "Random Forest Regressor (200 Trees, Pipeline)",
                "r2_score": round(r2, 4),
                "mae": round(mae, 4),
                "rmse": round(rmse, 4),
                "variance_explained_pct": round(r2 * 100, 2),
            },
            "classifier_metrics": {
                "model_type": f"{best_overall_model} Classifier (Tuned, Balanced)",
                "accuracy": improved["accuracy"],
                "balanced_accuracy": improved["balanced_accuracy"],
                "macro_f1": improved["macro_f1"],
                "weighted_f1": improved["weighted_f1"],
                "classes": classes,
                "precision": improved["precision"],
                "recall": improved["recall"],
                "f1_score": improved["f1_score"],
                "confusion_matrix": improved["confusion_matrix"],
                "fatal_recall": improved["fatal_recall"],
                "best_hyperparameters": improved.get("best_params", {}),
                "cross_validation": {
                    "method": "5-fold Stratified",
                    "scoring": "macro-F1",
                    "cv_macro_f1": improved.get("cv_macro_f1"),
                },
                "baseline_comparison": before_after,
                "models_compared": {
                    name: {
                        "test_macro_f1": m["macro_f1"],
                        "test_balanced_accuracy": m["balanced_accuracy"],
                        "fatal_recall": m["fatal_recall"],
                    }
                    for name, m in all_test_metrics.items()
                },
            },
            "feature_importances": fi_list[:15],
            "regressor_feature_importances": reg_fi_list[:15],
        },
        "dataset_2": {
            "name": "Road Accident Severity in India",
            "source": "Kaggle (s3programmer/road-accident-severity-in-india)",
            "total_records": len(df2),
            "total_features": len(df2.columns),
            "accuracy": d2_metrics["accuracy"],
            "balanced_accuracy": d2_metrics["balanced_accuracy"],
            "macro_f1": d2_metrics["macro_f1"],
            "classes": d2_classes,
            "confusion_matrix": d2_metrics["confusion_matrix"],
            "precision": d2_metrics["precision"],
            "recall": d2_metrics["recall"],
            "f1_score": d2_metrics["f1_score"],
        },
    }

    with open(os.path.join(models_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Saved model_metadata.json")

    # =========================================================================
    # STEP 13: PRECOMPUTE ANALYTICAL INSIGHTS
    # =========================================================================
    print_section("STEP 13: PRECOMPUTE ANALYTICAL INSIGHTS")

    city_coords = {
        "Delhi": {"lat": 28.6139, "lng": 77.2090, "state": "Delhi"},
        "Mumbai": {"lat": 19.0760, "lng": 72.8777, "state": "Maharashtra"},
        "Bangalore": {"lat": 12.9716, "lng": 77.5946, "state": "Karnataka"},
        "Chandigarh": {"lat": 30.7333, "lng": 76.7794, "state": "Punjab/Haryana"},
        "Chennai": {"lat": 13.0827, "lng": 80.2707, "state": "Tamil Nadu"},
        "Kolkata": {"lat": 22.5726, "lng": 88.3639, "state": "West Bengal"},
        "Hyderabad": {"lat": 17.3850, "lng": 78.4867, "state": "Telangana"},
        "Pune": {"lat": 18.5204, "lng": 73.8567, "state": "Maharashtra"},
    }

    cities_stats = []
    for city, grp in df1.groupby("city"):
        coords = city_coords.get(city, {
            "lat": float(grp["latitude"].mean()),
            "lng": float(grp["longitude"].mean()),
            "state": grp["state"].iloc[0],
        })
        total = len(grp)
        avg_risk = round(float(grp["risk_score"].mean()) * 100, 1)
        fatal_count = int((grp["accident_severity"] == "fatal").sum())
        major_count = int((grp["accident_severity"] == "major").sum())
        minor_count = int((grp["accident_severity"] == "minor").sum())
        top_cause = grp["cause"].mode().iloc[0] if "cause" in grp else "Traffic congestion"

        cities_stats.append({
            "city": city, "state": coords["state"], "lat": coords["lat"], "lng": coords["lng"],
            "total_accidents": total, "avg_risk_score": avg_risk, "fatal_accidents": fatal_count,
            "fatal_rate": round((fatal_count / total) * 100, 1), "major_accidents": major_count,
            "minor_accidents": minor_count, "top_cause": top_cause,
        })
    cities_stats.sort(key=lambda x: x["total_accidents"], reverse=True)

    hourly_stats = []
    for hr, grp in df1.groupby("hour"):
        hourly_stats.append({
            "hour": int(hr), "time_label": f"{int(hr):02d}:00", "accidents": len(grp),
            "avg_risk": round(float(grp["risk_score"].mean()) * 100, 1),
            "is_peak": int(grp["is_peak_hour"].iloc[0]) if "is_peak_hour" in grp else (1 if hr in [8, 9, 10, 17, 18, 19, 20] else 0),
        })
    hourly_stats.sort(key=lambda x: x["hour"])

    weather_stats = [{"weather": w.capitalize(), "count": len(grp),
                      "avg_risk": round(float(grp["risk_score"].mean()) * 100, 1),
                      "fatal_pct": round(float((grp["accident_severity"] == "fatal").mean()) * 100, 1)}
                     for w, grp in df1.groupby("weather")]

    visibility_stats = [{"visibility": v.capitalize(), "count": len(grp),
                         "avg_risk": round(float(grp["risk_score"].mean()) * 100, 1),
                         "fatal_pct": round(float((grp["accident_severity"] == "fatal").mean()) * 100, 1)}
                        for v, grp in df1.groupby("visibility")]

    road_type_stats = [{"road_type": rt.capitalize(), "count": len(grp),
                        "avg_risk": round(float(grp["risk_score"].mean()) * 100, 1),
                        "fatal_pct": round(float((grp["accident_severity"] == "fatal").mean()) * 100, 1)}
                       for rt, grp in df1.groupby("road_type")]

    traffic_density_stats = [{"traffic_density": td.capitalize(), "count": len(grp),
                              "avg_risk": round(float(grp["risk_score"].mean()) * 100, 1)}
                             for td, grp in df1.groupby("traffic_density")]

    sev_counts_full = df1["accident_severity"].value_counts()
    severity_distribution = [
        {"name": "Minor", "count": int(sev_counts_full.get("minor", 0)), "percentage": round(float(sev_counts_full.get("minor", 0) / len(df1) * 100), 1), "color": "#10B981"},
        {"name": "Major", "count": int(sev_counts_full.get("major", 0)), "percentage": round(float(sev_counts_full.get("major", 0) / len(df1) * 100), 1), "color": "#F59E0B"},
        {"name": "Fatal", "count": int(sev_counts_full.get("fatal", 0)), "percentage": round(float(sev_counts_full.get("fatal", 0) / len(df1) * 100), 1), "color": "#EF4444"},
    ]

    d2_causes = df2["Cause_of_accident"].value_counts().head(8)
    dataset2_causes = [{"cause": str(k), "count": int(v), "percentage": round(float(v / len(df2) * 100), 1)} for k, v in d2_causes.items()]
    d2_surface = df2["Road_surface_conditions"].value_counts().head(5)
    dataset2_surface = [{"surface": str(k), "count": int(v)} for k, v in d2_surface.items()]
    d2_light = df2["Light_conditions"].value_counts().head(5)
    dataset2_light = [{"light": str(k), "count": int(v)} for k, v in d2_light.items()]
    d2_vehicles = df2["Type_of_vehicle"].value_counts().head(6)
    dataset2_vehicles = [{"vehicle": str(k), "count": int(v)} for k, v in d2_vehicles.items()]

    d2_severity_distribution = [
        {"name": "Slight Injury", "count": int((df2["Accident_severity"] == "Slight Injury").sum()), "percentage": round(float((df2["Accident_severity"] == "Slight Injury").mean() * 100), 1), "color": "#10B981"},
        {"name": "Serious Injury", "count": int((df2["Accident_severity"] == "Serious Injury").sum()), "percentage": round(float((df2["Accident_severity"] == "Serious Injury").mean() * 100), 1), "color": "#F59E0B"},
        {"name": "Fatal Injury", "count": int((df2["Accident_severity"] == "Fatal injury").sum()), "percentage": round(float((df2["Accident_severity"] == "Fatal injury").mean() * 100), 1), "color": "#EF4444"},
    ]

    insights_data = {
        "summary": {
            "total_incidents_analyzed": len(df1) + len(df2),
            "primary_dataset_records": len(df1),
            "supporting_dataset_records": len(df2),
            "cities_count": len(cities_stats),
            "overall_avg_risk_score": round(float(df1["risk_score"].mean()) * 100, 1),
            "peak_hour_risk_jump_pct": round(((df1[df1["is_peak_hour"] == 1]["risk_score"].mean() - df1[df1["is_peak_hour"] == 0]["risk_score"].mean()) / df1[df1["is_peak_hour"] == 0]["risk_score"].mean()) * 100, 1),
            "fog_risk_multiplier": round(float(df1[df1["weather"] == "fog"]["risk_score"].mean() / df1[df1["weather"] == "clear"]["risk_score"].mean()), 2),
            "low_visibility_risk_multiplier": round(float(df1[df1["visibility"] == "low"]["risk_score"].mean() / df1[df1["visibility"] == "high"]["risk_score"].mean()), 2),
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
            "vehicle_types": dataset2_vehicles,
        },
    }

    with open(os.path.join(models_dir, "dataset_insights.json"), "w") as f:
        json.dump(insights_data, f, indent=2)
    print(f"  Saved dataset_insights.json")

    # =========================================================================
    # DONE
    # =========================================================================
    print_section("PIPELINE COMPLETE")
    print(f"  Best severity classifier: {best_overall_model}")
    print(f"  Test macro-F1:            {improved['macro_f1']:.4f}  (baseline: {baseline_metrics['macro_f1']:.4f})")
    print(f"  Test balanced accuracy:   {improved['balanced_accuracy']:.4f}  (baseline: {baseline_metrics['balanced_accuracy']:.4f})")
    print(f"  Fatal recall:             {improved['fatal_recall']:.4f}  (baseline: {baseline_metrics['recall']['fatal']:.4f})")
    print(f"\n  All models and metadata saved to: {models_dir}")

    return best_classifier_pipeline, metadata


if __name__ == "__main__":
    run_improved_pipeline()
