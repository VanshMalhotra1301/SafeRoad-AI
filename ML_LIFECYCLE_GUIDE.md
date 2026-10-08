# SafeRoad AI — Machine Learning Lifecycle & Training Guide
> **Comprehensive study notes and code explanation for project presentation, viva, and technical review.**

---

## 1. Executive Summary

- **Objective**: Predict a continuous **Road Accident Risk Score ($0.0 \text{ to } 1.0$)** under varying road, weather, geometric, and traffic conditions.
- **Dataset**: Indian Road Accident Dataset (2022–2025) with **20,000 incident records** across 8 metropolitan cities.
- **Algorithm**: **Random Forest Regressor** with hyperparameter tuning via **GridSearchCV** and 3-Fold Cross-Validation.
- **Final Model Performance**:
  - **$R^2$ Score**: `0.8861` (Explains **88.61%** of variance in risk on unseen test data)
  - **Mean Absolute Error (MAE)**: `0.0525` (Predictions are within $\approx 5\%$ of actual risk)
  - **Root Mean Squared Error (RMSE)**: `0.0728`
  - **Best Parameters**: `n_estimators=100`, `max_depth=10`, `min_samples_split=5`

---

## 2. The 8-Stage Machine Learning Lifecycle in `train_simple_pipeline.py`

```
Raw CSV Data
    │
    ▼
[1] Ingestion & Inspection (Inspect rows, cols, distributions)
    │
    ▼
[2] Cleaning & Isolation (Remove duplicates, isolate features & target)
    │
    ▼
[3] Train/Test Split (80% Train, 20% Test — Prevents Data Leakage)
    │
    ▼
[4] Pipelines & Normalization (StandardScaler for Numbers, OneHot for Categories)
    │
    ▼
[5] Hyperparameter Tuning (GridSearchCV with 3-Fold Cross-Validation)
    │
    ▼
[6] Holdout Evaluation (Evaluate on unseen test set: R², MAE, RMSE)
    │
    ▼
[7] Feature Importance Extraction (Identify top risk drivers)
    │
    ▼
[8] Serialization & Export (Save complete pipeline as .joblib)
```

---

## 3. Step-by-Step Code Explanation

### Step 1: Data Ingestion & Inspection
```python
df = pd.read_csv(dataset_path)
```
- **What it does**: Reads the raw CSV containing 20,000 rows and 24 columns.
- **Why it matters**: First step in any ML pipeline; verifies file integrity, schema, and record counts.

---

### Step 2: Data Cleaning & Target Isolation
```python
# 1. Remove duplicate rows if present
df = df.drop_duplicates()

# 2. Drop rows where the target variable is null
df = df.dropna(subset=['risk_score'])

# 3. Separate features into numerical and categorical subsets
categorical_features = ['city', 'road_type', 'weather', 'visibility', 'traffic_density']
numerical_features = ['lanes', 'traffic_signal', 'temperature', 'hour', 'is_weekend', 'is_peak_hour']
```
- **Why exclude identifiers like `accident_id`?** IDs have zero predictive generalized value and cause artificial memorization.
- **Why exclude `accident_severity` or `casualties`?** These are post-accident outcomes. Using post-accident outcomes to predict pre-accident risk would cause **Target Leakage**.

---

### Step 3: Train / Test Split (Preventing Data Leakage)
```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
```
- **Why split before scaling/encoding?**
  - **Golden Rule of ML**: The test set must simulate the real world (unseen data).
  - If we scale or calculate mean/standard deviation on the entire dataset before splitting, information from the test set leaks into the training set (**Data Leakage**), creating overly optimistic, invalid evaluation metrics.
- `random_state=42` guarantees exact reproducibility every time the code runs.

---

### Step 4: Preprocessing Pipelines & Normalization
```python
# Numerical pipeline: Median Imputation + Z-score Standardization
numerical_pipeline = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

# Categorical pipeline: Frequent Imputation + One-Hot Encoding
categorical_pipeline = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

# Combine into a unified ColumnTransformer
preprocessor = ColumnTransformer(transformers=[
    ('num', numerical_pipeline, numerical_features),
    ('cat', categorical_pipeline, categorical_features)
])
```
- **StandardScaler**: Scales numeric features so mean $\mu = 0$ and variance $\sigma = 1$ ($z = \frac{x - \mu}{\sigma}$). This prevents features with large numeric ranges (e.g., temperature $15-45^\circ\text{C}$) from overpowering features with small ranges (e.g., lanes $1-6$).
- **OneHotEncoder**: Converts text categories (e.g., `weather: [clear, rain, fog]`) into independent binary $0/1$ indicator columns (`weather_clear`, `weather_rain`, `weather_fog`).
- `handle_unknown='ignore'`: If an unseen city or category appears during production inference, it assigns $0$ instead of crashing.

---

### Step 5: Hyperparameter Tuning via GridSearchCV
```python
full_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', RandomForestRegressor(random_state=42))
])

param_grid = {
    'model__n_estimators': [50, 100],     # Number of decision trees
    'model__max_depth': [10, 16],          # Maximum depth per tree
    'model__min_samples_split': [2, 5]     # Min samples to branch a node
}

grid_search = GridSearchCV(
    estimator=full_pipeline,
    param_grid=param_grid,
    cv=3,                                  # 3-Fold Cross-Validation
    scoring='r2',
    n_jobs=-1
)
grid_search.fit(X_train, y_train)
```
- **What is K-Fold Cross-Validation?** The training data (16,000 samples) is split into 3 folds. The model trains on 2 folds and validates on the remaining fold, rotating 3 times.
- **Why tune hyperparameters?**
  - If a tree is too deep (`max_depth` infinite), it memorizes noise (**Overfitting**).
  - If a tree is too shallow (`max_depth = 2`), it fails to capture interactions (**Underfitting**).
  - GridSearchCV found that `max_depth: 10`, `min_samples_split: 5`, and `n_estimators: 100` yielded the highest generalized score ($R^2 = 0.8874$).

---

### Step 6: Holdout Test Set Evaluation
```python
y_pred = best_pipeline.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
```
- **$R^2$ Score ($0.8861$)**: Tells us that **88.61%** of the variance in road accident risk is explained by the combination of our road, weather, geometric, and traffic variables.
- **MAE ($0.0525$)**: On a scale from $0.0$ to $1.0$ ($0\%$ to $100\%$), the model's prediction is, on average, only **$5.25\%$** off from the actual recorded risk score.
- **RMSE ($0.0728$)**: Penalizes large outlier mistakes. Since RMSE is very close to MAE, large erroneous predictions are rare.

---

### Step 7: Feature Importance Extraction
```python
importances = best_pipeline.named_steps['model'].feature_importances_
```
- **How it works**: Uses Mean Decrease in Impurity (Gini importance) across all 100 decision trees.
- **Empirical Findings from the Dataset**:
  1. `visibility_low (<200m)` : **52.64%**
  2. `traffic_density_high` : **30.22%**
  3. `is_peak_hour` : **8.60%**
  4. `visibility_medium` : **2.68%**
  5. `weather_rain` : **2.68%**
- **Takeaway**: Low visibility and heavy traffic density drive over **82%** of predictive risk on Indian corridors.

---

### Step 8: Model Export & Pipeline Serialization
```python
joblib.dump(best_pipeline, "backend/models/best_pipeline_model.joblib")
```
- **Why save the entire pipeline?**
  - Saving just the Random Forest weights would require manually replicating the exact scalers, encoders, and feature column orders in production.
  - By serializing the **unified pipeline** (`ColumnTransformer` + `RandomForestRegressor`), production inference accepts raw input dictionaries directly and executes all normalization and predictions in a single call.

---

## 4. How to Run the Pipeline

Run the script from your terminal:
```powershell
python backend/train_simple_pipeline.py
```

### Expected Terminal Output:
```text
======================================================================
[STEP 1] DATA INGESTION & INSPECTION
======================================================================
[+] Dataset loaded successfully.
  - Total records (rows): 20,000
  - Total features (cols): 24
...
======================================================================
[STEP 5] HYPERPARAMETER TUNING VIA GRIDSEARCHCV
======================================================================
Fitting 3 folds for each of 8 candidates, totalling 24 fits
[+] Hyperparameter tuning complete!
  - Best Hyperparameters: {'model__max_depth': 10, 'model__min_samples_split': 5, 'model__n_estimators': 100}
  - Best Cross-Validation R2: 0.8874

======================================================================
[STEP 6] HOLDOUT TEST SET EVALUATION
======================================================================
[+] FINAL TEST METRICS (Holdout 4,000 samples):
  * R2 Score (Coefficient of Determination) : 0.8861 (88.61% variance explained)
  * Mean Absolute Error (MAE)               : 0.0525
  * Root Mean Squared Error (RMSE)          : 0.0728
...
[SUCCESS] ML PIPELINE EXECUTION COMPLETED SUCCESSFULLY!
```

---

## 5. Quick Viva / Presentation Q&A

**Q: Why use Random Forest instead of a simple Linear Regression?**
> *A: Road accident risk is non-linear and involves complex feature interactions (e.g., fog at night during peak hour is exponentially more hazardous than fog during empty afternoon roads). Random Forest naturally captures multi-variable interactions without manual polynomial expansion.*

**Q: Why use a Pipeline with ColumnTransformer?**
> *A: It guarantees zero data leakage by ensuring preprocessing parameters (means, standard deviations, one-hot categories) are learned strictly on training splits and applied consistently during testing and production serving.*

**Q: What does an $R^2$ of 0.8861 signify?**
> *A: An $R^2$ of 1.0 is a perfect prediction, while 0.0 is equivalent to predicting the mean value. An $R^2$ of 0.8861 means the model successfully accounts for 88.6% of the variance in the target variable on completely unseen records.*
wha