import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

def test_github_model(prompt: str, model: str = "openai/gpt-4o"):
    """
    Test a prompt using GitHub Models.
    Requires GITHUB_TOKEN environment variable.
    """
    endpoint = "https://models.github.ai/inference"
    token = os.environ.get("GH_MODELS_TOKEN")
    
    if not token:
        raise ValueError("GH_MODELS_TOKEN environment variable is missing. Please set it via `gh auth token` or in your environment.")

    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token),
    )

    try:
        response = client.complete(
            messages=[
                SystemMessage("You are a helpful IT support AI assistant for Helpdesk.AI."),
                UserMessage(prompt),
            ],
            temperature=0.7,
            top_p=1.0,
            model=model
        )

        print(f"Model: {model}")
        print("Response:")
        print(response.choices[0].message.content)
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling GitHub Models: {e}")
        return None

if __name__ == "__main__":
    print("Testing GitHub Models inference...")
    sample_issue = "My laptop keeps blue-screening when I open Docker and VS Code simultaneously."
    test_github_model(sample_issue)
