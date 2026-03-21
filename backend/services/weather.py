import requests

def get_weather_data(location: str):

    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"
    geo_res = requests.get(geo_url).json()

    if "results" not in geo_res:
        return None

    lat = geo_res["results"][0]["latitude"]
    lon = geo_res["results"][0]["longitude"]


    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&hourly=relative_humidity_2m"
        f"&timezone=auto"
    )

    weather_res = requests.get(weather_url).json()

    return {
        "latitude": lat,
        "longitude": lon,
        "temperature_max": weather_res["daily"]["temperature_2m_max"],
        "temperature_min": weather_res["daily"]["temperature_2m_min"],
        "precipitation": weather_res["daily"]["precipitation_sum"],
        "humidity": weather_res["hourly"]["relative_humidity_2m"][:24],
    }