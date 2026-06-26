from __future__ import annotations

import os


def main() -> int:
    token = os.getenv("GH_MODELS_TOKEN")
    if not token:
        print("GH_MODELS_TOKEN is not set; skipping GitHub Models evaluation.")
        return 0

    try:
        from azure.ai.inference import ChatCompletionsClient
        from azure.ai.inference.models import SystemMessage, UserMessage
        from azure.core.credentials import AzureKeyCredential
    except ImportError as exc:
        print(f"Missing dependency: {exc}")
        return 0

    try:
        client = ChatCompletionsClient(
            endpoint="https://models.github.ai/inference",
            credential=AzureKeyCredential(token),
        )

        messages = [
            SystemMessage(
                "You are the evaluation engine for Helpdesk.AI's categorization module. "
                "Given a user IT ticket, predict the Category, Subcategory, and Priority "
                "based on the Helpdesk.AI mapping. Return valid JSON with keys category, "
                "subcategory, and priority."
            ),
            UserMessage(
                'User Ticket: "My laptop will not connect to the office Wi-Fi and VPN login fails."'
            ),
        ]

        response = client.complete(
            model="openai/gpt-4o",
            messages=messages,
            temperature=0.2,
            top_p=0.95,
            max_tokens=500,
        )

        content = response.choices[0].message.content if response.choices else ""
        if content:
            print(content)
        else:
            print("GitHub Models returned an empty response.")
    except Exception as exc:
        print(f"GitHub Models evaluation skipped due to runtime error: {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())