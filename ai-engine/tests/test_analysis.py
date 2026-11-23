"""Tests for AI Engine NLP Services (sentiment, framing, topics, entities, political, similarity)."""
import pytest
from app.schemas.analysis import ArticleAnalysisRequest
from app.services.sentiment import analyze_headline, analyze_sentiment_and_tone
from app.services.entities import extract_entities_and_quotes
from app.services.topics import classify_topics
from app.services.framing import analyze_framing
from app.services.political import detect_political_signals
from app.services.similarity import calculate_similarity
from app.services.analyzer import analyze_article


def test_headline_sensationalism():
    sensational = "SENATE SLAMS OPPONENTS IN SHOCKING NIGHTMARE CLASH!"
    neutral = "Senate passes bipartisan infrastructure spending bill"

    _, sens_score = analyze_headline(sensational)
    _, neut_score = analyze_headline(neutral)

    assert sens_score > 0.4
    assert neut_score < 0.2


def test_sentiment_and_tone():
    positive_sents = [
        "The economic recovery achieved an unprecedented milestone and historic growth.",
        "Officials welcomed the constructive breakthrough and praised international cooperation."
    ]
    sentiment, subjectivity, tone = analyze_sentiment_and_tone(positive_sents)
    assert sentiment > 0.2
    assert tone in ["ADVOCATING", "BALANCED", "NEUTRAL"]

    critical_sents = [
        "The severe crisis sparked outrage over government corruption and catastrophic failure.",
        "Opposition leaders condemn the reckless decline and disastrous shortfall."
    ]
    crit_sentiment, crit_subj, crit_tone = analyze_sentiment_and_tone(critical_sents)
    assert crit_sentiment < -0.2
    assert crit_tone in ["CRITICAL", "ALARMIST"]


def test_named_entities_and_quotes():
    sentences = [
        'President Joe Biden met with United Nations officials in the United States.',
        '"We will deliver sustainable economic recovery for all citizens," stated Joe Biden.',
        'The Democratic Party applauded the decision, while Republicans expressed hesitation.'
    ]
    entities, quotes = extract_entities_and_quotes(sentences)

    ent_names = [e.name for e in entities]
    assert "United Nations" in ent_names
    assert "United States" in ent_names
    assert len(quotes) >= 1
    assert "sustainable economic recovery" in quotes[0].quote


def test_framing_dimensions():
    conflict_sentences = [
        "A fierce political battle and bitter standoff divided rival lawmakers today.",
        "The hostile clash between party opponents escalated into open dispute."
    ]
    scores, evidence = analyze_framing(conflict_sentences)
    assert scores.conflict > 0.4
    assert len(evidence) > 0
    assert evidence[0].frame == "Conflict Frame"
    assert "battle" in evidence[0].location or "clash" in evidence[0].location


def test_topic_classification():
    text = "The Federal Reserve discussed inflation, interest rates, GDP growth, and Wall Street debt markets."
    topics = classify_topics(text, [text])
    assert len(topics) > 0
    assert topics[0].topic == "Economy & Finance"
    assert topics[0].score > 0.0


def test_political_signals():
    sentences = [
        "The bipartisan legislation faced fierce opposition from Democrats and Republicans in the swing state."
    ]
    signals = detect_political_signals(sentences)
    assert len(signals) >= 1
    types = [s.signalType for s in signals]
    assert "PartyReference" in types or "CampaignRhetoric" in types


def test_semantic_similarity():
    text1 = "Global oil prices surged following international sanctions and shipping route disruptions in the Middle East."
    text2 = "Crude oil markets spiked sharply today as geopolitical sanctions halted Middle East tanker transport."
    text3 = "Children returned to elementary schools today with new art curricula and playground renovations."

    sim_high = calculate_similarity(text1, text2)
    sim_low = calculate_similarity(text1, text3)

    assert sim_high.score > sim_low.score
    assert len(sim_high.sharedTerms) > 0


def test_full_article_analyzer():
    request = ArticleAnalysisRequest(
        articleId="art-123",
        headline="Congress Clashes Over National Healthcare Budget Amid Economic Deficit",
        content="Lawmakers engaged in a heated dispute over healthcare funding. The White House warned that hospital costs could soar. 'We cannot compromise patient care,' stated Dr. Thorne. The Republican Party argued the price tag was unaffordable, while Democrats demanded immediate action.",
        sourceName="The Daily Chronicle"
    )
    result = analyze_article(request)

    assert result.articleId == "art-123"
    assert result.framingScores.conflict > 0.0
    assert result.framingScores.economic > 0.0
    assert len(result.entities) > 0
    assert len(result.quotes) > 0
    assert len(result.topics) > 0
    assert len(result.limitations) > 0


def test_article_evidence_is_grounded_in_supplied_content():
    request = ArticleAnalysisRequest(
        headline="Budget talks remain unresolved",
        content="Lawmakers disputed the budget today. The economic cost reached five billion dollars. "
                "A family said the cuts were devastating.",
        sourceName="Test Source",
    )
    result = analyze_article(request)

    for snippet in result.supportingEvidence:
        assert snippet.excerpt in request.content


def test_dr_title_person_and_quote_attribution():
    sentences = [
        "Dr. Thorne discussed patient care.",
        '"We cannot compromise patient care," said Dr. Thorne.',
    ]
    entities, quotes = extract_entities_and_quotes(sentences)
    assert "Thorne" in [entity.name for entity in entities]
    assert len(quotes) == 1
    assert quotes[0].speaker == "Dr. Thorne"
    assert quotes[0].quote == "We cannot compromise patient care"


def test_official_designation_is_not_person_and_name_is_extracted():
    sentences = [
        "The Education Minister announced the policy.",
        "Education Minister Jane Doe said, \"I support the new program.\"",
    ]
    entities, _ = extract_entities_and_quotes(sentences)

    people = [entity.name for entity in entities if entity.type == "PERSON"]
    assert people == ["Jane Doe"]


def test_entity_stance_comes_only_from_the_attributed_statement():
    cases = [
        ('"I support this plan," said Jane Doe.', "Supportive"),
        ('"I oppose this plan," said Jane Doe.', "Critical"),
        ('"I remain neutral on this plan," said Jane Doe.', "Neutral"),
        ('"I do not support this plan," said Jane Doe.', "Unknown"),
        ('"The meeting starts Tuesday," said Jane Doe.', "Unknown"),
    ]
    for attributed_statement, expected_stance in cases:
        sentences = [
            "Critics condemned the separate proposal.",
            attributed_statement,
        ]
        entities, _ = extract_entities_and_quotes(sentences)
        jane = next(entity for entity in entities if entity.name == "Jane Doe")
        assert jane.stance == expected_stance


def test_html_analysis_evidence_is_an_exact_original_text_substring():
    request = ArticleAnalysisRequest(
        headline="Budget talks continue",
        content="<p>Lawmakers disputed the budget today.</p><p>The economic cost increased.</p>",
    )
    result = analyze_article(request)

    assert result.supportingEvidence
    for evidence in result.supportingEvidence:
        assert evidence.excerpt in request.content


def test_all_excerpts_and_quotes_are_grounded_in_original_html_input():
    request = ArticleAnalysisRequest(
        headline="Lawmakers debate the budget",
        content=(
            "<p>Democrats clashed with Republicans over the budget.</p>"
            "<p>\"I oppose the proposal,\" said Jane Doe.</p>"
            "<p>The United States Congress announced policy changes.</p>"
        ),
    )
    result = analyze_article(request)

    assert result.supportingEvidence
    assert result.politicalSignals
    assert result.entities
    assert result.quotes
    assert all(item.excerpt in request.content for item in result.supportingEvidence)
    assert all(item.supportingExcerpt in request.content for item in result.politicalSignals)
    assert all(entity.evidence is None or entity.evidence in request.content for entity in result.entities)
    assert all(quote.quote in request.content for quote in result.quotes)


def test_html_entity_decoding_does_not_create_a_nonverbatim_quote():
    request = ArticleAnalysisRequest(
        headline="Officials discuss policy",
        content='<p>"We support this &amp; that proposal for everyone." said Jane Doe.</p>',
    )
    result = analyze_article(request)
    assert all(quote.quote in request.content for quote in result.quotes)


def test_sentiment_recognizes_clear_outcome_words_but_keeps_factual_copy_neutral():
    positive, _, positive_tone = analyze_sentiment_and_tone(
        ["The program improved access and saved thousands of jobs."]
    )
    negative, _, negative_tone = analyze_sentiment_and_tone(
        ["The project failed and disrupted essential services."]
    )
    neutral, _, neutral_tone = analyze_sentiment_and_tone(
        ["The agency released its annual report on Tuesday."]
    )

    assert positive > 0
    assert positive_tone == "ADVOCATING"
    assert negative < 0
    assert negative_tone == "CRITICAL"
    assert neutral == 0
    assert neutral_tone == "NEUTRAL"


def test_similarity_normalizes_html_and_plural_forms():
    left = calculate_similarity("<p>Markets saw rising prices and sanctions.</p>", "market price")
    right = calculate_similarity("Markets saw rising prices and sanctions.", "market price")
    assert left.score == right.score
    assert {"market", "price"}.issubset(left.sharedTerms)
