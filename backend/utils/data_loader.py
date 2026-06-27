import json
import os
from typing import Any, List, Optional

def load_json_data(file_path: str) -> List[Any]:
    """Load JSON list from a file safely."""
    if not os.path.exists(file_path):
        return []
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []
    except (json.JSONDecodeError, ValueError, OSError) as e:
        print(f"[DataLoader] Error loading {file_path}: {e}")
        return []

def save_json_data(file_path: str, data: Any) -> bool:
    """Save data to a JSON file safely."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"[DataLoader] Error saving {file_path}: {e}")
        return False

def get_data_dir() -> str:
    """Get the absolute path to the backend/data directory."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
