# SafeRoad AI: Predictive Road Accident Risk Modeling & Severity Assessment

SafeRoad AI is an end-to-end Machine Learning and Intelligent Transportation System (ITS) platform designed to proactively forecast real-time Road Accident Risk Scores (0.00 to 1.00) and assess accident severity (Minor, Major, Fatal) under dynamic road, environmental, geometric, and traffic conditions.

---

## 🌟 Key Features

- **Real-Time Risk Prediction**: Predicts continuous accident risk scores based on weather conditions, road geometry, speed limits, surface conditions, and temporal indicators ($R^2 = 0.8811$).
- **Class-Aware Accident Severity Classification**: Classifies incident severity (`Minor`, `Major`, `Fatal`) using a tuned, class-weighted ensemble with **nearly 6x higher fatal-class recall (17.59% vs 3.02% baseline)** to prioritize emergency and civic response.
- **Leakage-Free ML Architecture**: Strictly separates operational pre-accident features from post-accident outcome indicators, with preprocessing and encoding encapsulated in scikit-learn `Pipeline` + `ColumnTransformer`.
- **Interactive Geospatial Dashboard**: Interactive Leaflet maps visualizing high-risk corridors, accident blackspots, and city-level risk heatmaps.
- **Explainable AI Analytics**: Visual breakdown of top risk drivers, ensemble prediction variance/confidence, and model feature importances.
- **FastAPI Backend**: Asynchronous REST API delivering low-latency inference, dataset insights, and geospatial risk queries.
- **Modern Vite + React Frontend**: Responsive dashboard built with Tailwind CSS, Lucide icons, Leaflet, and Recharts.

---

## 📊 ML Pipeline & Performance Improvements

The machine learning pipeline was rigorously audited and upgraded with **5-Fold Stratified Cross-Validation**, multi-model benchmarking (**Random Forest vs. Extra Trees vs. Gradient Boosting**), and hyperparameter tuning targeting **Macro-F1** and **Fatal-Class Recall**:

### Held-Out Test Set Performance (4,000 Unseen Samples)

| Metric | Baseline (Pre-Audit) | Optimized (Tuned Pipeline) | Delta | Impact |
| :--- | :---: | :---: | :---: | :--- |
| **Fatal Recall** | **3.02%** (18/597) | **17.59%** (105/597) | **+14.57%** | :white_check_mark: **+482% relative surge** |
| **Fatal Precision** | 9.00% | 12.47% | +3.47% | :white_check_mark: Higher fatal detection reliability |
| **Fatal F1-Score** | 0.0452 | 0.1459 | **+0.1007** | :white_check_mark: **+223% relative improvement** |
| **Major Recall** | 18.78% (225/1198) | 30.63% (367/1198) | **+11.85%** | :white_check_mark: Significant reduction in missed serious crashes |
| **Major F1-Score** | 0.2296 | 0.2983 | +0.0687 | :white_check_mark: Balanced sensitivity to severe crashes |
| **Macro-F1** | 0.3020 | 0.3183 | +0.0163 | :white_check_mark: Improved average class utility |
| **Risk Regressor $R^2$** | 0.8805 | 0.8811 | +0.0006 | Maintained high variance explanation ($88.11\%$) |
| **Risk Regressor MAE** | 0.0560 | 0.0556 | -0.0004 | Lower mean absolute error |

### Model Benchmark Summary (5-Fold Stratified CV on Training Set)

| Model Family | CV Macro-F1 | Fit Time | Tuned CV Macro-F1 | Test Macro-F1 | Test Fatal Recall |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (Selected)** | 0.3092 ± 0.0046 | 6.3s | **0.3334** | **0.3183** | **17.59%** :trophy: |
| **Extra Trees** | **0.3299 ± 0.0047** | 4.5s | 0.3330 | 0.3159 | 11.39% |
| **Gradient Boosting** | 0.3288 ± 0.0089 | 66.5s | 0.3230 | 0.3206 | 10.22% |

---

## 🏗️ Architecture & Tech Stack

### Machine Learning
- **Regressor**: Random Forest Regressor ($R^2 = 0.8811$, $\text{MAE} = 0.0556$, $\text{RMSE} = 0.0756$)
- **Classifier**: Tuned Balanced Random Forest Classifier (Optimized for Macro-F1 and Fatal Recall)
- **Pipelines**: scikit-learn `Pipeline`, `ColumnTransformer`, `StandardScaler`, `OneHotEncoder`, `SimpleImputer`
- **Validation**: 5-Fold Stratified Cross-Validation + untouched 20% holdout test set

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **Persistence**: Joblib, JSON metadata

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Visualization**: React-Leaflet, Recharts, Lucide React

---

## 📁 Repository Structure

```
├── backend/
│   ├── data/                   # Indian road incident datasets (CSV)
│   ├── models/                 # Pretrained joblib pipelines, metadata & insights
│   │   ├── rf_risk_regressor.joblib       # Trained Risk Regressor Pipeline
│   │   ├── rf_severity_classifier.joblib  # Tuned Severity Classifier Pipeline
│   │   ├── model_metadata.json            # Full metrics, confusion matrix & CV stats
│   │   └── dataset_insights.json          # Precomputed geospatial & hourly stats
│   ├── main.py                 # FastAPI backend application & API routes
│   ├── requirements.txt        # Python backend dependencies
│   ├── train_models.py         # Complete multi-model training & tuning pipeline
│   └── train_simple_pipeline.py# Standard scikit-learn regressor pipeline
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/                    # React dashboard source code
│   ├── index.html              # Frontend entrypoint
│   ├── package.json            # Node.js dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind CSS configuration
├── FINAL_REPORT.docx           # Project Final Phase-2 academic report
├── generate_final_report.py    # Generator script for Phase-2 Word report
├── PHASE_1_REPORT.docx         # Project Phase-1 academic report
├── ML_LIFECYCLE_GUIDE.md       # Detailed ML lifecycle documentation & viva notes
└── README.md                   # Project overview & documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher & npm

---

### 1. Run the Backend (FastAPI)

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows: .\venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

- API Server: [http://localhost:8000](http://localhost:8000)
- Swagger Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Run the Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Frontend Dashboard: [http://localhost:5173](http://localhost:5173)

---

## 📊 Model Retraining

To execute the complete multi-model cross-validation, tuning, and evaluation suite:

```bash
cd backend
python train_models.py
```

This runs:
1. Data leakage audit and stratified 80/20 train/test split
2. Baseline model evaluation
3. 5-Fold Stratified CV across Random Forest, Extra Trees, and Gradient Boosting
4. `RandomizedSearchCV` hyperparameter optimization
5. Unseen holdout test evaluation (confusion matrix, precision/recall/F1 per class)
6. Model serialization (`rf_severity_classifier.joblib`, `rf_risk_regressor.joblib`)
7. Analytical insights and metadata compilation

---

## 👥 Contributors

- **Bennett University** — Department of Computer Science & Engineering
