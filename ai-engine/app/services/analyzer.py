"""
Main analysis orchestrator for NewsLens AI.
Combines preprocessing, headline analysis, sentiment, entities, quotes, topics, framing, and political signals.
"""
from app.schemas.analysis import ArticleAnalysisRequest, ArticleAnalysisResponse
from app.services.preprocessing import (
    clean_and_normalize,
    segment_sentences,
    source_sentence_fragments,
)
from app.services.sentiment import analyze_headline, analyze_sentiment_and_tone
from app.services.entities import extract_entities_and_quotes
from app.services.topics import classify_topics
from app.services.framing import analyze_framing
from app.services.political import detect_political_signals


def analyze_article(request: ArticleAnalysisRequest) -> ArticleAnalysisResponse:
    """
    Performs full multi-dimensional NLP and framing analysis on an article.
    """
    clean_content = clean_and_normalize(request.content)
    clean_headline = clean_and_normalize(request.headline)

    sentences = segment_sentences(clean_content)
    source_fragments = source_sentence_fragments(request.content)
    source_by_cleaned_text = {
        clean_and_normalize(fragment): fragment
        for fragment in source_fragments
        if clean_and_normalize(fragment)
    }
    evidence_sentences = [source_by_cleaned_text.get(sentence) for sentence in sentences]

    # Sentiment, Subjectivity, Tone
    sentiment_score, subjectivity_score, tone = analyze_sentiment_and_tone(sentences)

    # Headline analysis
    headline_sentiment, headline_sensationalism = analyze_headline(clean_headline)

    # Entities and Quotes
    entities, quotes = extract_entities_and_quotes(sentences, evidence_sentences)
    # Decoded HTML can change quote text (for example, &amp; becomes &). Only
    # return a quote when its extracted text is an exact substring of the input.
    quotes = [
        quote
        for quote in quotes
        if quote.quote in request.content
    ]

    # Topics
    topics = classify_topics(clean_content, sentences)

    # Framing Dimensions
    framing_scores, framing_evidence = analyze_framing(sentences, evidence_sentences)

    # Political Signals
    political_signals = detect_political_signals(sentences, evidence_sentences)

    return ArticleAnalysisResponse(
        articleId=request.articleId,
        headline=clean_headline,
        modelVersion="1.0.0",
        headlineSentiment=headline_sentiment,
        headlineSensationalism=headline_sensationalism,
        overallTone=tone,
        subjectivityScore=subjectivity_score,
        framingScores=framing_scores,
        entities=entities,
        quotes=quotes,
        topics=topics,
        politicalSignals=political_signals,
        supportingEvidence=framing_evidence,
        metadata={
            "sourceName": request.sourceName or "Unknown Source",
            "sentenceCount": str(len(sentences)),
            "contentLength": str(len(clean_content)),
            "analysisMethod": "deterministic lexical and structural extraction",
        },
        limitations=[
            "Analysis represents automated algorithmic observation of lexical and structural features.",
            "Framing scores reflect presence of communication markers, not subjective editorial validation.",
            "Scores do not measure outlet-level bias or author intent.",
            "Named entities and stance observations are rule-based and may miss or misclassify entities.",
            "No pretrained language model is required or used by the basic analysis engine.",
        ]
    )
