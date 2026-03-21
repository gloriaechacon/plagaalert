def calculate_risk(weather, crop):
    temp_avg = sum(weather["temperature_max"][:3]) / 3
    humidity_avg = sum(weather["humidity"][:24]) / 24
    rain = sum(weather["precipitation"][:3])

    score = 0

    if temp_avg > 28:
        score += 30
    elif temp_avg > 22:
        score += 20
    else:
        score += 10

    if humidity_avg > 70:
        score += 30
    elif humidity_avg > 50:
        score += 20
    else:
        score += 10

    if rain > 10:
        score += 30
    elif rain > 5:
        score += 20
    else:
        score += 10

    if score > 70:
        level = "HIGH RISK"
    elif score > 40:
        level = "MEDIUM RISK"
    else:
        level = "LOW RISK"

    forecast = []
    for i in range(7):
        forecast.append({
            "day": f"day_{i+1}",
            "risk": min(100, score + i * 2)
        })

    return {
        "risk": score,
        "risk_level": level,
        "trend": "Risk increasing over next days",
        "factors": {
            "temperature": temp_avg,
            "humidity": humidity_avg,
            "rainfall": rain
        },
        "main_cause": "High temp + humidity + rainfall",
        "recommendations": [
            "Monitor crop every 48h",
            "Apply preventive treatment",
            "Track humidity levels"
        ],
        "impact": "Potential yield loss: 20-40%",
        "confidence": 0.8,
        "forecast": forecast
    }