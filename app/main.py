import uuid
from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse
from fastapi.responses import FileResponse, HTMLResponse
from app.utils.agent_utils import get_agent, stream_agent_response

agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the agent on startup."""
    global agent
    agent = get_agent()
    yield

app = FastAPI(title="Agent API",
              description="Terminal-style chat interface for LangGraph Agent",
              version="1.0.0",
              lifespan=lifespan)


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    """Response model for non-streaming chat."""
    response: str
    session_id: str


@app.post("/api/chat")
async def chat_stream(request: ChatRequest):
    """
    Stream chat response using Server-Sent Events.
    
    Event types:
    - session: {session_id} - Session identifier
    - token: {content} - Response token
    - tool_start: {tool, tool_id} - Tool execution started
    - tool_result: {tool, result} - Tool execution completed
    - done: {} - Response complete
    - error: {message} - Error occurred
    """
    session_id = request.session_id or str(uuid.uuid4())
    
    return EventSourceResponse(
        stream_agent_response(agent, request.message, session_id),
        media_type="text/event-stream"
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "agent_ready": agent is not None}


@app.get("/api/tools")
async def get_tools():
    """Get available tools for the agent."""
    from app.utils.tools import tools
    return {
        "tools": [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in tools
        ]
    }


# Serve static frontend files
app.mount("/static", StaticFiles(directory="app/frontend"), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the main frontend page."""
    return FileResponse("app/frontend/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
