from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.weather import get_weather_data
from services.risk_model import calculate_risk

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

    weather = get_weather_data(location)

    result = calculate_risk(weather, crop)

    return result