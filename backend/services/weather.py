from typing import Optional
import requests


def reverse_geocode(latitude: float, longitude: float):
    url = (
        f"https://geocoding-api.open-meteo.com/v1/reverse?"
        f"latitude={latitude}&longitude={longitude}&count=1"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "results" in data and data["results"]:
            place = data["results"][0]
            return {
                "name": place.get("name") or f"{latitude:.4f}, {longitude:.4f}",
                "country": place.get("country"),
                "region": place.get("admin1"),
                "latitude": latitude,
                "longitude": longitude,
            }
    except Exception as e:
        print("Reverse geocoding error:", e)

    return {
        "name": f"{latitude:.4f}, {longitude:.4f}",
        "country": None,
        "region": None,
        "latitude": latitude,
        "longitude": longitude,
    }


def geocode_location(location: str):
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"

    try:
        response = requests.get(geo_url, timeout=10)
        response.raise_for_status()
        geo_res = response.json()

        if "results" not in geo_res or not geo_res["results"]:
            return None

        place = geo_res["results"][0]
        return {
            "name": place.get("name"),
            "country": place.get("country"),
            "region": place.get("admin1"),
            "latitude": place["latitude"],
            "longitude": place["longitude"],
        }
    except Exception as e:
        print("Geocoding error:", e)
        return None


def get_weather_data(
    location: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
):
    place = None

    if latitude is not None and longitude is not None:
        lat = latitude
        lon = longitude
        place = reverse_geocode(lat, lon)

    elif location:
        place = geocode_location(location)
        if not place:
            return None
        lat = place["latitude"]
        lon = place["longitude"]

    else:
        return None

    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&hourly=relative_humidity_2m"
        f"&timezone=auto"
    )

    try:
        response = requests.get(weather_url, timeout=10)
        response.raise_for_status()
        weather_res = response.json()

        if "daily" not in weather_res or "hourly" not in weather_res:
            return None

        return {
            "location": {
                "name": place.get("name"),
                "country": place.get("country"),
                "region": place.get("region"),
                "latitude": lat,
                "longitude": lon,
            },
            "temperature_max": weather_res["daily"]["temperature_2m_max"],
            "temperature_min": weather_res["daily"]["temperature_2m_min"],
            "precipitation": weather_res["daily"]["precipitation_sum"],
            "humidity": weather_res["hourly"]["relative_humidity_2m"][:24],
        }
    except Exception as e:
        print("Weather API error:", e)
        return None