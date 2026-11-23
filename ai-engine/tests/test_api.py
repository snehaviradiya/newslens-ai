"""Integration and API route tests for NewsLens AI FastAPI endpoints."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "newslens-ai-engine"
    assert "sentiment_and_subjectivity" in data["capabilities"]


def test_analyze_endpoint_success():
    payload = {
        "articleId": "test-uuid-456",
        "headline": "Stock Markets Rally as Inflation Cools Significantly",
        "content": "Wall Street indices surged today following lower inflation reports. The Federal Reserve stated that economic stability was within reach. 'We see encouraging signs across major sectors,' said Jerome Powell. Meanwhile, retail investors celebrated the historic gains.",
        "sourceName": "Financial Times"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["articleId"] == "test-uuid-456"
    assert "framingScores" in data
    assert "conflict" in data["framingScores"]
    assert "economic" in data["framingScores"]
    assert "entities" in data
    assert "quotes" in data
    assert len(data["quotes"]) >= 1
    assert data["headlineSensationalism"] is not None


def test_analyze_endpoint_validation_error():
    payload = {
        "headline": "Hi",
        "content": "Short"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_batch_analyze_endpoint():
    payload = {
        "articles": [
            {
                "headline": "Renewable Energy Capacity Breaks New Records in Europe",
                "content": "Solar and wind energy installations grew 30% this year according to the European Union.",
                "sourceName": "Green Tech Weekly"
            },
            {
                "headline": "Severe Cyberattack Disrupts Healthcare Systems Across Nation",
                "content": "Hospitals reported widespread network outages after malicious ransomware targeted patient databases.",
                "sourceName": "Cyber Defense News"
            }
        ]
    }
    response = client.post("/api/v1/analyze/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["totalProcessed"] == 2
    assert len(data["analyses"]) == 2


def test_similarity_endpoint():
    payload = {
        "textA": "President signs major climate and clean energy initiative into law.",
        "textB": "White House enacts historic environmental legislation supporting renewable power."
    }
    response = client.post("/api/v1/similarity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "sharedTerms" in data
    assert data["method"] == "token_frequency_cosine"


def test_empty_article_content_is_rejected():
    response = client.post(
        "/api/v1/analyze",
        json={"headline": "Valid headline", "content": "               "},
    )
    assert response.status_code == 422
