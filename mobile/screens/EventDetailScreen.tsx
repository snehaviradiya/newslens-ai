// Event Detail Screen — Multi-Source Clustered Articles

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ArticleCard } from '../components/ArticleCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { api } from '../services/api';
import { NewsArticle, NewsEvent } from '../types/models';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const [event, setEvent] = useState<NewsEvent>(route.params.event);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadEvent = useCallback(async () => {
    const [eventResult, articleResult] = await Promise.all([
      api.getEvent(route.params.event.id),
      api.getEventArticles(route.params.event.id),
    ]);
    if (eventResult.data) setEvent(eventResult.data);
    setArticles(articleResult.data);
    setError(eventResult.isLive && articleResult.isLive ? undefined : 'Could not load live event details. Pull to retry.');
    setLoading(false);
    setRefreshing(false);
  }, [route.params.event.id]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);

  const retry = async () => {
    setRefreshing(true);
    await loadEvent();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Event Cluster"
        subtitle={`${event.sourceCount} distinct sources reporting`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={retry} />}
      >
        <View style={styles.eventOverview}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{event.topicCategory}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.summary ? <Text style={styles.eventSummary}>{event.summary}</Text> : null}

          <View style={styles.compareActionBox}>
            <Text style={styles.compareActionText}>
              Compare articles grouped by the matching service. Differences are reported as text signals with source excerpts.
            </Text>
            <AppButton
              title="Compare Reporting Angles →"
              onPress={() => navigation.navigate('Main', { screen: 'CompareTab', params: { eventId: event.id } })}
              size="md"
              style={styles.compareButton}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reporting Articles ({articles.length})</Text>
          <Text style={styles.sectionSubtitle}>Select an article to inspect its specific textual framing evidence</Text>
        </View>

        {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
        {error ? <Text style={styles.sectionSubtitle}>{error}</Text> : null}
        {!loading && !error && articles.length === 0 ? <Text style={styles.sectionSubtitle}>No live articles are assigned to this event yet.</Text> : null}
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() => navigation.navigate('ArticleDetail', { article })}
            onAnalyzePress={() => navigation.navigate('ArticleDetail', { article })}
          />
        ))}
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
  eventOverview: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  categoryPill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  eventTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  eventSummary: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  compareActionBox: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compareActionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  compareButton: {
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
