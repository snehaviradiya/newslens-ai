import html
import re
from typing import List, Tuple


def clean_and_normalize(text: str) -> str:
    """Combines HTML cleaning and whitespace normalization."""
    return normalize_whitespace(clean_html(text))


def clean_html(text: str) -> str:
    """Strip HTML tags, styles, scripts, and decode common entities."""
    if not text:
        return ""
    # Remove script and style elements
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Decode all standard and numeric HTML entities.
    text = html.unescape(text).replace("\xa0", " ")
    # Collapse multiple spaces while preserving newlines
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def normalize_whitespace(text: str) -> str:
    """Normalize irregular spaces, tabs, and duplicate newlines."""
    if not text:
        return ""
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = [line.strip() for line in text.split("\n")]
    return "\n".join(lines).strip()


def segment_sentences(text: str) -> List[str]:
    """Segment text into individual sentences with boundary preservation and abbreviation protection."""
    if not text:
        return []
    # Clean text first
    cleaned = clean_html(text)
    # Temporarily protect abbreviations that contain sentence-terminal periods.
    abbrevs = [
        "Dr.", "Mr.", "Mrs.", "Ms.", "Sen.", "Rep.", "Gov.", "Gen.", "Col.",
        "Lt.", "Prof.", "Rev.", "St.", "Mt.", "No.", "Nos.", "vs.", "e.g.",
        "i.e.", "U.S.", "U.K.", "E.U.",
    ]
    protected = cleaned
    for idx, abbr in enumerate(abbrevs):
        protected = re.sub(re.escape(abbr), f"__ABBR_{idx}__", protected, flags=re.IGNORECASE)

    # Protect common initials (J. Smith / J.K. Rowling) without changing real text.
    protected = re.sub(r"\b([A-Z])\.", lambda m: f"{m.group(1)}__DOT__", protected)

    # Split only at a terminal followed by whitespace and a new-sentence marker.
    raw_sentences = re.split(r"(?<=[.!?])\s+(?=(?:['\"“‘]?)(?:[A-Z0-9]))", protected)
    sentences = []
    for s in raw_sentences:
        # Restore abbreviations
        for idx, abbr in enumerate(abbrevs):
            s = s.replace(f"__ABBR_{idx}__", abbr)
        s = s.replace("__DOT__", ".")
        s_clean = s.strip()
        if len(s_clean) > 5:
            sentences.append(s_clean)
    return sentences


def source_sentence_fragments(text: str) -> List[str]:
    """Split source text into exact slices, retaining markup and original whitespace."""
    if not text:
        return []

    working = text
    abbreviations = [
        "Dr.", "Mr.", "Mrs.", "Ms.", "Sen.", "Rep.", "Gov.", "Gen.", "Col.",
        "Lt.", "Prof.", "Rev.", "St.", "Mt.", "No.", "Nos.", "vs.", "e.g.",
        "i.e.", "U.S.", "U.K.", "E.U.",
    ]
    for abbreviation in abbreviations:
        working = re.sub(
            re.escape(abbreviation),
            lambda match: match.group(0)[:-1] + "\uE000",
            working,
            flags=re.IGNORECASE,
        )

    # Keep offsets aligned while suppressing boundaries at initials.
    working = re.sub(
        r"\b([A-Z])\.",
        lambda match: match.group(1) + "\uE002",
        working,
    )
    boundaries = list(
        re.finditer(
            r'(?<=[.!?])(?=\s|$|</?(?:p|div|li|br)\b)',
            working,
            flags=re.IGNORECASE,
        )
    )
    fragments: List[str] = []
    start = 0
    for boundary in boundaries:
        end = boundary.start()
        fragment = text[start:end].strip()
        if fragment:
            fragments.append(fragment)
        start = boundary.end()
    final_fragment = text[start:].strip()
    if final_fragment:
        fragments.append(final_fragment)
    return fragments


def preprocess_article(headline: str, content: str) -> Tuple[str, str, List[str]]:
    """
    Cleans and normalizes headline and content.
    Returns: (cleaned_headline, cleaned_content, list_of_sentences)
    """
    cleaned_headline = clean_html(headline)
    cleaned_headline = re.sub(r"\s+", " ", cleaned_headline).strip()

    cleaned_content = clean_html(content)
    cleaned_content = normalize_whitespace(cleaned_content)

    sentences = segment_sentences(cleaned_content)
    return cleaned_headline, cleaned_content, sentences
