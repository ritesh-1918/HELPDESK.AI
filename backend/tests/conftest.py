"""Pytest configuration for backend tests."""
import sys
import os

# Add backend directory to path so imports like `from services.auto_close_service` work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
