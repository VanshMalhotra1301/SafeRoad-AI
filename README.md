# SafeRoad AI: Predictive Road Accident Risk Modeling & Severity Assessment

SafeRoad AI is an end-to-end Machine Learning and Intelligent Transportation System (ITS) platform designed to proactively forecast real-time Road Accident Risk Scores (0.00 to 1.00) and assess accident severity under dynamic road, environmental, geometric, and traffic conditions.

---

## 🌟 Key Features

- **Real-Time Risk Prediction**: Predicts continuous accident risk scores based on weather conditions, road geometry, speed limits, surface conditions, and temporal indicators.
- **Accident Severity Classification**: Classifies predicted incident severity (Slight, Serious, Fatal) to help civic and emergency teams prioritize response protocols.
- **Interactive Geospatial Dashboard**: Interactive Leaflet maps visualizing high-risk corridors, accident blackspots, and city-level risk heatmaps.
- **Explainable AI Analytics**: Visual breakdown of top risk drivers and model feature importances (e.g., precipitation, lighting, traffic volume, speed limit).
- **FastAPI Backend**: Asynchronous REST API delivering low-latency inference, dataset insights, and geospatial risk queries.
- **Modern Vite + React Frontend**: Responsive dashboard built with Tailwind CSS, Lucide icons, Leaflet, and Recharts.

---

## 🏗️ Architecture & Tech Stack

### Machine Learning
- **Algorithm**: Random Forest Regressor ($R^2 = 0.8861$, $\text{MAE} = 0.0525$, $\text{RMSE} = 0.0728$) and Random Forest Severity Classifier
- **Libraries**: scikit-learn, pandas, numpy, joblib
- **Dataset**: Indian Road Accident Dataset across major metropolitan clusters

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **Validation**: Pydantic v2

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
│   ├── main.py                 # FastAPI backend application & API routes
│   ├── requirements.txt        # Python backend dependencies
│   ├── train_models.py         # Complete multi-model training script
│   └── train_simple_pipeline.py# Standard 8-stage scikit-learn pipeline
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/                    # React dashboard source code
│   ├── index.html              # Frontend entrypoint
│   ├── package.json            # Node.js dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind CSS configuration
├── ML_LIFECYCLE_GUIDE.md       # Detailed ML lifecycle documentation & viva notes
├── PHASE_1_REPORT.docx         # Project Phase-1 academic report
├── PHASE_1_REPORT.txt          # Plaintext format of Phase-1 report
├── generate_phase1_doc.py      # Python script to generate the Phase-1 Word report
└── README.md                   # Project overview & documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher & npm

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend dashboard will be available at [http://localhost:5173](http://localhost:5173).

---

## 📊 Model Training

To retrain the Random Forest models from the dataset:

```bash
cd backend
python train_models.py
```

Or run the simplified 8-stage training pipeline:

```bash
cd backend
python train_simple_pipeline.py
```

---

## 👥 Contributors

- **Bennett University** — Department of Computer Science & Engineering
