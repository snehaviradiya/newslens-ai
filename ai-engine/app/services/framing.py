"""
Framing classification service based on communication science taxonomy:
- Conflict Frame (winners vs. losers, clashes, controversy, warfare metaphor)
- Economic Consequences Frame (costs, monetary impact, financial burden, economic gains/losses)
- Human Interest Frame (personal stories, emotional impact, human suffering or triumph)
- Morality & Ethics Frame (moral duty, ethical judgment, religious or moral prescriptions)
- Attribution of Responsibility Frame (attributing blame, responsibility, failure or credit to specific actors/institutions)
"""
from typing import List, Dict, Tuple
import re
from app.schemas.analysis import FramingScores, EvidenceSnippet

FRAMING_MARKERS: Dict[str, Dict[str, any]] = {
    "conflict": {
        "keywords": [
            "clash", "clashed", "battle", "fight", "war", "dispute", "standoff", "feud",
            "hostile", "confrontation", "opponents", "rival", "attack", "condemn", "blasted",
            "divided", "polarization", "skirmish", "tensions", "row", "showdown", "rebellion"
        ],
        "weight": 1.0
    },
    "economic": {
        "keywords": [
            "cost", "financial", "billions", "millions", "economic", "expense", "budget",
            "burden", "taxpayers", "price tag", "losses", "profit", "deficit", "inflation",
            "jobs lost", "revenue", "fiscal impact", "monetary", "debt", "affordability"
        ],
        "weight": 1.0
    },
    "human_interest": {
        "keywords": [
            "family", "victim", "victims", "suffering", "grief", "tragic", "tragedy", "struggle",
            "hopes", "dreams", "survivor", "devastated", "heartbreaking", "emotional", "trauma",
            "personal story", "tears", "plight", "human cost", "sympathy", "lives upended"
        ],
        "weight": 1.0
    },
    "morality": {
        "keywords": [
            "moral", "morality", "duty", "ethics", "ethical", "unjust", "justice", "righteous",
            "sin", "virtue", "shameful", "reprehensible", "god", "faith", "sacred", "conscience",
            "indefensible", "obligation", "values", "evil", "integrity", "decency"
        ],
        "weight": 1.0
    },
    "responsibility": {
        "keywords": [
            "blame", "fault", "responsible", "accountability", "failed to", "culpable",
            "held responsible", "negligence", "government must", "failure of", "inaction",
            "to blame", "accountable", "answerable", "dereliction", "oversight", "caused by"
        ],
        "weight": 1.0
    }
}


def analyze_framing(sentences: List[str]) -> Tuple[FramingScores, List[EvidenceSnippet]]:
    """
    Computes scores (0.0 to 1.0) across the 5 communication-science framing dimensions,
    extracting verbatim evidence sentences for high-scoring dimensions.
    """
    if not sentences:
        return FramingScores(conflict=0.0, economic=0.0, humanInterest=0.0, morality=0.0, responsibility=0.0), []

    dim_hits: Dict[str, List[Tuple[str, str]]] = {
        "conflict": [],
        "economic": [],
        "human_interest": [],
        "morality": [],
        "responsibility": []
    }

    for sentence in sentences:
        lower_sent = sentence.lower()
        for dim, config in FRAMING_MARKERS.items():
            for kw in config["keywords"]:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, lower_sent):
                    dim_hits[dim].append((sentence, kw))
                    break

    total_sents = max(len(sentences), 1)
    scores = {}
    evidence: List[EvidenceSnippet] = []

    for dim, hits in dim_hits.items():
        hit_count = len(hits)
        ratio = hit_count / total_sents
        score = min(1.0, ratio * 2.5 + (0.15 if hit_count > 0 else 0.0))
        scores[dim] = round(score, 3)

        if hits:
            for sent, kw in hits[:2]:
                evidence.append(
                    EvidenceSnippet(
                        frame=f"{dim.replace('_', ' ').title()} Frame",
                        excerpt=sent.strip(),
                        location=f"Keyword '{kw}'"
                    )
                )

    framing_scores = FramingScores(
        conflict=scores["conflict"],
        economic=scores["economic"],
        humanInterest=scores["human_interest"],
        morality=scores["morality"],
        responsibility=scores["responsibility"]
    )

    return framing_scores, evidence
