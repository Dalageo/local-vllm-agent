import uuid
from app.utils.utils import get_agent
from langgraph.graph.state import CompiledStateGraph


def run_inference_chat(agent: CompiledStateGraph):
    print("===================================================")
    print("🤖 Agent Session Started! (Type 'exit' or 'quit' to stop)")
    print("===================================================")

    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}
    while True:
        user_query = input("\nYou: ")
        if user_query.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break

        inputs = {"messages": [{"role": "user", "content": user_query}]}
        print("🤖 Agent: ", end="", flush=True)

        for msg, _ in agent.stream(inputs, stream_mode="messages", config=config):
            if msg.__class__.__name__ == "AIMessageChunk":
                if msg.content:
                    print(msg.content, end="", flush=True)

                # elif hasattr(msg, "tool_call_chunks") and msg.tool_call_chunks:
                #     for chunk in msg.tool_call_chunks:
                #         if chunk.get("name"): 
                #             print(f"\n[🔧 Using tool: {chunk['name']}...]\n🤖 Agent: ", end="", flush=True)

        print()
        
if __name__ == "__main__":
    agent = get_agent()
    run_inference_chat(agent)