def clamp(value, min_value=0, max_value=100):
    return max(min_value, min(max_value, value))


def avg(values):
    return sum(values) / len(values) if values else 0


def count_days_above(values, threshold):
    return sum(1 for v in values if v > threshold)


def crop_profile(crop: str):
    crop = (crop or "").lower()

    profiles = {
        "maize": {
            "heat_weight": 0.45,
            "fungal_weight": 0.30,
            "moisture_weight": 0.25,
            "heat_temp_threshold": 30,
            "warm_night_threshold": 20,
            "fungal_temp_min": 20,
            "fungal_temp_max": 30,
        },
        "soybean": {
            "heat_weight": 0.30,
            "fungal_weight": 0.40,
            "moisture_weight": 0.30,
            "heat_temp_threshold": 29,
            "warm_night_threshold": 19,
            "fungal_temp_min": 18,
            "fungal_temp_max": 29,
        },
    }

    return profiles.get(crop, profiles["maize"])


# -------------------------
# Membership functions
# -------------------------

def triangular(x, a, b, c):
    if x <= a or x >= c:
        return 0.0
    if x == b:
        return 1.0
    if x < b:
        return (x - a) / (b - a) if b != a else 0.0
    return (c - x) / (c - b) if c != b else 0.0


def trapezoidal(x, a, b, c, d):
    if x <= a or x >= d:
        return 0.0
    if b <= x <= c:
        return 1.0
    if a < x < b:
        return (x - a) / (b - a) if b != a else 0.0
    return (d - x) / (d - c) if d != c else 0.0


def humidity_memberships(h):
    return {
        "low": trapezoidal(h, 0, 0, 45, 60),
        "medium": triangular(h, 50, 67, 82),
        "high": trapezoidal(h, 75, 85, 100, 100),
    }


def rainfall_memberships(r):
    return {
        "low": trapezoidal(r, 0, 0, 1, 4),
        "medium": triangular(r, 2, 8, 14),
        "high": trapezoidal(r, 10, 15, 40, 40),
    }


def heat_memberships(tmax, threshold):
    return {
        "low": trapezoidal(tmax, 0, 0, threshold - 6, threshold - 2),
        "medium": triangular(tmax, threshold - 3, threshold, threshold + 3),
        "high": trapezoidal(tmax, threshold + 1, threshold + 4, 50, 50),
    }


def warm_night_memberships(tmin, threshold):
    return {
        "low": trapezoidal(tmin, 0, 0, threshold - 5, threshold - 2),
        "medium": triangular(tmin, threshold - 3, threshold, threshold + 2),
        "high": trapezoidal(tmin, threshold, threshold + 3, 35, 35),
    }


def fungal_temp_memberships(tmax, tmin_opt, tmax_opt):
    center = (tmin_opt + tmax_opt) / 2
    return {
        "poor": trapezoidal(tmax, 0, 0, tmin_opt - 4, tmin_opt - 1),
        "good": triangular(tmax, tmin_opt, center, tmax_opt),
        "very_good": trapezoidal(tmax, tmin_opt + 1, center, tmax_opt - 1, tmax_opt + 2),
    }


# -------------------------
# Fuzzy inference
# -------------------------

def defuzzify(levels):
    # levels = {"low": m1, "medium": m2, "high": m3}
    # representative values
    crisp = (
        levels["low"] * 25 +
        levels["medium"] * 55 +
        levels["high"] * 85
    )
    total = levels["low"] + levels["medium"] + levels["high"]
    return round(crisp / total, 1) if total > 0 else 0.0


def fuzzy_heat_stress(tmax, tmin, profile):
    heat = heat_memberships(tmax, profile["heat_temp_threshold"])
    night = warm_night_memberships(tmin, profile["warm_night_threshold"])

    low = max(
        min(heat["low"], night["low"]),
        min(heat["low"], night["medium"]),
    )
    medium = max(
        min(heat["medium"], night["low"]),
        min(heat["medium"], night["medium"]),
        min(heat["low"], night["high"]),
    )
    high = max(
        heat["high"],
        min(heat["medium"], night["high"]),
        min(heat["high"], night["medium"]),
        min(heat["high"], night["high"]),
    )

    return defuzzify({"low": low, "medium": medium, "high": high})


def fuzzy_fungal_pressure(tmax, humidity, rainfall, profile):
    hum = humidity_memberships(humidity)
    rain = rainfall_memberships(rainfall)
    temp = fungal_temp_memberships(
        tmax,
        profile["fungal_temp_min"],
        profile["fungal_temp_max"],
    )

    low = max(
        min(hum["low"], rain["low"]),
        min(temp["poor"], hum["medium"]),
    )

    medium = max(
        min(hum["medium"], rain["medium"]),
        min(temp["good"], hum["medium"]),
        min(temp["good"], rain["low"]),
        min(hum["high"], rain["low"]),
    )

    high = max(
        min(hum["high"], rain["medium"]),
        min(hum["high"], rain["high"]),
        min(temp["very_good"], hum["high"]),
        min(temp["good"], hum["high"], rain["medium"]),
        min(temp["very_good"], rain["high"]),
    )

    return defuzzify({"low": low, "medium": medium, "high": high})


def fuzzy_moisture_pressure(rainfall, humidity):
    hum = humidity_memberships(humidity)
    rain = rainfall_memberships(rainfall)

    low = max(
        min(rain["low"], hum["low"]),
        min(rain["low"], hum["medium"]),
    )

    medium = max(
        min(rain["medium"], hum["low"]),
        min(rain["medium"], hum["medium"]),
        min(rain["low"], hum["high"]),
    )

    high = max(
        rain["high"],
        min(rain["medium"], hum["high"]),
        min(rain["high"], hum["medium"]),
        min(rain["high"], hum["high"]),
    )

    return defuzzify({"low": low, "medium": medium, "high": high})


def build_recommendations(total_risk, dominant_driver, crop):
    if dominant_driver == "heat stress":
        recs = [
            "Inspect field signs of heat stress in the next 24–48 hours.",
            "Prioritize irrigation planning if water is available.",
            "Monitor leaf rolling and afternoon canopy stress closely.",
        ]
    elif dominant_driver == "fungal pressure":
        recs = [
            "Inspect lower canopy and leaf surfaces for early fungal symptoms.",
            "Increase field scouting frequency over the next 48 hours.",
            "Evaluate preventive action if humidity and rainfall remain elevated.",
        ]
    else:
        recs = [
            "Inspect drainage-sensitive areas after rainfall events.",
            "Monitor standing moisture and wet soil persistence.",
            "Watch for compounding stress in low-lying zones.",
        ]

    if crop == "maize":
        recs[0] = "Inspect maize leaves and upper canopy for early stress indicators within 24–48 hours."
    elif crop == "soybean":
        recs[0] = "Inspect soybean canopy and leaf surfaces for early stress indicators within 24–48 hours."

    return recs[:3]


def risk_level_from_score(score):
    if score >= 75:
        return "HIGH RISK"
    if score >= 45:
        return "MEDIUM RISK"
    return "LOW RISK"


def confidence_from_data(days_available):
    if days_available >= 7:
        return 0.86
    if days_available >= 5:
        return 0.80
    return 0.72


def calculate_risk(weather, crop):
    profile = crop_profile(crop)

    tmax = weather["temperature_max"][:7]
    tmin = weather["temperature_min"][:7]
    rainfall = weather["precipitation"][:7]
    humidity_hourly = weather["humidity"][:24]

    humidity_proxy = round(avg(humidity_hourly), 1)
    days = min(len(tmax), len(tmin), len(rainfall), 7)

    daily_scores = []
    heat_scores = []
    fungal_scores = []
    moisture_scores = []

    for i in range(days):
        heat = fuzzy_heat_stress(tmax[i], tmin[i], profile)
        fungal = fuzzy_fungal_pressure(tmax[i], humidity_proxy, rainfall[i], profile)
        moisture = fuzzy_moisture_pressure(rainfall[i], humidity_proxy)

        combined = (
            heat * profile["heat_weight"] +
            fungal * profile["fungal_weight"] +
            moisture * profile["moisture_weight"]
        )

        daily_total = round(clamp(combined), 1)

        daily_scores.append(daily_total)
        heat_scores.append(round(heat, 1))
        fungal_scores.append(round(fungal, 1))
        moisture_scores.append(round(moisture, 1))

    avg_heat = round(avg(heat_scores), 1)
    avg_fungal = round(avg(fungal_scores), 1)
    avg_moisture = round(avg(moisture_scores), 1)
    total_risk = round(avg(daily_scores), 1)

    hot_days = count_days_above(tmax[:days], profile["heat_temp_threshold"])
    wet_days = count_days_above(rainfall[:days], 5)
    warm_nights = count_days_above(tmin[:days], profile["warm_night_threshold"])

    # persistence boost
    if hot_days >= 3:
        total_risk += 5
    if wet_days >= 2:
        total_risk += 5
    if warm_nights >= 3:
        total_risk += 4

    total_risk = round(clamp(total_risk), 1)
    level = risk_level_from_score(total_risk)

    drivers = {
        "heat stress": avg_heat,
        "fungal pressure": avg_fungal,
        "moisture pressure": avg_moisture,
    }
    dominant_driver = max(drivers, key=drivers.get)

    if total_risk >= 75:
        trend = "Risk is elevated and likely to remain high over the next few days"
    elif daily_scores and daily_scores[-1] > daily_scores[0]:
        trend = "Risk is gradually increasing over the short-term forecast"
    elif daily_scores and daily_scores[-1] < daily_scores[0]:
        trend = "Risk may ease slightly if conditions continue improving"
    else:
        trend = "Risk is relatively stable in the short-term forecast"

    if dominant_driver == "heat stress":
        main_cause = "sustained high daytime temperature and warm night conditions"
    elif dominant_driver == "fungal pressure":
        main_cause = "high humidity combined with rainfall and disease-favorable temperatures"
    else:
        main_cause = "persistent moisture conditions driven by rainfall and elevated humidity"

    impact = (
        "Potential yield loss could become significant without timely intervention."
        if total_risk >= 75
        else "Moderate yield impact is possible if current conditions persist."
        if total_risk >= 45
        else "Short-term impact appears limited, but monitoring is still recommended."
    )

    recommendations = build_recommendations(total_risk, dominant_driver, crop)

    forecast = []
    for i in range(days):
        forecast.append({
            "day": f"day_{i+1}",
            "risk": round(daily_scores[i], 1),
            "heat_stress": round(heat_scores[i], 1),
            "fungal_pressure": round(fungal_scores[i], 1),
            "moisture_pressure": round(moisture_scores[i], 1),
        })

    return {
        "location": weather["location"],
        "crop": crop,
        "risk": total_risk,
        "risk_level": level,
        "trend": trend,
        "factors": {
            "temperature": round(avg(tmax[:3]), 1),
            "humidity": humidity_proxy,
            "rainfall": round(sum(rainfall[:3]), 1),
            "avg_max_temp_7d": round(avg(tmax[:days]), 1),
            "avg_min_temp_7d": round(avg(tmin[:days]), 1),
            "hot_days_7d": hot_days,
            "wet_days_7d": wet_days,
            "warm_nights_7d": warm_nights,
            "heat_stress_score": avg_heat,
            "fungal_pressure_score": avg_fungal,
            "moisture_pressure_score": avg_moisture,
        },
        "main_cause": main_cause,
        "recommendations": recommendations,
        "impact": impact,
        "confidence": confidence_from_data(days),
        "forecast": forecast,
        "model_type": "fuzzy_logic_weighted_environmental_risk",
    }