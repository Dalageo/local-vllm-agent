import json
import asyncio
from typing import AsyncGenerator
from app.utils.tools import tools
from langchain_openai import ChatOpenAI
from app.config import MODEL_NAME, BASE_URL
from app.utils.prompt import instructions
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

memory = MemorySaver()

def get_agent(model_name: str = MODEL_NAME) -> CompiledStateGraph:
    
    llm = ChatOpenAI(openai_api_key = "EMPTY",
                     openai_api_base = BASE_URL,
                     model_name = model_name,
                     temperature = 0.2)
    
    agent = create_react_agent(model=llm,
                         tools=tools,
                         prompt=instructions,
                         checkpointer=memory)
    
    return agent


async def stream_agent_response(agent: CompiledStateGraph, message: str, session_id: str) -> AsyncGenerator[str, None]:
    """Stream agent response using Server-Sent Events.
    Yields JSON events for: tokens, tool_calls, tool_results, done, error"""
    
    config = {"configurable": {"thread_id": session_id}}
    inputs = {"messages": [{"role": "user", "content": message}]}
    
    try:
        yield json.dumps({
            "type": "session",
            "session_id": session_id
        })
        
        current_tool = None
        for msg, _ in agent.stream(inputs, stream_mode="messages", config=config):
            msg_class = msg.__class__.__name__
            
            if msg.__class__.__name__ == "AIMessageChunk":
                if hasattr(msg, "tool_call_chunks") and msg.tool_call_chunks:
                    for chunk in msg.tool_call_chunks:
                        if chunk.get("name"):
                            current_tool = chunk["name"]
                            yield json.dumps({
                                "type": "tool_start",
                                "tool": current_tool,
                                "tool_id": chunk.get("id", "")
                            })
                
                if msg.content:
                    yield json.dumps({
                        "type": "token",
                        "content": msg.content
                    })
                    
            elif msg_class == "ToolMessage":
                tool_content = msg.content if isinstance(msg.content, str) else json.dumps(msg.content)
                yield json.dumps({
                    "type": "tool_result",
                    "tool": msg.name if hasattr(msg, 'name') else current_tool,
                    "result": tool_content[:500]  
                })
                current_tool = None
                
            await asyncio.sleep(0.01)
        yield json.dumps({"type": "done"})
        
    except Exception as e:
        yield json.dumps({"type": "error", "message": str(e)})
    