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
