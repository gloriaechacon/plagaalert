from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.weather import get_weather_data
from services.risk_model import calculate_risk
from services.llm import generate_ai_insight

app = FastAPI()


class PredictionRequest(BaseModel):
    crop: str
    explanation_style: Optional[Literal["simple", "technical"]] = "simple"
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    # Vite may use another port if 5173 is taken; still same-machine dev traffic.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Agro Risk API running"}


@app.post("/predict")
@app.post("/api/predict")
def predict(data: PredictionRequest):
    crop = data.crop
    style = data.explanation_style or "simple"

    has_coords = data.latitude is not None and data.longitude is not None
    has_text_location = bool(data.location and data.location.strip())

    if not crop:
        raise HTTPException(status_code=400, detail="crop is required")

    if not has_coords and not has_text_location:
        raise HTTPException(
            status_code=400,
            detail="Either latitude/longitude or location is required",
        )

    weather = get_weather_data(
        location=data.location.strip() if has_text_location else None,
        latitude=data.latitude,
        longitude=data.longitude,
    )

    if not weather:
        raise HTTPException(
            status_code=404,
            detail="Could not fetch weather data for that location",
        )

    result = calculate_risk(weather, crop)

    ai_text = generate_ai_insight(result, style)

    if ai_text:
        result["ai_insight"] = ai_text

    return result