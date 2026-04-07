<p align="center">
  <img src="https://img.shields.io/badge/GITHUB_MODELS_INTEGRATION-111827?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" width="100%" alt="Models Banner">
</p>

> [!NOTE]
> Build your AI products—right inside GitHub. Helpdesk.AI uses these systems to create prompts, test models, and ship AI-powered features with built-in tools for prompt collaboration and lightweight CI/CD evaluation.

<br>

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h2>Integration Strategy</h2>
      <p>Create, evaluate, and iterate on prompts right inside the local repo configuration.</p>
      <ul>
        <li><strong>Prompt Centralization</strong>: Built using standard <code>.prompt.yml</code> architectures.</li>
        <li><strong>Evaluation Pipelines</strong>: CI/CD test triggers ensure new prompt versions do not degrade AI generation quality.</li>
        <li><strong>Model Playground</strong>: Allows rapid testing of new parameter weights before deployment.</li>
      </ul>
      <br>
      <a href="https://docs.github.com/en/github-models">
        <img src="https://img.shields.io/badge/READ_GITHUB_DOCS-111827?style=for-the-badge&logo=readthedocs&logoColor=white&labelColor=252526" alt="Docs">
      </a>
    </td>
    <td width="50%" valign="top" align="center">
      <br>
      <i>Watch the 3-minute demo reel to understand exact capabilities.</i><br><br>
        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
          <img src="https://img.shields.io/badge/▶_WATCH_VIDEO_DEMO-111827?style=for-the-badge&logo=youtube&logoColor=white&labelColor=dc2626" alt="Video Placeholder">
        </a>
    </td>
  </tr>
</table>

<br><br>

> [!IMPORTANT]
> ### Python Inference Setup
> Drop this snippet into your core logic code to instantiate the AI engine locally. Requires configured GitHub CLI secrets to execute safely.


```python
import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4o"
token = os.environ["GH_MODELS_TOKEN"]

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage("You are the Helpdesk.AI routing agent."),
        UserMessage("My computer is crashing repeatedly."),
    ],
    temperature=0.4,
    top_p=0.9,
    model=model
)

print(response.choices[0].message.content)
```
