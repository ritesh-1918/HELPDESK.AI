import json
import os
import sys
from collections import defaultdict
from fastapi import FastAPI

# This script automates the creation of a Postman collection from a FastAPI application.
# It introspects the OpenAPI schema and converts it into Postman Collection v2.1.0 format.

# --- Configuration ---
# 1. Ensure this script is located in a 'scripts' directory at the project root.
# 2. Adjust the `app_import_path` if your FastAPI app instance is not in `main.py`.

# Add the project root to the Python path to allow importing the app
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)


def import_fastapi_app(app_import_path: str = "main:app") -> FastAPI:
    """Dynamically imports the FastAPI app instance."""
    try:
        module_name, app_name = app_import_path.split(':')
        module = __import__(module_name)
        return getattr(module, app_name)
    except (ImportError, AttributeError, ValueError) as e:
        print(f"\033[91mError: Could not import '{app_import_path}'.\033[0m")
        print("Please ensure the file and FastAPI app instance exist and the path is correct.")
        print(f"Details: {e}")
        sys.exit(1)

def get_example_from_schema(schema_ref, components):
    """Generates an example payload from a Pydantic schema reference."""
    schema_name = schema_ref.split('/')[-1]
    schema = components.get('schemas', {}).get(schema_name, {})
    if 'properties' not in schema:
        return {}

    example = {}
    for prop_name, prop_details in schema.get('properties', {}).items():
        if 'example' in prop_details:
            example[prop_name] = prop_details['example']
        elif prop_details.get('type') == 'string':
            example[prop_name] = prop_details.get('default', 'string')
        elif prop_details.get('type') == 'integer':
            example[prop_name] = prop_details.get('default', 0)
        elif prop_details.get('type') == 'number':
            example[prop_name] = prop_details.get('default', 0.0)
        elif prop_details.get('type') == 'boolean':
            example[prop_name] = prop_details.get('default', True)
        elif prop_details.get('type') == 'array':
            example[prop_name] = prop_details.get('default', [])
        else:
            example[prop_name] = {}
    return example

def generate_postman_collection(app: FastAPI, output_path: str):
    """Generates and saves a Postman collection from the app's OpenAPI schema."""
    print("\nGenerating Postman collection from OpenAPI schema...")
    openapi_schema = app.openapi()
    components = openapi_schema.get('components', {})

    collection = {
        "info": {
            "_postman_id": "d4e3a3f0-4c3e-4d3e-9f3a-3e4d3c2b1a0e", # Static ID for consistency
            "name": f"{openapi_schema['info']['title']} API Collection",
            "description": openapi_schema['info'].get('description', "A Postman collection automatically generated from the FastAPI OpenAPI specification."),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [{
            "key": "baseUrl",
            "value": "http://127.0.0.1:8000",
            "type": "string",
            "description": "The base URL for the API server."
        }]
    }

    paths_by_tag = defaultdict(list)
    for path, path_item in openapi_schema['paths'].items():
        for method, operation in path_item.items():
            tag = operation.get('tags', ['default'])[0]
            paths_by_tag[tag].append((path, method, operation))

    for tag in sorted(paths_by_tag.keys()):
        paths = paths_by_tag[tag]
        folder = {"name": tag.capitalize(), "item": []}
        for path, method, op in sorted(paths, key=lambda x: x[0]):
            request = {
                "name": op.get('summary', f"{method.upper()} {path}"),
                "description": op.get('description', ""),
                "request": {
                    "method": method.upper(),
                    "header": [],
                    "url": {
                        "raw": f"{{{{baseUrl}}}}{path}",
                        "host": ["{{baseUrl}}"],
                        "path": path.strip('/').split('/')
                    }
                }
            }

            if 'parameters' in op:
                request['request']['url']['query'] = []
                for param in op['parameters']:
                    if param['in'] == 'query':
                        request['request']['url']['query'].append({
                            "key": param['name'],
                            "value": str(param.get('schema', {}).get('example', ''))
                        })

            if 'requestBody' in op:
                content = op['requestBody'].get('content', {})
                if 'application/json' in content:
                    schema_ref = content['application/json']['schema'].get('$ref')
                    if schema_ref:
                        example_body = get_example_from_schema(schema_ref, components)
                        request['request']['header'].append({"key": "Content-Type", "value": "application/json"})
                        request['request']['body'] = {
                            "mode": "raw",
                            "raw": json.dumps(example_body, indent=4),
                            "options": {"raw": {"language": "json"}}
                        }
            folder['item'].append(request)
        collection['item'].append(folder)

    with open(output_path, 'w') as f:
        json.dump(collection, f, indent=4)
    print(f"\033[92m✅ Successfully generated Postman collection!\033[0m")
    print(f"   File saved to: {output_path}")

def main():
    """Main execution function."""
    print("--- API Documentation Tool ---")
    # --- CONFIGURATION ---
    # If your main FastAPI app instance is in a different file or has a different name,
    # update the string below (e.g., "my_app.api:my_fastapi_instance").
    app_import_path = "main:app"
    output_filename = "postman_collection.json"
    # -------------------

    fastapi_app = import_fastapi_app(app_import_path)
    output_file_path = os.path.join(project_root, output_filename)

    generate_postman_collection(fastapi_app, output_file_path)

if __name__ == "__main__":
    main()
