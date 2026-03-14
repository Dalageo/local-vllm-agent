#!/bin/bash

cd "$(dirname "$0")" || exit
MODEL_NAME=$(python3 -c "import config; print(config.MODEL_NAME)")
MAX_TOKENS=$(python3 -c "import config; print(config.MAX_TOKENS)")

echo "==================================================="
echo "🚀 Initializing vLLM Agent"
echo "Model:      $MODEL_NAME"
echo "Max Tokens: $MAX_TOKENS"
echo "Tool Choice: Auto"
echo "Parser:     mistral"
echo "==================================================="

python3 -m vllm.entrypoints.openai.api_server \
        --model "$MODEL_NAME" \
        --enable-auto-tool-choice \
        --tool-call-parser mistral \
        --max-model-len $MAX_TOKENS \