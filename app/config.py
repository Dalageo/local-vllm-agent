import torch

MODEL_NAME = 'mistralai/Ministral-3-3B-Instruct-2512'
TOOL_PARSER = "mistral"
MAX_TOKENS = 8192

BASE_URL = "http://localhost:8000/v1"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"