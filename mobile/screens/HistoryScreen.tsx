// Analysis History Screen with Empty State & Saved Inspections

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MOCK_ANALYSES } from '../constants/mockData';
import { ArticleAnalysis } from '../types/models';

export const HistoryScreen: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<ArticleAnalysis[]>(MOCK_ANALYSES);

  const handleClearHistory = () => {
    setHistoryItems([]);
  };

  const handleRestoreSample = () => {
    setHistoryItems(MOCK_ANALYSES);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Analysis History"
        subtitle="Review past article inspections and framing breakdowns"
        rightAction={
          historyItems.length > 0 ? (
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {historyItems.length === 0 ? (
          <EmptyState
            title="No Past Analyses Found"
            message="You haven't run any article framing inspections yet. Paste an article link or headline to evaluate framing nuances."
            actionTitle="Load Sample Data"
            onAction={handleRestoreSample}
          />
        ) : (
          <View style={styles.list}>
            {historyItems.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.topRow}>
                  <View style={styles.sourcePill}>
                    <Text style={styles.sourceText}>{item.sourceName}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <Text style={styles.title}>{item.articleTitle}</Text>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Assessed Tone</Text>
                    <Text style={styles.metricValue}>{item.overallTone}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Conflict</Text>
                    <Text style={styles.metricValue}>{Math.round(item.framingScores.conflict * 100)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Economic</Text>
                    <Text style={styles.metricValue}>{Math.round(item.framingScores.economic * 100)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Responsibility</Text>
                    <Text style={styles.metricValue}>{Math.round(item.framingScores.responsibility * 100)}%</Text>
                  </View>
                </View>

                {item.supportingEvidence && item.supportingEvidence[0] ? (
                  <View style={styles.evidenceSnippet}>
                    <Text style={styles.evidenceText} numberOfLines={2}>
                      Excerpt: "{item.supportingEvidence[0].excerpt}"
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  clearText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.negative,
    fontWeight: '600',
  },
  list: {
    width: '100%',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sourcePill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  sourceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  evidenceSnippet: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },
  evidenceText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
});
