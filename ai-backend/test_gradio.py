from gradio_client import Client

# Test Gradio API connection
try:
    print("Testing Gradio StableDesign API...")
    import os
    client = Client(
        "MykolaL/StableDesign",
        hf_token=os.getenv("GRADIO_HF_TOKEN")
    )
    print("✅ Client initialized successfully!")
    print(f"API Info: {client.view_api()}")
except Exception as e:
    print(f"❌ Error: {e}")
