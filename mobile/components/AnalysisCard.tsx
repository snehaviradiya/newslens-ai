// Analysis Result Card with Framing Spectrum & Grounded Evidence

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { ArticleAnalysis } from '../types/models';

export interface AnalysisCardProps {
  analysis: ArticleAnalysis;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const { framingScores } = analysis;

  const renderFrameBar = (label: string, score: number, color: string) => {
    const percentage = Math.round(score * 100);
    return (
      <View key={label} style={styles.frameRow}>
        <View style={styles.frameLabelContainer}>
          <Text style={styles.frameLabel}>{label}</Text>
          <Text style={styles.frameValue}>{percentage}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {analysis.isDemo ? (
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>Synthetic development fixture — this is not a live article analysis.</Text>
        </View>
      ) : null}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Framing Dimension Spectrum</Text>
        <Text style={styles.sectionSubtitle}>
          Measures linguistic emphasis across communication frames (not an ideological rating).
        </Text>
      </View>

      <View style={styles.spectrumCard}>
        {renderFrameBar('Conflict & Controversy', framingScores.conflict, COLORS.frameConflict)}
        {renderFrameBar('Economic Impact', framingScores.economic, COLORS.frameEconomic)}
        {renderFrameBar('Human Interest & Emotion', framingScores.humanInterest, COLORS.frameHumanInterest)}
        {renderFrameBar('Morality & Ethical Duty', framingScores.morality, COLORS.frameMorality)}
        {renderFrameBar('Attribution of Blame / Credit', framingScores.responsibility, COLORS.frameResponsibility)}
      </View>

      {/* Tone & Subjectivity Overview */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Headline Sentiment</Text>
          <Text style={[styles.metricValue, { color: analysis.headlineSentiment >= 0 ? COLORS.positive : COLORS.negative }]}>
            {analysis.headlineSentiment > 0 ? `+${analysis.headlineSentiment}` : `${analysis.headlineSentiment}`}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Subjectivity Rating</Text>
          <Text style={styles.metricValue}>{Math.round(analysis.subjectivityScore * 100)}%</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Assessed Tone</Text>
          <Text style={[styles.metricValue, { color: COLORS.primary }]}>{analysis.overallTone}</Text>
        </View>
      </View>

      {/* Cited Textual Evidence */}
      {analysis.supportingEvidence && analysis.supportingEvidence.length > 0 ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Grounded Textual Evidence</Text>
          <Text style={styles.sectionSubtitle}>
            Specific article excerpts that triggered framing classifications.
          </Text>
          {analysis.supportingEvidence.map((ev, index) => (
            <View key={index} style={styles.evidenceBox}>
              <View style={styles.evidenceTag}>
                <Text style={styles.evidenceTagText}>{ev.frame.toUpperCase()} FRAME</Text>
              </View>
              <Text style={styles.evidenceQuote}>"{ev.excerpt}"</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Quoted Voices & Attributions */}
      {analysis.quotes && analysis.quotes.length > 0 ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Attributed Stakeholder Quotes</Text>
          {analysis.quotes.map((q, index) => (
            <View key={index} style={styles.quoteCard}>
              <Text style={styles.speakerText}>— {q.speaker} {q.affiliation ? `(${q.affiliation})` : ''}</Text>
              <Text style={styles.quoteBody}>"{q.quote}"</Text>
            </View>
          ))}
        </View>
      ) : null}

      {analysis.entities?.length ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Extracted Entities</Text>
          {analysis.entities.map((entity, index) => (
            <Text key={`${entity.name}-${index}`} style={styles.detailLine}>
              {entity.name} · {entity.type} · {entity.mentionCount} mention{entity.mentionCount === 1 ? '' : 's'} · {entity.stance}
            </Text>
          ))}
        </View>
      ) : null}

      {analysis.topics?.length ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Topics</Text>
          {analysis.topics.map((topic, index) => (
            <Text key={`${topic.topic}-${index}`} style={styles.detailLine}>
              {topic.topic} · {Math.round(topic.score * 100)}%{topic.supportingText ? ` · ${topic.supportingText}` : ''}
            </Text>
          ))}
        </View>
      ) : null}

      {analysis.politicalSignals?.length ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Observed Political Signals</Text>
          {analysis.politicalSignals.map((signal, index) => (
            <View key={`${signal.signalType}-${index}`} style={styles.evidenceBox}>
              <Text style={styles.detailLine}>{signal.signalType}: {signal.observation}</Text>
              <Text style={styles.evidenceQuote}>“{signal.supportingExcerpt}”</Text>
            </View>
          ))}
        </View>
      ) : null}

      {analysis.limitations?.length ? (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionTitle}>Method Limitations</Text>
          {analysis.limitations.map((limitation, index) => <Text key={index} style={styles.detailLine}>• {limitation}</Text>)}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  demoNotice: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  demoNoticeText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#92400E',
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  spectrumCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  frameRow: {
    marginBottom: SPACING.md,
  },
  frameLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  frameLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  frameValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSubtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 3,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  evidenceSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  evidenceBox: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  evidenceTag: {
    backgroundColor: COLORS.primaryMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  evidenceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  evidenceQuote: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  quoteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  speakerText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  quoteBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  detailLine: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 19,
  },
});
