from pathlib import Path
import subprocess


ALLOWED_ENV_EXAMPLES = {
    "backend/.env.example",
    "MobileApp/.env.example",
}


def test_no_real_env_files_are_tracked():
    repo_root = Path(__file__).resolve().parents[2]
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
    )

    tracked_env_files = []
    for raw_path in result.stdout.splitlines():
        path = raw_path.strip()
        name = Path(path).name
        if not path:
            continue
        if path in ALLOWED_ENV_EXAMPLES:
            continue
        if name == ".env" or name.startswith(".env.") or name.endswith(".env") or ".env." in name:
            tracked_env_files.append(path)

    assert tracked_env_files == []
