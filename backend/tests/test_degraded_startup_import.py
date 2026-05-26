import os
import subprocess
import sys
import unittest
from pathlib import Path


class DegradedStartupImportTest(unittest.TestCase):
    def test_backend_main_imports_in_degraded_mode_without_supabase(self):
        repo_root = Path(__file__).resolve().parents[2]
        env = os.environ.copy()
        env["ALLOW_DEGRADED_STARTUP"] = "1"
        env["REQUIRE_SUPABASE"] = "false"

        result = subprocess.run(
            [sys.executable, "-c", "from backend.main import app; print(type(app).__name__)"],
            cwd=repo_root,
            env=env,
            capture_output=True,
            text=True,
        )

        self.assertEqual(
            result.returncode,
            0,
            msg=f"stdout:\n{result.stdout}\n\nstderr:\n{result.stderr}",
        )
        self.assertIn("FastAPI", result.stdout)


if __name__ == "__main__":
    unittest.main()
