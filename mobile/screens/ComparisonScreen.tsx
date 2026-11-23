import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { EventComparisonResult } from '../types/models';
import { MainTabParamList } from '../types/navigation';
import { api } from '../services/api';

export const ComparisonScreen: React.FC = () => {
  const route = useRoute<RouteProp<MainTabParamList, 'CompareTab'>>();
  const eventId = route.params?.eventId;
  const [comparisons, setComparisons] = useState<EventComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadComparison = useCallback(async () => {
    if (!eventId) {
      setComparisons([]);
      setError('Open an event and choose Compare Coverage to see its live comparison.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const result = await api.compareEvent(eventId);
    setComparisons(result.data);
    setError(result.error);
    setLoading(false);
    setRefreshing(false);
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    void loadComparison();
  }, [loadComparison]);

  const retry = async () => {
    setRefreshing(true);
    await loadComparison();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Perspective Comparison" subtitle="Rule-based signals with article evidence" />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={retry} />}>
        {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
        {error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{error}</Text>
            {eventId ? <AppButton title="Retry comparison" onPress={retry} size="sm" /> : null}
          </View>
        ) : null}
        {!loading && !error && comparisons.length === 0 ? (
          <View style={styles.stateCard}><Text style={styles.stateText}>No cross-source article pairs are available for this event yet.</Text></View>
        ) : null}

        {comparisons.map((comparison) => (
          <View key={comparison.id} style={styles.comparisonCard}>
            <Text style={styles.eventTitle}>{comparison.eventTitle}</Text>
            <Text style={styles.metaText}>{new Date(comparison.eventDate).toLocaleDateString()} · Lexical overlap {Math.round(comparison.similarity.score * 100)}%</Text>
            <Text style={styles.sectionTitle}>Headlines</Text>
            {([comparison.headlineComparison.articleA, comparison.headlineComparison.articleB]).map((headline, index) => (
              <View key={`${headline.sourceName}-${index}`} style={styles.articleBlock}>
                <Text style={styles.source}>{headline.sourceName}</Text>
                <Text style={styles.bodyText}>{headline.headline}</Text>
                <Text style={styles.metaText}>Sentiment signal {headline.sentiment.toFixed(2)} · Sensationalism signal {Math.round(headline.sensationalism * 100)}%</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Entities and topics</Text>
            <Text style={styles.bodyText}>Shared entities: {comparison.sharedEntities.map((entity) => `${entity.name} (mentions ${entity.mentionCountA}/${entity.mentionCountB})`).join(', ') || 'None detected'}</Text>
            <Text style={styles.bodyText}>Article A only: {comparison.uniqueEntities.articleA.join(', ') || 'None detected'}</Text>
            <Text style={styles.bodyText}>Article B only: {comparison.uniqueEntities.articleB.join(', ') || 'None detected'}</Text>
            <Text style={styles.bodyText}>Shared topics: {comparison.sharedTopics.join(', ') || 'None detected'}</Text>
            <Text style={styles.bodyText}>Unique topics: A — {comparison.uniqueTopics.articleA.join(', ') || 'None'}; B — {comparison.uniqueTopics.articleB.join(', ') || 'None'}</Text>

            <Text style={styles.sectionTitle}>Quoted statements</Text>
            {[['Shared', comparison.quoteComparison.shared], ['Article A only', comparison.quoteComparison.uniqueArticleA], ['Article B only', comparison.quoteComparison.uniqueArticleB]].map(([label, quotes]) => (
              <View key={String(label)}>
                <Text style={styles.source}>{String(label)}</Text>
                {(quotes as EventComparisonResult['quoteComparison']['shared']).length ? (quotes as EventComparisonResult['quoteComparison']['shared']).map((quote, index) => (
                  <Text key={`${quote.speaker}-${index}`} style={styles.bodyText}>{quote.speaker}: “{quote.quote}”</Text>
                )) : <Text style={styles.metaText}>No matching attributed quotes detected.</Text>}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Framing indicators</Text>
            {comparison.framingContrast.map((frame) => (
              <View key={frame.frame} style={styles.frameRow}>
                <Text style={styles.source}>{frame.frame}: {Math.round(frame.articleA * 100)}% / {Math.round(frame.articleB * 100)}%</Text>
                {frame.evidenceA.map((excerpt, index) => <Text key={`a-${index}`} style={styles.evidence}>A: “{excerpt}”</Text>)}
                {frame.evidenceB.map((excerpt, index) => <Text key={`b-${index}`} style={styles.evidence}>B: “{excerpt}”</Text>)}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Evidence excerpts</Text>
            {comparison.evidence.map((item, index) => (
              <View key={`${item.articleId}-${item.kind}-${index}`} style={styles.evidenceBlock}>
                <Text style={styles.source}>{item.sourceName} · {item.kind}{item.speaker ? ` · ${item.speaker}` : ''}</Text>
                <Text style={styles.evidence}>“{item.excerpt}”</Text>
              </View>
            ))}
            {comparison.limitations.map((limitation, index) => <Text key={index} style={styles.metaText}>• {limitation}</Text>)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  stateCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.md, gap: SPACING.md },
  stateText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  comparisonCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  eventTitle: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  metaText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginBottom: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  articleBlock: { padding: SPACING.md, backgroundColor: COLORS.surfaceSubtle, borderRadius: RADIUS.md, marginBottom: SPACING.sm },
  source: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  bodyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, marginBottom: 4 },
  frameRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  evidenceBlock: { padding: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.primary, marginBottom: SPACING.sm, backgroundColor: COLORS.surfaceSubtle },
  evidence: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 3 },
});
