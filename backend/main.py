from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.weather import get_weather_data
from services.risk_model import calculate_risk

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Agro Risk API running"}

@app.post("/predict")
def predict(data: dict):
    location = data.get("location")
    crop = data.get("crop")

    if not location or not crop:
        raise HTTPException(status_code=400, detail="location and crop are required")

    weather = get_weather_data(location)

    if not weather:
        raise HTTPException(status_code=404, detail="Could not fetch weather data for that location")

    result = calculate_risk(weather, crop)
    return result