# vLLM Agent

A local AI agent powered by [vLLM](https://github.com/vllm-project/vllm) and [LangGraph](https://github.com/langchain-ai/langgraph), featuring a modern web interface for interactive conversations. The agent uses the ReAct (Reasoning + Acting) pattern to intelligently use tools and provide informed responses.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Local LLM Inference** — Run language models locally using vLLM's high-performance serving
- **Tool-Augmented Responses** — Agent can use tools to fetch real-time data
- **Streaming Responses** — Real-time token streaming via Server-Sent Events (SSE)
- **Conversation Memory** — Maintains context within sessions
- **Modern Web UI** — Clean, responsive chat interface with multiple themes

### Built-in Tools

| Tool | Description |
|------|-------------|
| 🌤️ Weather | Get current weather for any location (Open-Meteo API) |
| 💱 Currency | Live exchange rates between currencies (Frankfurter API) |
| 🔍 Web Search | Search the internet via DuckDuckGo |

## Architecture

```
┌─────────────────────────────────────┐
│         Web Interface (:8080)       │
│         FastAPI + SSE Streaming     │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         LangGraph Agent             │
│         ReAct Pattern + Tools       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         vLLM Server (:8000)         │
│         OpenAI-Compatible API       │
└─────────────────────────────────────┘
```

## Requirements

- Python 3.11
- CUDA-compatible GPU (recommended) or CPU
- ~6GB VRAM for the default model

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies with Poetry**
   ```bash
   pip install poetry
   poetry install
   ```

## Configuration

Edit `app/config.py` to customize the model and settings:

```python
MODEL_NAME = 'mistralai/Ministral-3-3B-Instruct-2512'  # Any vLLM-compatible model
TOOL_PARSER = "mistral"                                 # Tool call parser
MAX_TOKENS = 8192                                       # Context window
BASE_URL = "http://localhost:8000/v1"                   # vLLM server URL
```

### Supported Models

Any model compatible with vLLM that supports tool calling:

| Model | VRAM | Tool Parser |
|-------|------|-------------|
| `mistralai/Ministral-3-3B-Instruct-2512` (default) | ~6GB | `mistral` |
| `mistralai/Mistral-7B-Instruct-v0.3` | ~14GB | `mistral` |
| `meta-llama/Llama-3.1-8B-Instruct` | ~16GB | `llama3_json` |
| `Qwen/Qwen2.5-7B-Instruct` | ~14GB | `hermes` |

Update `TOOL_PARSER` in config to match your model's tool calling format.

## Usage

### Step 1: Start the vLLM Server

```bash
bash app/scripts/start_agent.sh
```

This launches the vLLM OpenAI-compatible API server. Wait until you see the model is loaded.

### Step 2: Start the Web Interface

In a new terminal:

```bash
bash app/scripts/start_app.sh
```

### Step 3: Open the Chat

Navigate to **http://localhost:8080** in your browser.

## Project Structure

```
├── app/
│   ├── config.py              # Model and server configuration
│   ├── main.py                # FastAPI application
│   ├── frontend/              # Web interface
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   ├── scripts/
│   │   ├── start_agent.sh     # vLLM server startup
│   │   └── start_app.sh       # Web interface startup
│   └── utils/
│       ├── agent_utils.py     # Agent initialization & streaming
│       ├── tools.py           # Tool definitions
│       └── prompt.py          # System prompt
├── pyproject.toml
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/api/chat` | POST | Chat with streaming (SSE) |
| `/api/health` | GET | Health check |
| `/api/tools` | GET | List available tools |

### Chat Request Example

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the weather in Tokyo?", "session_id": "my-session"}'
```

## Adding Custom Tools

Create a new tool in `app/utils/tools.py`:

```python
from langchain_core.tools import tool

@tool
def my_custom_tool(param: str) -> dict:
    """Description of what the tool does."""
    # Your implementation
    return {"result": "..."}

# Add to the tools list
tools = [get_current_weather, get_currency_exchange_rates, web_search, my_custom_tool]
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `CUDA out of memory` | Use a smaller model or reduce `MAX_TOKENS` |
| `Connection refused on :8000` | Ensure vLLM server is running (`start_agent.sh`) |
| `Agent not ready` | Wait for model to fully load before starting web interface |

## License

MIT
