from typing import List
from langchain_core.tools import tool
from geopy.geocoders import Nominatim
import requests

@tool   
def get_current_weather(location: str) -> dict:
    """
    Get the current weather in a given location.
    Args:
        location (str): The city or country name to get the weather for, e.g., 'Trollhatan' or 'Sweden'.
    Returns:
        dict: The current weather data (temperature, windspeed, etc.) or an error message.
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
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            return data.get("current_weather", {"error": "Weather data missing from response."})
        else:
            return {"error": f"Failed to fetch weather. API returned status code {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": f"A network error occurred while fetching the weather: {str(e)}"}
    
    
@tool
def get_currency_exchange_rates(base_currency_code: str, currency_codes: List[str] = None) -> dict:
    """
    Get the latest currency exchange rates.
    Args:
        base_currency_code (str): The 3-letter currency code you are converting from (e.g., 'USD', 'EUR').
        currency_codes (List[str], optional): A list of 3-letter currency codes you want to convert to (e.g., ['GBP', 'JPY']). 
                                              If not provided, it returns latest rates for all available currencies.
    Returns:
        dict: The exchange rate data or an error message.
    """
    if isinstance(currency_codes, list):
        currency_codes = ",".join(currency_codes)
        
    url = f"https://api.frankfurter.dev/v1/latest"
    params = {
        "base": base_currency_code.upper(),
        "symbols": currency_codes
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API request failed with status code {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": f"A network error occurred: {str(e)}"}

    

tools = [get_current_weather, get_currency_exchange_rates]