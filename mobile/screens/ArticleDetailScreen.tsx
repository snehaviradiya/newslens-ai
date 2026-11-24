// Article Detail Screen with Grounded Framing Decomposition

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnalysisCard } from '../components/AnalysisCard';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { ArticleAnalysis } from '../types/models';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;

export const ArticleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { article } = route.params;
  const [analysis, setAnalysis] = useState<ArticleAnalysis | undefined>(route.params.analysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let active = true;
    api.getArticle(article.id).then((saved) => {
      if (active && saved.analysis) setAnalysis(saved.analysis);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [article.id]);

  const analyze = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const saved = await api.analyzeStoredArticle(article.id);
      setAnalysis(saved);
    } catch (analysisError) {
      setError((analysisError as Error).message || 'Analysis could not be saved. Sign in and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title={article.sourceName}
        subtitle="Individual Article Analysis"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Article Overview Card */}
        <View style={styles.articleHeaderCard}>
          <View style={styles.metaRow}>
            <View style={styles.sourcePill}>
              <Text style={styles.sourceText}>{article.sourceName}</Text>
            </View>
            <Text style={styles.dateText}>
              Published: {new Date(article.publishedAt).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>
          {article.author ? (
            <Text style={styles.authorText}>By {article.author}</Text>
          ) : null}

          <View style={styles.contentBox}>
            <Text style={styles.contentSnippet}>{article.content || article.summary}</Text>
          </View>
        </View>

        {/* Embedded Analysis Card */}
        <View style={styles.analysisSection}>
          {analysis ? <AnalysisCard analysis={analysis} /> : (
            <View style={styles.analyzeBox}>
              <Text style={styles.analyzeHint}>Generate and save an article analysis. Sign in is required.</Text>
              <AppButton
                title={api.isAuthenticated() ? 'Analyze and Save' : 'Sign in to Analyze'}
                onPress={api.isAuthenticated() ? analyze : () => navigation.navigate('Login')}
                loading={loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}
          {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
        </View>
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
  articleHeaderCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  metaRow: {
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
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  authorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  contentBox: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  contentSnippet: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  analysisSection: {
    width: '100%',
  },
  analyzeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  analyzeHint: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  errorText: { ...TYPOGRAPHY.bodySmall, color: COLORS.negative, marginTop: SPACING.sm },
});
