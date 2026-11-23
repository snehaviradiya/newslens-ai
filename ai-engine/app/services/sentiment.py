import re
from typing import Dict, List, Tuple

# Linguistic lexicons for sentiment and tone analysis
POSITIVE_WORDS = {
    "progress", "success", "milestone", "historic", "optimistic", "growth", "triumph",
    "agreement", "consensus", "breakthrough", "achievement", "benefit", "prosper",
    "solution", "cooperation", "praise", "welcome", "strengthen", "advance", "peace",
    "effective", "recovery", "innovation", "vital", "constructive", "stability",
    "improve", "improves", "improved", "support", "supports", "supported",
    "welcomes", "welcomed", "praised", "approve", "approves", "approved",
    "benefited", "reduced", "recovered", "secured", "saved",
}

NEGATIVE_WORDS = {
    "crisis", "failure", "scandal", "collapse", "disaster", "warning", "threat",
    "condemn", "decline", "corruption", "chaos", "alarm", "danger", "plunge", "loss",
    "blame", "criticize", "shortfall", "catastrophe", "dispute", "protest", "conflict",
    "severe", "deficit", "violation", "damage", "grim", "hostile", "outrage",
    "worsened", "failed", "harm", "harmful", "declined", "fell", "lost",
    "killed", "injured", "disrupted",
}

SUBJECTIVE_MARKERS = {
    "outrageous", "shocking", "disastrous", "clearly", "obviously", "undoubtedly",
    "disgraceful", "triumphantly", "appalling", "allegedly", "reckless", "heroic",
    "brazen", "unprecedented", "furious", "stunning", "devastating", "drastic"
}

SENSATIONAL_HEADLINE_TERMS = {
    "slams", "blasts", "rips", "shocks", "stuns", "crushes", "destroys", "fury",
    "nightmare", "bombshell", "chaos", "panic", "meltdown", "war", "battle", "clash"
}


def analyze_headline(headline: str) -> Tuple[float, float]:
    """
    Returns (headline_sentiment, sensationalism_score).
    Sentiment: -1.0 to 1.0
    Sensationalism: 0.0 to 1.0
    """
    words = re.findall(r"\b[a-zA-Z]+\b", headline.lower())
    if not words:
        return 0.0, 0.0

    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)
    sensational_count = sum(1 for w in words if w in SENSATIONAL_HEADLINE_TERMS)

    # Exclamation marks add sensationalism
    if "!" in headline:
        sensational_count += 1
    # ALL-CAPS words add sensationalism
    caps_words = sum(1 for w in headline.split() if w.isupper() and len(w) > 2)
    sensational_count += min(2, caps_words)

    total_eval = pos_count + neg_count
    if total_eval == 0:
        sentiment = 0.0
    else:
        sentiment = round((pos_count - neg_count) / total_eval, 2)

    sensationalism = min(1.0, round(sensational_count / max(3, len(words) / 2), 2))
    return sentiment, sensationalism


def analyze_sentiment_and_tone(sentences: List[str]) -> Tuple[float, float, str]:
    """
    Analyzes sentence-level words to determine:
    - Average sentiment (-1.0 to 1.0)
    - Subjectivity score (0.0 to 1.0)
    - Overall tone category: NEUTRAL, CRITICAL, ADVOCATING, ALARMIST, BALANCED
    """
    if not sentences:
        return 0.0, 0.0, "NEUTRAL"

    total_pos = 0
    total_neg = 0
    total_subjective = 0
    total_words = 0

    for sent in sentences:
        words = re.findall(r"\b[a-zA-Z]+\b", sent.lower())
        total_words += len(words)
        total_pos += sum(1 for w in words if w in POSITIVE_WORDS)
        total_neg += sum(1 for w in words if w in NEGATIVE_WORDS)
        total_subjective += sum(1 for w in words if w in SUBJECTIVE_MARKERS)

    if total_words == 0:
        return 0.0, 0.0, "NEUTRAL"

    sentiment_denom = total_pos + total_neg
    if sentiment_denom == 0:
        sentiment = 0.0
    else:
        sentiment = round((total_pos - total_neg) / sentiment_denom, 2)

    subjectivity = min(1.0, round((total_subjective * 10) / total_words, 2))

    # Tone categorization
    if total_neg > total_pos * 2 and "alarm" in " ".join(sentences).lower():
        tone = "ALARMIST"
    elif sentiment < -0.25:
        tone = "CRITICAL"
    elif sentiment > 0.25:
        tone = "ADVOCATING"
    elif total_pos > 0 and total_neg > 0:
        tone = "BALANCED"
    else:
        tone = "NEUTRAL"

    return sentiment, subjectivity, tone
