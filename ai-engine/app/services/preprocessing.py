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
    # Decode entities
    text = (
        text.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
    )
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
    # Temporarily protect common abbreviations with periods
    abbrevs = ["Dr.", "Mr.", "Mrs.", "Ms.", "Sen.", "Rep.", "Gov.", "Gen.", "Col.", "U.S.", "No.", "vs.", "e.g.", "i.e."]
    protected = cleaned
    for idx, abbr in enumerate(abbrevs):
        protected = protected.replace(abbr, f"__ABBR_{idx}__")

    # Split on sentence terminals (. ! ?) followed by whitespace or quote
    raw_sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'\‘\“])', protected)
    sentences = []
    for s in raw_sentences:
        # Restore abbreviations
        for idx, abbr in enumerate(abbrevs):
            s = s.replace(f"__ABBR_{idx}__", abbr)
        s_clean = s.strip()
        if len(s_clean) > 5:
            sentences.append(s_clean)
    return sentences


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
