"""
conftest.py — Project root path fixture for pytest.

Ensures that the project root directory is on sys.path so that
`from backend.services.xxx import ...` style imports work correctly
regardless of which directory pytest is invoked from.
"""

import sys
import os

# Insert project root (parent of this backend/ dir) at the front of sys.path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)
