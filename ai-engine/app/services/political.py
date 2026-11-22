"""
Political signal detection service for NewsLens AI.
Grounds signals in direct, observable text evidence (e.g. party mentions, election rhetoric, policy positions)
without assigning arbitrary fixed political alignments to publishers.
"""
from typing import List, Dict
import re
from app.schemas.analysis import PoliticalSignal

POLITICAL_SIGNAL_PATTERNS: List[Dict[str, any]] = [
    {
        "signalType": "PartyReference",
        "observation": "Explicit focus on political party dynamics or legislative conflict",
        "patterns": [
            r"\b(democrats?|gop|republicans?|bipartisan|partisanship|filibuster|caucus|party-line)\b"
        ]
    },
    {
        "signalType": "CampaignRhetoric",
        "observation": "Framing issues through campaign strategy, polls, or electoral stakes",
        "patterns": [
            r"\b(swing state|electoral college|battleground|poll numbers|re-election campaign|voter turnout|midterms)\b"
        ]
    },
    {
        "signalType": "PolicyDebate",
        "observation": "Discussion centered on government policy, regulation, or statutory reform",
        "patterns": [
            r"\b(executive order|legislation|regulatory reform|tax reform|judicial nomination|filibuster rule|appropriations)\b"
        ]
    },
    {
        "signalType": "GovernmentAction",
        "observation": "Direct actions, enforcement, investigations or rulings by government bodies",
        "patterns": [
            r"\b(department of justice|supreme court ruled|sanctions imposed|signed executive order|indictment issued)\b"
        ]
    }
]


def detect_political_signals(sentences: List[str]) -> List[PoliticalSignal]:
    """
    Identifies observable political signals present in the article, accompanied by exact sentence citations.
    """
    signals: List[PoliticalSignal] = []

    for item in POLITICAL_SIGNAL_PATTERNS:
        matched_sentences: List[str] = []
        for sentence in sentences:
            for pattern in item["patterns"]:
                if re.search(pattern, sentence, re.IGNORECASE):
                    matched_sentences.append(sentence.strip())
                    break
            if len(matched_sentences) >= 3:
                break

        if matched_sentences:
            signals.append(
                PoliticalSignal(
                    signalType=item["signalType"],
                    observation=item["observation"],
                    supportingExcerpt=" | ".join(matched_sentences)
                )
            )

    return signals
