import re
from typing import Dict, List, Tuple
from app.schemas.analysis import EntityEvidence, QuoteEvidence

# Known prominent institutions, geopolitical entities, and party keywords
KNOWN_ORGS = {
    "United Nations": "ORG",
    "UN": "ORG",
    "European Union": "GPE",
    "EU": "GPE",
    "World Bank": "ORG",
    "International Monetary Fund": "ORG",
    "IMF": "ORG",
    "World Health Organization": "ORG",
    "WHO": "ORG",
    "NATO": "ORG",
    "Congress": "ORG",
    "Parliament": "ORG",
    "Supreme Court": "ORG",
    "White House": "ORG",
    "Kremlin": "GPE",
    "Downing Street": "GPE",
    "Federal Reserve": "ORG",
    "Bank of England": "ORG",
}

KNOWN_PARTIES = {
    "Democratic Party": "POL_PARTY",
    "Democrats": "POL_PARTY",
    "Republican Party": "POL_PARTY",
    "Republicans": "POL_PARTY",
    "Labour Party": "POL_PARTY",
    "Labour": "POL_PARTY",
    "Conservative Party": "POL_PARTY",
    "Tories": "POL_PARTY",
    "Green Party": "POL_PARTY",
    "Liberal Democrats": "POL_PARTY",
}

KNOWN_COUNTRIES = {
    "United States", "US", "USA", "United Kingdom", "UK", "Britain", "China", "India",
    "Russia", "Ukraine", "France", "Germany", "Japan", "Canada", "Australia", "Israel",
    "Palestine", "Iran", "Brazil", "South Africa", "Mexico", "Italy", "Spain"
}


def extract_entities_and_quotes(sentences: List[str]) -> Tuple[List[EntityEvidence], List[QuoteEvidence]]:
    """
    Extracts named entities (Person, Org, GPE, Party) and attributed quotations
    directly grounded in the text sentences.
    """
    entity_counts: Dict[str, Dict[str, any]] = {}
    quotes: List[QuoteEvidence] = []
    full_text = " ".join(sentences)

    # 1. Match known entities & parties
    all_known = {**KNOWN_ORGS, **KNOWN_PARTIES}
    for name, ent_type in all_known.items():
        pattern = r"\b" + re.escape(name) + r"\b"
        matches = list(re.finditer(pattern, full_text, flags=re.IGNORECASE))
        if matches:
            canonical_name = name
            if canonical_name not in entity_counts:
                entity_counts[canonical_name] = {
                    "type": ent_type,
                    "count": len(matches),
                    "evidence": sentences[0] if sentences else "",
                }

    for country in KNOWN_COUNTRIES:
        pattern = r"\b" + re.escape(country) + r"\b"
        matches = list(re.finditer(pattern, full_text))
        if matches:
            if country not in entity_counts:
                entity_counts[country] = {
                    "type": "GPE",
                    "count": len(matches),
                    "evidence": sentences[0] if sentences else "",
                }

    # 2. Extract Capitalized Persons/Titles (e.g., President Biden, Prime Minister Starmer, Dr. Thorne)
    person_patterns = [
        r"\b(?:President|Prime Minister|Chancellor|Senator|Minister|Secretary|Governor|Judge|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
        r"\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:said|stated|announced|warned|argued|declared|added)\b",
    ]

    for sent in sentences:
        for pat in person_patterns:
            for match in re.finditer(pat, sent):
                name = match.group(1).strip()
                if name not in KNOWN_COUNTRIES and name not in all_known and len(name) > 3:
                    if name not in entity_counts:
                        entity_counts[name] = {"type": "PERSON", "count": 1, "evidence": sent}
                    else:
                        entity_counts[name]["count"] += 1

    # 3. Extract Direct Quotations and Speaker Attributions (supports both double quotes "“ and single quotes '‘)
    quote_patterns = [
        r'["“\'‘]([^"”\'’]{10,250})["”\'’][,\s]+(?:said|stated|told|warned|noted|added|argued)\s+([A-Z][a-zA-Z\s\.,]+?)(?:\;|\n|$)',
        r'([A-Z][a-zA-Z\s\.,]+?)\s+(?:said|stated|told|warned|noted|added|argued)[,\s]+["“\'‘]([^"”\'’]{10,250})["”\'’]',
    ]

    for sent in sentences:
        for idx, pat in enumerate(quote_patterns):
            for match in re.finditer(pat, sent):
                if idx == 0:
                    quote_text = match.group(1).strip()
                    speaker = match.group(2).strip()
                else:
                    speaker = match.group(1).strip()
                    quote_text = match.group(2).strip()

                # Clean speaker title
                speaker_clean = re.sub(r"^(the|a|an)\s+", "", speaker, flags=re.IGNORECASE).strip()
                if len(speaker_clean) > 2 and len(quote_text) > 10:
                    quotes.append(
                        QuoteEvidence(
                            speaker=speaker_clean[:60],
                            quote=quote_text,
                            affiliation=None,
                        )
                    )

    # Convert entities dictionary to EntityEvidence list
    entities: List[EntityEvidence] = []
    for name, data in entity_counts.items():
        # Determine contextual stance
        stance = "Neutral"
        evidence_text = data.get("evidence", "")
        if "praised" in evidence_text or "welcomed" in evidence_text or "hailed" in evidence_text:
            stance = "Supportive"
        elif "criticized" in evidence_text or "blamed" in evidence_text or "slammed" in evidence_text:
            stance = "Critical"

        entities.append(
            EntityEvidence(
                name=name,
                type=data["type"],
                mentionCount=data["count"],
                stance=stance,
                evidence=evidence_text[:200] if evidence_text else None,
            )
        )

    # Sort by mention count descending
    entities.sort(key=lambda e: e.mentionCount, reverse=True)
    return entities[:12], quotes[:8]
