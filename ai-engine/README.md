# NewsLens AI — AI/NLP Analysis Engine Service

The NewsLens AI analysis engine is a modular FastAPI service that reports lexical and structural signals from supplied article text. It uses deterministic rules and does not use a pretrained language model.

## Analysis Philosophy & Design Principles

The engine analyzes article text and does not assign political bias scores to news organizations:
1. **Traceable evidence**: Framing and political-signal excerpts are copied from the supplied text. Sentiment, topic, and similarity values are lexical heuristics, not individually validated findings.
2. **Communication-Science Framing**: Assesses the 5 standard news framing dimensions:
   - **Conflict Frame**: Political battles, clashes, zero-sum opposition, and disputes.
   - **Economic Consequences Frame**: Costs, inflation, tax impacts, fiscal burden, and market outcomes.
   - **Human Interest Frame**: Personal narratives, community suffering, emotional resonance, and empathy.
   - **Morality & Ethics Frame**: Moral imperatives, ethical obligations, justice, and human rights.
   - **Attribution of Responsibility Frame**: Assigning credit, fault, culpability, or institutional accountability.
3. **Multi-Aspect Linguistic Signals**:
   - Headline sensationalism scoring (detecting clickbait hyperbolic verbs, all-caps, and punctuation markers).
   - Sentence-level sentiment (-1.0 to 1.0) and subjectivity (0.0 to 1.0).
   - Tone classification (`NEUTRAL`, `CRITICAL`, `ADVOCATING`, `ALARMIST`, `BALANCED`).
   - Rule-based named-entity candidates (Person, Organization, Geopolitical entity, Political Party); speaker stance is reported only when a recognized quote contains a clear stance marker.
   - Direct quote and attributed speaker extraction.
   - Domain topic categorization (Economy, Governance, Healthcare, Environment, Technology, Justice, Education).
   - Observable political signal detection (Party references, Electoral strategy, Policy debates, Government actions).
   - Token-frequency cosine similarity. This is lexical overlap, not semantic understanding or an event-clustering result.

These rules can miss names and context, confuse capitalization or ambiguous terms, and misread negation, quotation, irony, or polysemy. Sentiment, subjectivity, sensationalism, topic, and framing scores are not calibrated probabilities or proof of author intent. Political signals indicate only that listed terms were found; they do not establish political motivation. Outputs should be reviewed against the original article.

---

## Directory Structure

```
ai-engine/
├── app/
│   ├── main.py                  # FastAPI application and route handlers
│   ├── schemas/
│   │   └── analysis.py          # Pydantic v2 data models for requests & responses
│   └── services/
│       ├── analyzer.py          # Analysis orchestrator combining all NLP modules
│       ├── preprocessing.py     # HTML cleaning, normalization, sentence segmentation
│       ├── sentiment.py         # Lexical sentiment, subjectivity & headline sensationalism
│       ├── framing.py           # 5-dimensional framing evaluation & evidence extraction
│       ├── entities.py          # Rule-based entity candidates & quote attribution
│       ├── topics.py            # Topic domain classifier & keyword evidence
│       ├── political.py         # Observable political signals & policy debate detection
│       └── similarity.py        # Token-frequency cosine similarity
├── tests/
│   ├── test_preprocessing.py   # Text cleaning & segmentation unit tests
│   ├── test_analysis.py        # NLP analysis services unit tests
│   └── test_api.py             # FastAPI HTTP endpoints integration tests
├── requirements.txt             # Python dependencies
└── .env.example                 # Environment configuration template
```

---

## Local Setup & Execution

### 1. Prerequisites
- Python 3.9 or newer installed (the current code is compatible with Python 3.9)
- Virtual environment tool

### 2. Virtual Environment & Dependencies
```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Running the Service
```bash
# From ai-engine directory:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Or from project root with PYTHONPATH:
PYTHONPATH=ai-engine ai-engine/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Running the Automated Test Suite
```bash
# From project root:
PYTHONPATH=ai-engine ai-engine/.venv/bin/pytest ai-engine/tests -v
```
From inside `ai-engine/`, use `PYTHONPATH=. .venv/bin/pytest tests -q`.

---

## API Endpoints Reference

### 1. Health Check
`GET /health`
```json
{
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
```

### 2. Single Article Analysis
`POST /api/v1/analyze`

The request accepts optional `articleId` and `sourceName`, plus required `headline` (at least 3 nonblank characters) and `content` (at least 15 nonblank characters). The response schema is defined in `app/schemas/analysis.py`; returned values are produced by the current rules and should not be treated as validated model predictions.

### 3. Batch Article Analysis
`POST /api/v1/analyze/batch`
Processes up to multiple articles sequentially, returning aggregated analyses.

### 4. Semantic Similarity Comparison
`POST /api/v1/similarity`

Accepts `textA` and `textB`, and returns a score from token-frequency cosine similarity, the method name, and shared terms. It is not a pretrained embedding or semantic similarity model.

---

## Integration with Express Backend

The Express backend (`backend/src/config/env.ts`) configures `AI_ENGINE_URL` (default: `http://localhost:8000`) and a request timeout. Its article analysis route forwards text to `POST /api/v1/analyze` and returns the response. It currently does not persist the result to Prisma `ArticleAnalysis`; URL-only article fetching is also not implemented.
