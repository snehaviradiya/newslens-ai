"""
FastAPI application for NewsLens AI NLP & Framing Analysis Service.
Exposes endpoints for health check, article analysis, batch processing, and semantic similarity comparison.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.schemas.analysis import (
    ArticleAnalysisRequest,
    ArticleAnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    SimilarityRequest,
    SimilarityResponse,
)
from app.services.analyzer import analyze_article
from app.services.similarity import calculate_similarity

app = FastAPI(
    title="NewsLens AI Analysis Engine",
    description="Evidence-based news bias, framing, sentiment, and NLP analysis service",
    version="1.0.0",
)

# Enable CORS for local cross-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> Dict[str, Any]:
    """Health check endpoint for container probes and backend connectivity checks."""
    return {
        "status": "ok",
        "service": "newslens-ai-engine",
        "version": "1.0.0",
        "capabilities": [
            "sentiment_and_subjectivity",
            "communication_science_framing",
            "named_entity_recognition",
            "quoted_speaker_extraction",
            "topic_classification",
            "headline_sensationalism",
            "political_signal_detection",
            "semantic_similarity"
        ]
    }


@app.post("/api/v1/analyze", response_model=ArticleAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_single_article(request: ArticleAnalysisRequest) -> ArticleAnalysisResponse:
    """
    Performs full multi-dimensional NLP and framing analysis on a single news article.
    """
    try:
        return analyze_article(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/v1/analyze/batch", response_model=BatchAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_batch_articles(batch: BatchAnalysisRequest) -> BatchAnalysisResponse:
    """
    Performs analysis on multiple articles in batch.
    """
    if not batch.articles:
        return BatchAnalysisResponse(totalProcessed=0, analyses=[])

    analyses = []
    for req in batch.articles:
        try:
            analyses.append(analyze_article(req))
        except Exception:
            continue

    return BatchAnalysisResponse(totalProcessed=len(analyses), analyses=analyses)


@app.post("/api/v1/similarity", response_model=SimilarityResponse, status_code=status.HTTP_200_OK)
def compare_articles_similarity(request: SimilarityRequest) -> SimilarityResponse:
    """
    Compares two articles or passages to compute semantic similarity.
    """
    try:
        return calculate_similarity(request.textA, request.textB)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Similarity calculation failed: {str(e)}"
        )
