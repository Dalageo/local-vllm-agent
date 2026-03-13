from langchain_core.tools import tool
from geopy.geocoders import Nominatim
import requests

@tool   
def get_current_weather(location: str) -> dict:
    """
    Get the current weather in a given location.
    Provide the city and country name, e.g., 'Paris, France' or 'Peristeri, Greece'.
    """
    geolocator = Nominatim(user_agent="WeatherAgent")
    location_obj = geolocator.geocode(location)
    if not location_obj:
        return {"error": f"Could not find coordinates for {location}"}
        
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": location_obj.latitude,
        "longitude": location_obj.longitude,
        "current_weather": True 
    }
    
    response = requests.get(url, params)
    if response.status_code == 200:
        data = response.json()
        return data["current_weather"]
    else:
        return {"error": "Failed to fetch weather data."}
    
    
tools = [get_current_weather]