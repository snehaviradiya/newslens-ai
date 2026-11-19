# NewsLens AI — AI & NLP Engine

## Overview

The `ai-engine/` module is an independent Python service powered by **FastAPI** and **Hugging Face Transformers**. It executes multi-dimensional NLP and machine learning pipelines to analyze individual news articles for framing, sentiment, tone, entities, quotes, topics, and observable political language.

Crucially, the engine does **not** attach rigid, blanket bias labels to news outlets. Instead, it produces granular, evidence-based metrics tied directly to specific text excerpts and stylistic choices within individual articles.

## Planned Technology Stack

- **Framework:** FastAPI with Uvicorn ASGI server
- **Language:** Python 3.10+
- **NLP / ML Frameworks:** Hugging Face Transformers, PyTorch, spaCy / NLTK, Scikit-learn
- **Task Pipelines:**
  - **Entity Extraction (NER):** Extracting key political figures, organizations, and locations
  - **Topic Modeling & Keyword Salience:** Identifying central themes and recurring motifs
  - **Sentiment & Emotional Tone Analysis:** Examining valence, subjectivity, and affective language
  - **Framing Analysis:** Detecting thematic vs. episodic framing, conflict/economic/morality frames
  - **Quote & Source Attribution:** Identifying which stakeholders are quoted and the framing of their remarks
  - **Semantic Similarity & Event Matching:** Sentence-Transformers for vector embeddings and article clustering
- **Validation:** Pydantic models for strict input/output contract enforcement

## Analytical Methodology

1. **Evidence Grounding:** Every analytical score (framing tone, sentiment, entity stance) must cite the corresponding article sentences as supporting evidence.
2. **Article-Level Granularity:** Analysis reflects the specific piece of writing, recognizing variance within any single publication.
3. **Cross-Source Comparison:** Differential analysis highlighting what one source emphasizes, omits, or re-contextualizes relative to another.

## Development Schedule

- **Scheduled AI Engine Implementation Date:** 23 November 2026
- **Scheduled Cross-Source Comparison Date:** 24 November 2026
- **Deliverables:**
  - FastAPI service structure and Pydantic schemas
  - Preprocessing and text cleaning pipeline
  - Hugging Face model integration for NER, sentiment/tone, and framing classification
  - Semantic clustering and cross-article divergence detection
