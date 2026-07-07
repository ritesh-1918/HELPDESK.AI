from pathlib import Path


def test_mobile_supabase_client_reads_expo_env_vars():
    source = (
        Path(__file__).resolve().parents[2]
        / "MobileApp"
        / "src"
        / "lib"
        / "supabase.js"
    ).read_text(encoding="utf-8")

    assert "process.env.EXPO_PUBLIC_SUPABASE_URL" in source
    assert "process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY" in source
    assert "createClient(supabaseUrl, supabaseKey" in source


def test_mobile_supabase_client_does_not_hardcode_project_credentials():
    source = (
        Path(__file__).resolve().parents[2]
        / "MobileApp"
        / "src"
        / "lib"
        / "supabase.js"
    ).read_text(encoding="utf-8")

    assert "aejuenhqciagpntcqoir.supabase.co" not in source
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in source


def test_mobile_env_example_documents_required_keys():
    source = (
        Path(__file__).resolve().parents[2] / "MobileApp" / ".env.example"
    ).read_text(encoding="utf-8")

    assert "EXPO_PUBLIC_SUPABASE_URL=" in source
    assert "EXPO_PUBLIC_SUPABASE_ANON_KEY=" in source
    assert "EXPO_PUBLIC_BACKEND_URL=" in source


def test_frontend_env_example_documents_public_runtime_keys():
    source = (
        Path(__file__).resolve().parents[2] / "Frontend" / ".env.example"
    ).read_text(encoding="utf-8")

    expected_keys = [
        "VITE_API_URL=",
        "VITE_BACKEND_URL=",
        "VITE_WS_URL=",
        "VITE_SUPABASE_URL=",
        "VITE_SUPABASE_ANON_KEY=",
        "VITE_USE_MOCK=",
        "VITE_SUPPORT_EMAIL=",
        "VITE_YOUTUBE_API_KEY=",
        "VITE_STRIPE_GROWTH_LINK=",
    ]

    for key in expected_keys:
        assert key in source


def test_env_examples_do_not_contain_secret_shaped_values():
    repo_root = Path(__file__).resolve().parents[2]
    example_paths = [
        repo_root / "backend" / ".env.example",
        repo_root / "Frontend" / ".env.example",
        repo_root / "MobileApp" / ".env.example",
    ]
    combined = "\n".join(path.read_text(encoding="utf-8") for path in example_paths)

    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in combined
    assert "aejuenhqciagpntcqoir.supabase.co" not in combined
    assert "sk_live_" not in combined
    assert "re_123456789" not in combined
