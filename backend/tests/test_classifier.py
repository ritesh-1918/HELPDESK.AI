from backend.services.classifier_service import ClassifierService

def test_classifier_initialization():
    classifier = ClassifierService()
    assert classifier._loaded == False
    assert classifier.model is None
    assert classifier.tokenizer is None

def test_classifier_predict_without_load():
    classifier = ClassifierService()
    result = classifier.predict("This is a test ticket about a password reset.")
    assert "error" in result or result.get("category") == "General Request" or result.get("category") == "Unknown"

def test_classifier_team_routing():
    from backend.services.classifier_service import TEAM_MAP
    assert "Hardware" in TEAM_MAP
    assert TEAM_MAP["Hardware"] == "Hardware Support"
    assert TEAM_MAP.get("Software") == "Application Support"
