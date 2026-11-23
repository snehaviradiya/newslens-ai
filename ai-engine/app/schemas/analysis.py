from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class FramingScores(BaseModel):
    conflict: float = Field(..., ge=0.0, le=1.0, description="Emphasis on political disputes, polarization, or opposition")
    economic: float = Field(..., ge=0.0, le=1.0, description="Emphasis on financial costs, trade, taxes, inflation, or fiscal impact")
    humanInterest: float = Field(..., ge=0.0, le=1.0, description="Emphasis on personal stories, community suffering, or human empathy")
    morality: float = Field(..., ge=0.0, le=1.0, description="Emphasis on ethical principles, human rights, or moral duties")
    responsibility: float = Field(..., ge=0.0, le=1.0, description="Assigning accountability, blame, failure, or policy credit to actors")


class EntityEvidence(BaseModel):
    name: str
    type: str  # PERSON, ORG, GPE, POL_PARTY
    mentionCount: int
    stance: str  # Supportive, Critical, Neutral, Unknown
    evidence: Optional[str] = None


class QuoteEvidence(BaseModel):
    speaker: str
    quote: str
    affiliation: Optional[str] = None


class TopicEvidence(BaseModel):
    topic: str
    score: float
    supportingText: Optional[str] = None


class PoliticalSignal(BaseModel):
    signalType: str  # PartyReference, GovernmentAction, CampaignRhetoric, PolicyDebate
    observation: str
    supportingExcerpt: str


class EvidenceSnippet(BaseModel):
    frame: str
    excerpt: str
    location: Optional[str] = None


class ArticleAnalysisRequest(BaseModel):
    articleId: Optional[str] = None
    headline: str = Field(..., min_length=3, description="Article headline")
    content: str = Field(..., min_length=15, description="Article body content")
    sourceName: Optional[str] = Field("Unknown Source", description="Publishing outlet name")

    @field_validator("headline", "content")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Text fields must contain meaningful content")
        return value.strip()


class ArticleAnalysisResponse(BaseModel):
    articleId: Optional[str] = None
    headline: str
    modelVersion: str = "1.0.0"
    headlineSentiment: float = Field(..., ge=-1.0, le=1.0)
    headlineSensationalism: float = Field(..., ge=0.0, le=1.0)
    overallTone: str  # NEUTRAL, CRITICAL, ADVOCATING, ALARMIST, BALANCED
    subjectivityScore: float = Field(..., ge=0.0, le=1.0)
    framingScores: FramingScores
    entities: List[EntityEvidence]
    quotes: List[QuoteEvidence]
    topics: List[TopicEvidence]
    politicalSignals: List[PoliticalSignal]
    supportingEvidence: List[EvidenceSnippet]
    metadata: Dict[str, str] = Field(default_factory=dict)
    limitations: List[str] = Field(default_factory=list)


class BatchAnalysisRequest(BaseModel):
    articles: List[ArticleAnalysisRequest]


class BatchAnalysisResponse(BaseModel):
    totalProcessed: int
    analyses: List[ArticleAnalysisResponse]


class SimilarityRequest(BaseModel):
    textA: str
    textB: str


class SimilarityResponse(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0)
    method: str
    sharedTerms: List[str] = Field(default_factory=list)
