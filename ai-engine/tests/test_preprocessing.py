"""Tests for AI Engine Preprocessing Service."""
import pytest
from app.services.preprocessing import clean_and_normalize, clean_html, normalize_whitespace, segment_sentences


def test_clean_html_strips_tags_and_scripts():
    html_input = "<html><head><script>alert(1);</script><style>.a{color:red}</style></head><body><h1>Title</h1><p>Paragraph with &amp; &quot;quotes&quot; and &nbsp; spaces.</p></body></html>"
    cleaned = clean_html(html_input)
    assert "<script>" not in cleaned
    assert "<style>" not in cleaned
    assert "alert(1)" not in cleaned
    assert "&amp;" not in cleaned
    assert "Title" in cleaned
    assert 'Paragraph with & "quotes" and spaces.' in cleaned


def test_normalize_whitespace():
    raw = "Line 1\r\n\r\n\r\n\r\nLine 2    with   extra  spaces\n\n\nLine 3"
    normalized = normalize_whitespace(raw)
    assert "\r" not in normalized
    assert "Line 1" in normalized
    assert "Line 3" in normalized
    assert "Line 2    with   extra  spaces" in normalized


def test_segment_sentences():
    text = "The Federal Reserve raised interest rates today. Economists had widely expected the move! However, will inflation stabilize? Many questions remain."
    sentences = segment_sentences(text)
    assert len(sentences) == 4
    assert sentences[0] == "The Federal Reserve raised interest rates today."
    assert sentences[1] == "Economists had widely expected the move!"
    assert sentences[2] == "However, will inflation stabilize?"
    assert sentences[3] == "Many questions remain."


def test_segment_sentences_preserves_common_abbreviations():
    text = "Dr. Smith presented the findings. The U.S. agency reviewed the report."
    sentences = segment_sentences(text)
    assert sentences == [
        "Dr. Smith presented the findings.",
        "The U.S. agency reviewed the report.",
    ]
