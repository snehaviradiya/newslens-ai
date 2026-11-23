"""
Topic classification service for NewsLens AI.
Identifies primary and secondary news topics with confidence scores and evidence keywords/phrases.
"""
from typing import List, Dict, Tuple
import re
from app.schemas.analysis import TopicEvidence

TOPIC_LEXICON: Dict[str, Dict[str, any]] = {
    "Economy & Finance": {
        "keywords": [
            "economy", "economic", "inflation", "interest rates", "central bank", "federal reserve",
            "treasury", "stocks", "wall street", "recession", "gdp", "market", "trade", "deficit",
            "fiscal", "budget", "taxation", "revenue", "investment", "unemployment", "jobs", "labor",
            "wages", "debt", "mortgage", "banking", "finance", "investors", "crypto", "commodity"
        ],
        "weight": 1.0,
    },
    "Politics & Governance": {
        "keywords": [
            "election", "vote", "voter", "campaign", "ballot", "congress", "senate", "house of representatives",
            "parliament", "legislation", "bill", "democrat", "republican", "gop", "bipartisan", "policymaker",
            "supreme court", "governor", "mayor", "president", "administration", "cabinet", "veto", "impeachment",
            "lobbyist", "caucus", "primary", "nominee", "constitution", "judicial"
        ],
        "weight": 1.0,
    },
    "Foreign Affairs & National Security": {
        "keywords": [
            "foreign policy", "diplomacy", "treaty", "allies", "nato", "united nations", "sanctions",
            "military", "defense", "pentagon", "war", "conflict", "geopolitics", "invasion", "ceasefire",
            "embassy", "ambassador", "intelligence", "espionage", "missile", "nuclear", "sovereignty",
            "security council", "border security", "refugee", "humanitarian aid"
        ],
        "weight": 1.0,
    },
    "Healthcare & Medicine": {
        "keywords": [
            "health", "healthcare", "hospital", "patient", "disease", "virus", "pandemic", "vaccine",
            "doctor", "medical", "fda", "cdc", "who", "pharmaceutical", "drug", "clinical trial",
            "insurance", "medicare", "medicaid", "mental health", "cancer", "treatment", "therapy"
        ],
        "weight": 1.0,
    },
    "Climate & Environment": {
        "keywords": [
            "climate", "climate change", "global warming", "emissions", "carbon", "renewable energy",
            "solar", "wind energy", "fossil fuel", "oil", "coal", "natural gas", "drought", "wildfire",
            "flood", "hurricane", "extreme weather", "biodiversity", "conservation", "epa", "pollution",
            "clean energy", "greenhouse gas", "paris agreement"
        ],
        "weight": 1.0,
    },
    "Technology & Science": {
        "keywords": [
            "technology", "tech", "artificial intelligence", "ai", "machine learning", "software",
            "algorithm", "cybersecurity", "hacker", "data privacy", "silicon valley", "semiconductor",
            "chip", "quantum", "space", "nasa", "biotech", "automation", "robotics", "gadget", "social media"
        ],
        "weight": 1.0,
    },
    "Law, Crime & Justice": {
        "keywords": [
            "crime", "criminal", "police", "law enforcement", "fbi", "doj", "attorney general",
            "prosecutor", "defense attorney", "indictment", "trial", "court", "verdict", "jury",
            "prison", "arrest", "lawsuit", "judge", "constitutional law", "civil rights", "investigation"
        ],
        "weight": 1.0,
    },
    "Education & Society": {
        "keywords": [
            "education", "school", "university", "college", "student", "teacher", "tuition", "curriculum",
            "student loan", "higher education", "housing", "demographics", "welfare", "inequality",
            "poverty", "community", "social services", "culture"
        ],
        "weight": 1.0,
    }
}


def classify_topics(text: str, sentences: List[str], max_topics: int = 3) -> List[TopicEvidence]:
    """
    Classifies the text into standard news topics, returning confidence scores and matched evidence terms.
    """
    lower_text = text.lower()
    topic_scores: List[Tuple[str, float, List[str]]] = []

    for topic_name, config in TOPIC_LEXICON.items():
        matched_terms: List[str] = []
        total_hits = 0

        for keyword in config["keywords"]:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            hits = len(re.findall(pattern, lower_text))
            if hits > 0:
                matched_terms.append(keyword)
                total_hits += hits

        if total_hits > 0:
            diversity_bonus = min(len(matched_terms) * 0.15, 0.6)
            frequency_score = min(total_hits * 0.05, 0.4)
            score = round(min(1.0, diversity_bonus + frequency_score), 3)
            topic_scores.append((topic_name, score, matched_terms[:8]))

    topic_scores.sort(key=lambda x: x[1], reverse=True)

    if not topic_scores:
        return [TopicEvidence(topic="General News", score=0.0, supportingText=None)]

    results: List[TopicEvidence] = []
    for topic, score, keywords in topic_scores[:max_topics]:
        results.append(
            TopicEvidence(
                topic=topic,
                score=score,
                supportingText=", ".join(keywords)
            )
        )

    return results
