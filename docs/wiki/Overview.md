# Overview

Build your AI products—right inside GitHub. Create prompts, test models, and ship AI-powered features with built-in tools for model access, prompt collaboration, and lightweight evaluation. [Read the docs](https://docs.github.com/en/github-models) to learn more.

## Get started

### Watch the models demo
Watch this 3-minute demo reel to learn everything you can do with GitHub Models.

*(Demo video placeholder)*

### Explore Features
*   **Create a sample prompt**
*   **Compare multiple prompts**
*   **Compare models**

## Prompts

Create, evaluate, and iterate on prompts right inside your repo.

**0 prompts found**  
*Create a prompt to start building with natural language or using `prompt.yml` files.*

## Add AI to your project now

Drop this snippet into your code to start using AI instantly:

```python
import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4o"
token = os.environ["GITHUB_TOKEN"]

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage("You are a helpful assistant."),
        UserMessage("What is the capital of France?"),
    ],
    temperature=1.0,
    top_p=1.0,
    model=model
)

print(response.choices[0].message.content)
```

### Explore 40+ models in the catalog
Compare models in the playground—test parameters, token usage, and latency to find the right fit for your use case.

### Power your prompt with the right model
Test and compare models against your prompt to find the best fit, then commit it directly to your project when you're ready.

### Instrument your Actions workflow with models
Set up a new GitHub Actions workflow using models to continually run lightweight evaluations of your AI features on every Pull Request.
