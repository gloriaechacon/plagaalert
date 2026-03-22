import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_ai_insight(data, style="simple"):
    try:
        prompt = f"""
You are an agronomic assistant.

Generate:
1. A short explanation of the risk
2. 2-3 actionable recommendations

Style: {style}

Crop: {data['crop']}
Risk score: {data['risk']}
Risk level: {data['risk_level']}
Temperature: {data['factors']['temperature']}
Humidity: {data['factors']['humidity']}
Rainfall: {data['factors']['rainfall']}
Main cause: {data['main_cause']}

Be concise. Do not invent data.
"""
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print("Gemini error:", e)
        return None