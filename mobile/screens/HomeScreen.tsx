// Home Dashboard Screen — Events, Perspectives, and Fast Analysis Entry

import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArticleCard } from '../components/ArticleCard';
import { NewsSourceCard } from '../components/NewsSourceCard';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MOCK_ANALYSES, MOCK_ARTICLES, MOCK_EVENTS, MOCK_SOURCES } from '../constants/mockData';
import { NewsEvent, NewsSource } from '../types/models';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { api } from '../services/api';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [events, setEvents] = useState<NewsEvent[]>(MOCK_EVENTS);
  const [sources, setSources] = useState<NewsSource[]>(MOCK_SOURCES);
  const [refreshing, setRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const loadData = async () => {
    const health = await api.checkBackendHealth();
    setIsBackendConnected(health.backend);

    const eventResult = await api.getEvents();
    setEvents(eventResult.data);

    const sourceResult = await api.getSources();
    setSources(sourceResult.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderEventCluster = (event: NewsEvent) => {
    return (
      <TouchableOpacity
        key={event.id}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EventDetail', { event })}
        style={styles.eventCard}
        accessibilityRole="button"
        accessibilityLabel={`Event: ${event.title}`}
      >
        <View style={styles.eventCategoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.topicCategory}</Text>
          </View>
          <View style={styles.perspectiveBadge}>
            <Text style={styles.perspectiveText}>{event.sourceCount} Outlets Covered</Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventSummary} numberOfLines={2}>{event.summary}</Text>

        <View style={styles.sourcesRow}>
          <Text style={styles.sourcesLabel}>Sources reporting: </Text>
          <Text style={styles.sourcesList}>{event.sources.join(' • ')}</Text>
        </View>

        <View style={styles.eventFooter}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CompareTab', { eventId: event.id })}
            style={styles.compareButton}
          >
            <Text style={styles.compareButtonText}>Compare Coverage Perspectives →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header Greeting & Connection Indicator */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>NewsLens AI</Text>
            <Text style={styles.subGreeting}>Multi-Source News Framing Intelligence</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isBackendConnected ? COLORS.positiveLight : COLORS.warningLight }]}>
            <View style={[styles.statusDot, { backgroundColor: isBackendConnected ? COLORS.positive : COLORS.warning }]} />
            <Text style={[styles.statusText, { color: isBackendConnected ? COLORS.positive : COLORS.warning }]}>
              {isBackendConnected ? 'API Live' : 'Demo Mode'}
            </Text>
          </View>
        </View>

        {/* Quick Framing Analysis Banner */}
        <View style={styles.analysisBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Inspect Any News Article</Text>
            <Text style={styles.bannerSubtitle}>
              Paste any article link or body text to evaluate headline sensationalism, conflict framing, and entity quotes.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AnalyzeTab')}
              style={styles.bannerButton}
            >
              <Text style={styles.bannerButtonText}>+ New Framing Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clustered News Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shared News Events</Text>
          <Text style={styles.sectionMeta}>Clustered coverage across multiple newsrooms</Text>
        </View>
        <View style={styles.eventsList}>
          {events.map(renderEventCluster)}
        </View>

        {/* Monitored News Sources Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monitored Publications</Text>
          <Text style={styles.sectionMeta}>Automated RSS and feed collection coverage</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sourcesCarousel}
        >
          {sources.map((src) => (
            <NewsSourceCard key={src.id} source={src} />
          ))}
        </ScrollView>

        {/* Recent Analyzed Articles Section */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
          <Text style={styles.sectionTitle}>Recent Article Inspections</Text>
          <Text style={styles.sectionMeta}>Evidence-grounded linguistic analysis examples</Text>
        </View>
        {MOCK_ARTICLES.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() => navigation.navigate('ArticleDetail', { article, analysis: MOCK_ANALYSES[index] })}
            onAnalyzePress={() => navigation.navigate('ArticleDetail', { article, analysis: MOCK_ANALYSES[index] })}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  greeting: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primaryDark,
  },
  subGreeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  analysisBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  bannerContent: {
    width: '100%',
  },
  bannerTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textInverse,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textInverseMuted,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  bannerButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 13,
    color: COLORS.primary,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  sectionMeta: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventsList: {
    marginBottom: SPACING.lg,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  eventCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  perspectiveBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  perspectiveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  eventTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  eventSummary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  sourcesLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sourcesList: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    alignItems: 'flex-start',
  },
  compareButton: {
    paddingVertical: 2,
  },
  compareButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  sourcesCarousel: {
    paddingVertical: SPACING.xs,
  },
});
