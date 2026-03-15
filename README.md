<div align="center">
  <a href="https://www.python.org/downloads/release/python-3110/" target="_blank">
  <img src="https://img.shields.io/badge/Python-3.11-blue.svg" alt="Python 3.11"></a>
  <a href="https://github.com/Dalageo/local-vllm-agent/blob/prd/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-AGPL%20v3-800080" alt="License: AGPLv3"></a>
  <img src="https://img.shields.io/github/stars/Dalageo/local-vllm-agent?style=social" alt="GitHub stars">
</div> 

# Local vLLM Agent <img src="https://github.com/user-attachments/assets/e051e21a-ae95-4f2b-8be1-d3edc059949d" width="28">

This project implements a local AI agent powered by [vLLM](https://github.com/vllm-project/vllm) and [LangGraph](https://github.com/langchain-ai/langgraph), with a modern web interface for interactive conversations. The agent uses the ReAct (Reasoning + Acting) pattern to intelligently use tools and provide informed responses.


## 🚀 Features

- **Local LLM Inference:**  Powered by vLLM for fast, local LLM serving across a wide range of supported models.
- **Flexible Model Testing:** Easily swap and evaluate different models to find the best fit for your specific use case.
- **Tool-Augmented Responses:** Leverages the ReAct pattern to fetch real-time data and execute external tools.
- **Streaming UI:** Interactive conversations with real-time token streaming via Server-Sent Events (SSE).
- **Persistent Memory:** Maintains full context within sessions
- **Modern Web Interface:** Clean, responsive chat interface with multiple themes

### Built-in Tools

| Tool | Description |
|------|-------------|
| 🌤️ Weather | Get current weather for any location (Open-Meteo API) |
| 💱 Currency | Live exchange rates between currencies (Frankfurter API) |
| 🔍 Web Search | Search the internet via DuckDuckGo |

*The agent automatically selects the best tool based on the user's request. You can expand these capabilities by adding new functions to `app/utils/tools.py`.*

## 🛠️Development Workflow
This project follows a three-tier branching strategy with automated deployments:

### Branch Structure

- **`dev`** - Development branch for active feature work
- **`tst`** - Testing/staging environment for validation
- **`prd`** - Production-ready stable releases

### CI/CD Pipeline

**Automatic Deployment (dev → tst)**:
- Any push to `dev` automatically triggers a GitHub Actions workflow
- Changes are merged into `tst` branch for testing
- Workflow: `.github/workflows/deploy_tst.yml`

**Manual Deployment (tst → prd)**:
- Deployment to `prd` requires manual approval via GitHub Actions
- Only executable from the `tst` branch
- Workflow: `.github/workflows/deploy_prd.yml`

*Although this is a personal project, the CI/CD pipeline adheres to professional standards for maintaining a stable codebase and facilitating effective collaboration.*

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.11
- CUDA-compatible GPU (recommended) or CPU
- ~6GB VRAM for the default model

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dalageo/local-vllm-agent
   cd local-vllm-agent
   ```

2. **Install dependencies with Poetry**
   ```bash
   pip install poetry
   poetry install
   ```

### Configuration

Edit `app/config.py` to customize the model and settings:

```python
MODEL_NAME = 'mistralai/Ministral-3-3B-Instruct-2512'   # Any vLLM-compatible model
TOOL_PARSER = "mistral"                                 # Tool call parser
MAX_TOKENS = 8192                                       # Context window
VLLM_URL = "http://localhost:8000/v1"                   # vLLM server URL
```

### Supported Models

Any model compatible with vLLM that supports tool calling:

| Model | VRAM | Tool Parser |
|-------|------|-------------|
| `mistralai/Ministral-3-3B-Instruct-2512` (default) | ~6GB | `mistral` |
| `mistralai/Mistral-7B-Instruct-v0.3` | ~14GB | `mistral` |
| `meta-llama/Llama-3.1-8B-Instruct` | ~16GB | `llama3_json` |
| `Qwen/Qwen2.5-7B-Instruct` | ~14GB | `hermes` |

*Update `TOOL_PARSER` in config to match your model's tool calling format.*

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/api/chat` | POST | Chat with streaming (SSE) |
| `/api/health` | GET | Health check |
| `/api/tools` | GET | List available tools |

## 💻 Usage

### Step 1: Start the vLLM Server

```bash
bash app/scripts/start_agent.sh
```

*This launches the vLLM OpenAI-compatible API server. Wait until you see the model is loaded.*

### Step 2: Start the Web Interface

In a new terminal:

```bash
bash app/scripts/start_app.sh
```

### Step 3: Access the Interface

Navigate to `http://localhost:8080` in your browser to start chatting.

## 📁 Project Structure

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

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `CUDA out of memory` | Use a smaller model or reduce `MAX_TOKENS` |
| `Connection refused on :8000` | Ensure vLLM server is running (`start_agent.sh`) |
| `Agent not ready` | Wait for model to fully load before starting web interface |

## ✨ Acknowledgments

Special thanks to the teams behind the open-source tools that made this agent possible: [Mistral](https://mistral.ai/) for open-sourcing the `Ministral-3-3B-Instruct-2512 model`, [vLLM](https://vllm.ai/) for running the model efficiently so it generates answers fast without overloading the system, and [LangChain](https://www.langchain.com/) for providing the building blocks to structure the agent and make all the pieces work together.


<div align="center">
  <br>
  <a href="https://mistral.ai/">
    <img src="https://github.com/user-attachments/assets/96902e37-fac4-458f-ae4d-ec17aea2bc19" alt="Mistral" width="95"/></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://vllm.ai/">
    <img src="https://github.com/user-attachments/assets/aedc8045-18c3-44e1-bdee-68a80578bb7f" alt="vLLM" width="90"/></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.langchain.com/">
    <img src="https://github.com/user-attachments/assets/79e935ba-96a6-4911-8e70-0e3dae15966d" alt="Langchain" width="100"/></a>
</div>

## ⚖️ License

This repository utilizes components with different licenses:

* **The Code & Documentation:** Licensed under the **[AGPL-3.0 license](https://www.gnu.org/licenses/agpl-3.0.en.html)**.
    > The AGPL-3.0 license was chosen to promote open collaboration, ensure transparency, and require that any modifications or improvements must also be shared under the same license, with appropriate acknowledgment.

* **The vLLM Library:** vLLM is a fast, open-source library for LLM inference and serving, licensed under the **[Apache License 2.0](https://github.com/vllm-project/vllm/blob/main/LICENSE)**.


<div align="center">
  <br>
  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
    <img src="https://github.com/user-attachments/assets/f3c6face-aa86-45da-8d20-d8ae25e49e28" alt="AGPLv3-Logo" width="200""></a>
    &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.apache.org/licenses/LICENSE-2.0">
    <img src="https://github.com/user-attachments/assets/bcf30286-f8b7-488a-8300-ec2464090c33" alt="Apache License 2.0" width="200" height="100"></a>
</div>
