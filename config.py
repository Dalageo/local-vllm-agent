import torch

MODEL_NAME = 'mistralai/Ministral-3-3B-Instruct-2512'
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"