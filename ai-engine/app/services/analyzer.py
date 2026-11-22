"""
Main analysis orchestrator for NewsLens AI.
Combines preprocessing, headline analysis, sentiment, entities, quotes, topics, framing, and political signals.
"""
from app.schemas.analysis import ArticleAnalysisRequest, ArticleAnalysisResponse
from app.services.preprocessing import clean_and_normalize, segment_sentences
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
    if not sentences and clean_headline:
        sentences = [clean_headline]

    # Sentiment, Subjectivity, Tone
    sentiment_score, subjectivity_score, tone = analyze_sentiment_and_tone(sentences)

    # Headline analysis
    headline_sentiment, headline_sensationalism = analyze_headline(clean_headline)

    # Entities and Quotes
    entities, quotes = extract_entities_and_quotes(sentences)

    # Topics
    topics = classify_topics(clean_content, sentences)

    # Framing Dimensions
    framing_scores, framing_evidence = analyze_framing(sentences)

    # Political Signals
    political_signals = detect_political_signals(sentences)

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
        },
        limitations=[
            "Analysis represents automated algorithmic observation of lexical and structural features.",
            "Framing scores reflect presence of communication markers, not subjective editorial validation."
        ]
    )
