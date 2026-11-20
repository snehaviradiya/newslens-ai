// Cross-Source News Comparison Screen with Side-by-Side Perspectives

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MOCK_COMPARISON } from '../constants/mockData';
import { ArticleComparison } from '../types/models';

export const ComparisonScreen: React.FC = () => {
  const [comparison] = useState<ArticleComparison>(MOCK_COMPARISON);
  const [activeTab, setActiveTab] = useState<'headlines' | 'framing' | 'quotes'>('headlines');

  const { articleA, articleB, analysisA, analysisB } = comparison;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Perspective Comparison"
        subtitle="Compare coverage of identical events across competing outlets"
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Event Header Banner */}
        <View style={styles.eventBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>SHARED EVENT CLUSTER</Text>
            </View>
            <View style={styles.overlapBadge}>
              <Text style={styles.overlapBadgeText}>58% Factual Overlap</Text>
            </View>
          </View>
          <Text style={styles.eventTitle}>{comparison.eventTitle}</Text>
        </View>

        {/* View Mode Switcher */}
        <View style={styles.tabSwitcher}>
          <AppButton
            title="Headlines"
            onPress={() => setActiveTab('headlines')}
            variant={activeTab === 'headlines' ? 'primary' : 'secondary'}
            size="sm"
            style={styles.tabButton}
          />
          <AppButton
            title="Framing Angles"
            onPress={() => setActiveTab('framing')}
            variant={activeTab === 'framing' ? 'primary' : 'secondary'}
            size="sm"
            style={styles.tabButton}
          />
          <AppButton
            title="Quoted Voices"
            onPress={() => setActiveTab('quotes')}
            variant={activeTab === 'quotes' ? 'primary' : 'secondary'}
            size="sm"
            style={styles.tabButton}
          />
        </View>

        {/* Headline Comparison View */}
        {activeTab === 'headlines' ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Side-by-Side Headline Formulation</Text>
            <Text style={styles.sectionSubtitle}>
              Notice how word choices establish opposing focal points for the identical negotiation outcome.
            </Text>

            <View style={styles.sideBySideRow}>
              {/* Outlet A */}
              <View style={[styles.outletColumn, styles.outletColumnLeft]}>
                <View style={styles.outletHeader}>
                  <Text style={styles.outletName}>{articleA.sourceName}</Text>
                  <Text style={styles.outletType}>Newswire</Text>
                </View>
                <Text style={styles.headlineText}>"{articleA.title}"</Text>
                <View style={styles.headlineMeta}>
                  <Text style={styles.metaLabel}>Tone: <Text style={{ color: COLORS.positive, fontWeight: '700' }}>Neutral / Pragmatic</Text></Text>
                  <Text style={styles.metaLabel}>Sensationalism: Low (8%)</Text>
                </View>
              </View>

              {/* Outlet B */}
              <View style={[styles.outletColumn, styles.outletColumnRight]}>
                <View style={styles.outletHeader}>
                  <Text style={styles.outletName}>{articleB.sourceName}</Text>
                  <Text style={styles.outletType}>Analysis Desk</Text>
                </View>
                <Text style={styles.headlineText}>"{articleB.title}"</Text>
                <View style={styles.headlineMeta}>
                  <Text style={styles.metaLabel}>Tone: <Text style={{ color: COLORS.negative, fontWeight: '700' }}>Critical / Warning</Text></Text>
                  <Text style={styles.metaLabel}>Sensationalism: Moderate (38%)</Text>
                </View>
              </View>
            </View>

            {/* Synthesized Divergence Points */}
            <View style={styles.divergenceBox}>
              <Text style={styles.divergenceTitle}>Key Narrative Divergences</Text>
              {comparison.keyDivergencePoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <Text style={styles.pointBullet}>✦</Text>
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Framing Comparison View */}
        {activeTab === 'framing' ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Framing Contrast</Text>
            <Text style={styles.sectionSubtitle}>
              Linguistic emphasis differences across standard communication dimensions.
            </Text>

            <View style={styles.framingComparisonCard}>
              <View style={styles.framingLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendLabel}>{articleA.sourceName}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.frameConflict }]} />
                  <Text style={styles.legendLabel}>{articleB.sourceName}</Text>
                </View>
              </View>

              {/* Contrast rows */}
              <View style={styles.contrastMetricRow}>
                <Text style={styles.contrastMetricLabel}>Conflict & Confrontation</Text>
                <View style={styles.dualBarContainer}>
                  <View style={[styles.dualBarFillA, { width: `${(analysisA?.framingScores.conflict || 0.28) * 100}%` }]} />
                  <View style={[styles.dualBarFillB, { width: `${(analysisB?.framingScores.conflict || 0.74) * 100}%` }]} />
                </View>
                <View style={styles.contrastValues}>
                  <Text style={styles.valueA}>28%</Text>
                  <Text style={styles.valueB}>74%</Text>
                </View>
              </View>

              <View style={styles.contrastMetricRow}>
                <Text style={styles.contrastMetricLabel}>Economic & Fiscal Consequences</Text>
                <View style={styles.dualBarContainer}>
                  <View style={[styles.dualBarFillA, { width: `${(analysisA?.framingScores.economic || 0.72) * 100}%` }]} />
                  <View style={[styles.dualBarFillB, { width: `${(analysisB?.framingScores.economic || 0.35) * 100}%` }]} />
                </View>
                <View style={styles.contrastValues}>
                  <Text style={styles.valueA}>72%</Text>
                  <Text style={styles.valueB}>35%</Text>
                </View>
              </View>

              <View style={styles.contrastMetricRow}>
                <Text style={styles.contrastMetricLabel}>Moral & Ethical Responsibility</Text>
                <View style={styles.dualBarContainer}>
                  <View style={[styles.dualBarFillA, { width: `${(analysisA?.framingScores.morality || 0.12) * 100}%` }]} />
                  <View style={[styles.dualBarFillB, { width: `${(analysisB?.framingScores.morality || 0.58) * 100}%` }]} />
                </View>
                <View style={styles.contrastValues}>
                  <Text style={styles.valueA}>12%</Text>
                  <Text style={styles.valueB}>58%</Text>
                </View>
              </View>
            </View>

            {/* Upcoming Feature Notice */}
            <View style={styles.upcomingNotice}>
              <Text style={styles.upcomingNoticeTitle}>Scheduled AI Feature (Day 6 — 24 Nov)</Text>
              <Text style={styles.upcomingNoticeBody}>
                Automated sentence-transformer clustering and real-time cross-article semantic diffing will be integrated on 24 November.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Quoted Voices View */}
        {activeTab === 'quotes' ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quoted Stakeholders Comparison</Text>
            <Text style={styles.sectionSubtitle}>
              Who was given a microphone? Asymmetric sourcing is a primary driver of news framing.
            </Text>

            <View style={styles.quotesSection}>
              <View style={styles.outletQuoteBox}>
                <Text style={styles.outletQuoteTitle}>{articleA.sourceName} Quoted:</Text>
                <Text style={styles.quotePerson}>Elena Rostova (Chief UN Negotiator)</Text>
                <Text style={styles.quoteExcerpt}>"This represents a pragmatically achievable consensus..."</Text>
              </View>

              <View style={[styles.outletQuoteBox, { marginTop: SPACING.md }]}>
                <Text style={styles.outletQuoteTitle}>{articleB.sourceName} Quoted:</Text>
                <Text style={styles.quotePerson}>Dr. Malik Thorne (Global Justice Advocate)</Text>
                <Text style={styles.quoteExcerpt}>"A voluntary target with zero enforcement penalty cannot shield vulnerable coastal populations..."</Text>
              </View>
            </View>
          </View>
        ) : null}
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
  eventBanner: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  eventBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  eventBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  overlapBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  overlapBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  eventTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 3,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: 2,
  },
  sideBySideRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  outletColumn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  outletColumnLeft: {
    marginRight: SPACING.xs,
  },
  outletColumnRight: {
    marginLeft: SPACING.xs,
  },
  outletHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  outletName: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  outletType: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  headlineText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minHeight: 64,
  },
  headlineMeta: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  divergenceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  divergenceTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  pointRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  pointBullet: {
    fontSize: 11,
    color: COLORS.primaryLight,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  framingComparisonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  framingLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contrastMetricRow: {
    marginBottom: SPACING.md,
  },
  contrastMetricLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dualBarContainer: {
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSubtle,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  dualBarFillA: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 2,
  },
  dualBarFillB: {
    height: 4,
    backgroundColor: COLORS.frameConflict,
    borderRadius: 2,
  },
  contrastValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  valueA: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  valueB: {
    fontSize: 11,
    color: COLORS.frameConflict,
    fontWeight: '700',
  },
  upcomingNotice: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upcomingNoticeTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 2,
  },
  upcomingNoticeBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  quotesSection: {
    width: '100%',
  },
  outletQuoteBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outletQuoteTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  quotePerson: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quoteExcerpt: {
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
});
