from app.agent_utils.tools import tools
from langchain_openai import ChatOpenAI
from app.config import MODEL_NAME, BASE_URL
from app.agent_utils.prompt import instructions
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

memory = MemorySaver()

def get_agent(model_name: str = MODEL_NAME) -> CompiledStateGraph:
    
    llm = ChatOpenAI(openai_api_key = "EMPTY",
                     openai_api_base = BASE_URL,
                     model_name = model_name,
                     temperature = 0.2)
    
    llm_with_tools = llm.bind_tools(tools) 
    agent = create_react_agent(model=llm_with_tools,
                         tools=tools,
                         prompt=instructions,
                         checkpointer=memory)
    
    return agent
    