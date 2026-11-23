"""
Political signal detection service for NewsLens AI.
Grounds signals in direct, observable text evidence (e.g. party mentions, election rhetoric, policy positions)
without assigning arbitrary fixed political alignments to publishers.
"""
from typing import List, Dict, Optional
import re
from app.schemas.analysis import PoliticalSignal

POLITICAL_SIGNAL_PATTERNS: List[Dict[str, any]] = [
    {
        "signalType": "PartyReference",
        "observation": "Text contains a listed political party or party-process term.",
        "patterns": [
            r"\b(democrats?|gop|republicans?|bipartisan|partisanship|filibuster|caucus|party-line)\b"
        ]
    },
    {
        "signalType": "CampaignRhetoric",
        "observation": "Text contains a listed election, campaign, or polling term.",
        "patterns": [
            r"\b(swing state|electoral college|battleground|poll numbers|re-election campaign|voter turnout|midterms)\b"
        ]
    },
    {
        "signalType": "PolicyDebate",
        "observation": "Text contains a listed policy, regulation, or legislative term.",
        "patterns": [
            r"\b(executive order|legislation|regulatory reform|tax reform|judicial nomination|filibuster rule|appropriations)\b"
        ]
    },
    {
        "signalType": "GovernmentAction",
        "observation": "Text contains a listed government institution or action phrase.",
        "patterns": [
            r"\b(department of justice|supreme court ruled|sanctions imposed|signed executive order|indictment issued)\b"
        ]
    }
]


def detect_political_signals(
    sentences: List[str],
    evidence_sentences: Optional[List[Optional[str]]] = None,
) -> List[PoliticalSignal]:
    """
    Identifies observable political signals present in the article, accompanied by exact sentence citations.
    """
    signals: List[PoliticalSignal] = []

    for item in POLITICAL_SIGNAL_PATTERNS:
        matched_sentences: List[str] = []
        for index, sentence in enumerate(sentences):
            for pattern in item["patterns"]:
                if re.search(pattern, sentence, re.IGNORECASE):
                    excerpt = (
                        evidence_sentences[index]
                        if evidence_sentences and index < len(evidence_sentences)
                        else sentence
                    )
                    if excerpt:
                        matched_sentences.append(excerpt)
                    break
            if len(matched_sentences) >= 3:
                break

        if matched_sentences:
            signals.append(
                PoliticalSignal(
                    signalType=item["signalType"],
                    observation=item["observation"],
                    supportingExcerpt=matched_sentences[0]
                )
            )

    return signals
