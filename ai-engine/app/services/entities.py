import re
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.analysis import EntityEvidence, QuoteEvidence

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
    "Palestine", "Iran", "Brazil", "South Africa", "Mexico", "Italy", "Spain",
}

ATTRIBUTION_VERBS = r"said|stated|told|warned|noted|added|argued|declared"
ROLE_WORDS = {
    "president", "prime", "minister", "chancellor", "senator", "secretary",
    "governor", "judge", "dr", "mr", "mrs", "ms", "education", "health",
    "foreign", "interior", "finance", "defense", "justice", "culture",
    "environment", "official", "director", "chief",
}
POSITIVE_STANCE_WORDS = {
    "support", "supports", "supported", "supporting", "welcome", "welcomes",
    "welcomed", "praise", "praises", "praised", "approve", "approves",
    "approved", "benefit", "benefits", "benefited", "agree", "agrees", "agreed",
    "improve", "improves", "improved", "success", "successful", "progress",
}
NEGATIVE_STANCE_WORDS = {
    "oppose", "opposes", "opposed", "opposing", "criticize", "criticizes",
    "criticized", "condemn", "condemns", "condemned", "reject", "rejects",
    "rejected", "harm", "harms", "harmed", "fail", "fails", "failed",
    "disagree", "disagrees", "disagreed", "dangerous", "unacceptable",
}


def _normalized_name(name: str) -> str:
    tokens = re.findall(r"[a-z]+", name.lower())
    return " ".join(token for token in tokens if token not in ROLE_WORDS)


def _stance_from_statement(statement: str) -> str:
    tokens = re.findall(r"\b[a-z]+\b", statement.lower())
    words = set(tokens)
    if "neutral" in words or "neither" in words and ("support" in words or "oppose" in words):
        return "Neutral"
    positive = bool(words & POSITIVE_STANCE_WORDS)
    negative = bool(words & NEGATIVE_STANCE_WORDS)
    stance_indexes = [
        index for index, token in enumerate(tokens)
        if token in POSITIVE_STANCE_WORDS or token in NEGATIVE_STANCE_WORDS
    ]
    if any(
        token in {"not", "never", "no", "hardly"}
        for index in stance_indexes
        for token in tokens[max(0, index - 2):index]
    ):
        return "Unknown"
    if positive and not negative:
        return "Supportive"
    if negative and not positive:
        return "Critical"
    return "Unknown"


def _extract_quotes(sentences: List[str]) -> List[QuoteEvidence]:
    quotes: List[QuoteEvidence] = []
    quote_patterns = [
        r'["\u201c]([^"\u201d]{10,250})["\u201d]',
        r"['\u2018]([^'\u2019]{10,250})['\u2019]",
    ]
    for sentence in sentences:
        for quote_pattern in quote_patterns:
            for match in re.finditer(quote_pattern, sentence):
                quote_text = re.sub(r"[\s,;:.!?]+$", "", match.group(1)).strip()
                before = sentence[max(0, match.start() - 160):match.start()]
                after = sentence[match.end():match.end() + 160]
                speaker = "Unknown Speaker"
                attribution = re.search(
                    rf"\b(?:{ATTRIBUTION_VERBS})\b\s*,?\s*((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|President|Prime Minister|Senator|Secretary|Minister|Governor|Judge)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){{0,2}})",
                    after,
                )
                if attribution:
                    speaker = re.sub(r"\s+", " ", attribution.group(1)).strip()
                else:
                    attribution = re.search(
                        rf"((?:(?:Dr\.|Mr\.|Ms\.|Mrs\.|President|Prime Minister|Senator|Secretary|Minister|Governor|Judge)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){{0,2}})\s+(?:{ATTRIBUTION_VERBS})\b",
                        before,
                    )
                    if attribution:
                        speaker = re.sub(r"\s+", " ", attribution.group(1)).strip()
                quotes.append(QuoteEvidence(speaker=speaker[:60], quote=quote_text))
    return quotes[:8]


def extract_entities_and_quotes(
    sentences: List[str],
    evidence_sentences: Optional[List[Optional[str]]] = None,
) -> Tuple[List[EntityEvidence], List[QuoteEvidence]]:
    """Extract rule-based entities and direct quotes, keeping stance local to attributed quotes."""
    entity_counts: Dict[str, Dict[str, Any]] = {}
    full_text = " ".join(sentences)
    all_known = {**KNOWN_ORGS, **KNOWN_PARTIES}

    def evidence_for(index: int, sentence: str) -> Optional[str]:
        if evidence_sentences is None:
            return sentence
        if index < len(evidence_sentences):
            return evidence_sentences[index]
        return None

    for name, entity_type in {**all_known, **{country: "GPE" for country in KNOWN_COUNTRIES}}.items():
        pattern = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
        matches = list(pattern.finditer(full_text))
        if matches:
            sentence_index = next(
                (index for index, sentence in enumerate(sentences) if pattern.search(sentence)),
                0,
            )
            entity_counts[name] = {
                "type": entity_type,
                "count": len(matches),
                "evidence": evidence_for(sentence_index, sentences[sentence_index]),
            }

    person_patterns = [
        re.compile(
            r"\b(?:President|Prime Minister|Chancellor|Senator|Minister|Secretary|"
            r"Governor|Judge|Dr\.|Mr\.|Mrs\.|Ms\.)\s+"
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b"
        ),
        re.compile(
            rf"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){{1,2}})\s+(?=(?:{ATTRIBUTION_VERBS})\b)"
        ),
        re.compile(
            rf"\b(?:{ATTRIBUTION_VERBS})\b\s*,?\s+"
            r"((?:(?:President|Prime Minister|Chancellor|Senator|Minister|Secretary|"
            r"Governor|Judge|Dr\.|Mr\.|Mrs\.|Ms\.)\s+)?"
            r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})"
        ),
    ]
    for index, sentence in enumerate(sentences):
        for pattern in person_patterns:
            for match in pattern.finditer(sentence):
                person_name = match.group(1).strip()
                if any(token.lower().rstrip(".") in ROLE_WORDS for token in person_name.split()):
                    continue
                if person_name in KNOWN_COUNTRIES or person_name in all_known:
                    continue
                record = entity_counts.setdefault(
                    person_name,
                    {
                        "type": "PERSON",
                        "count": 0,
                        "evidence": evidence_for(index, sentence),
                    },
                )
                record["count"] += 1

    quotes = _extract_quotes(sentences)
    speaker_stances: Dict[str, List[str]] = {}
    for quote in quotes:
        speaker_key = _normalized_name(quote.speaker)
        if speaker_key and speaker_key != "unknown speaker":
            speaker_stances.setdefault(speaker_key, []).append(_stance_from_statement(quote.quote))

    entities: List[EntityEvidence] = []
    for name, data in entity_counts.items():
        entity_key = _normalized_name(name)
        attributed_stances = speaker_stances.get(entity_key, [])
        stance = attributed_stances[0] if attributed_stances else "Unknown"
        if len(set(attributed_stances)) > 1:
            stance = "Unknown"
        entities.append(
            EntityEvidence(
                name=name,
                type=data["type"],
                mentionCount=data["count"],
                stance=stance,
                evidence=data["evidence"][:200] if data["evidence"] else None,
            )
        )

    entities.sort(key=lambda entity: entity.mentionCount, reverse=True)
    return entities[:12], quotes
