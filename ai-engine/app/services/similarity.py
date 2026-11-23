"""
Semantic similarity and token-vector matching service for NewsLens AI.
Computes article-to-article semantic overlap for story clustering, duplicate detection,
and cross-source framing comparisons.
"""
from typing import List, Set
import re
import math
from collections import Counter
import unicodedata
from app.schemas.analysis import SimilarityResponse
from app.services.preprocessing import clean_and_normalize

STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
    "youre", "you've", "your", "yours", "yourself", "yourselves",
    "according", "article", "news", "new", "report", "reports", "said", "today",
    "year", "years", "official", "officials"
}


def _tokenize(text: str) -> List[str]:
    """Normalize text, remove common words, and reduce simple English plurals."""
    normalized = unicodedata.normalize("NFKC", clean_and_normalize(text)).casefold()
    words = re.findall(r"\b[^\W_]{3,}\b", normalized, flags=re.UNICODE)
    tokens = []
    for word in words:
        if word in STOPWORDS:
            continue
        if len(word) > 4 and word.endswith("ies"):
            word = word[:-3] + "y"
        elif len(word) > 4 and word.endswith("s") and not word.endswith(("ss", "us", "is")):
            word = word[:-1]
        tokens.append(word)
    return tokens


def _cosine_similarity(vec1: Counter, vec2: Counter) -> float:
    """Calculate cosine similarity between two term-frequency vectors."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])

    sum1 = sum([val ** 2 for val in vec1.values()])
    sum2 = sum([val ** 2 for val in vec2.values()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0
    return float(numerator) / denominator


def calculate_similarity(text1: str, text2: str) -> SimilarityResponse:
    """
    Computes semantic similarity score (0.0 to 1.0) and identifies common key terms.
    """
    tokens1 = _tokenize(text1)
    tokens2 = _tokenize(text2)

    if not tokens1 or not tokens2:
        return SimilarityResponse(
            score=0.0,
            method="token_frequency_cosine",
            sharedTerms=[]
        )

    vec1 = Counter(tokens1)
    vec2 = Counter(tokens2)

    cos_sim = _cosine_similarity(vec1, vec2)
    score = round(min(1.0, max(0.0, cos_sim)), 3)

    common_terms = set(vec1.keys()) & set(vec2.keys())
    ranked_common = sorted(common_terms, key=lambda t: vec1[t] + vec2[t], reverse=True)[:6]

    return SimilarityResponse(
        score=score,
        method="token_frequency_cosine",
        sharedTerms=ranked_common
    )
