// Event Detail Screen — Multi-Source Clustered Articles

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ArticleCard } from '../components/ArticleCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MOCK_ANALYSES, MOCK_ARTICLES } from '../constants/mockData';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { event } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Event Cluster"
        subtitle={`${event.sourceCount} distinct sources reporting`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.eventOverview}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{event.topicCategory}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventSummary}>{event.summary}</Text>

          <View style={styles.compareActionBox}>
            <Text style={styles.compareActionText}>
              See how different editorial teams framed this same negotiation:
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
          <Text style={styles.sectionTitle}>Reporting Articles ({event.sources.length})</Text>
          <Text style={styles.sectionSubtitle}>Select an article to inspect its specific textual framing evidence</Text>
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
