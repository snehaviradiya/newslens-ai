// News Framing Analysis Screen with URL & Text Input

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnalysisCard } from '../components/AnalysisCard';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { ArticleAnalysis } from '../types/models';
import { api } from '../services/api';

export const AnalysisScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArticleAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim() && !text.trim()) {
      setError('Please provide either an article web URL or paste article text to analyze.');
      return;
    }

    if (url.trim() && !url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      setError('Article URL must begin with http:// or https://');
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      const res = await api.analyzeArticle({ url: url.trim(), text: text.trim() });
      setResult(res.analysis);
    } catch {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setText('');
    setResult(null);
    setError(undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Analyze Article Framing"
        subtitle="Evaluate framing dimensions, emotional polarity, and quotes"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {!result ? (
            <View style={styles.inputSection}>
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceTitle}>Evidence-Based Framing Evaluation</Text>
                <Text style={styles.guidanceText}>
                  Input a published news story to decompose its linguistic framing (Conflict, Economic, Human Interest, Morality, and Responsibility). The system extracts verbatim sentences to justify every metric.
                </Text>
              </View>

              <AppInput
                label="Article Web URL"
                value={url}
                onChangeText={(val) => {
                  setUrl(val);
                  if (error) setError(undefined);
                }}
                placeholder="https://www.reuters.com/... or https://www.bbc.com/..."
                keyboardType="url"
                autoCapitalize="none"
                helperText="Paste canonical link from any major news publication"
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR PASTE TEXT DIRECTLY</Text>
                <View style={styles.dividerLine} />
              </View>

              <AppInput
                label="Article Headline & Body Content"
                value={text}
                onChangeText={(val) => {
                  setText(val);
                  if (error) setError(undefined);
                }}
                placeholder="Paste news headline and paragraphs here..."
                multiline
                numberOfLines={6}
                error={error}
              />

              <AppButton
                title="Execute Framing Analysis"
                onPress={handleAnalyze}
                loading={loading}
                size="lg"
                style={styles.analyzeButton}
              />

              <View style={styles.scheduleNote}>
                <Text style={styles.scheduleNoteText}>
                  Development Status: Day 2 UI implementation. Python FastAPI NLP Engine and Hugging Face transformer pipeline will be connected on Day 5 (23 Nov).
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleContainer}>
                  <Text style={styles.articleTitle}>{result.articleTitle}</Text>
                  <Text style={styles.articleMeta}>Source: {result.sourceName} • Analyzed on {new Date(result.analyzedAt).toLocaleDateString()}</Text>
                </View>
                <AppButton
                  title="New Analysis"
                  onPress={handleReset}
                  variant="outline"
                  size="sm"
                />
              </View>

              {loading ? (
                <LoadingIndicator message="Processing linguistic signals..." />
              ) : (
                <AnalysisCard analysis={result} />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  inputSection: {
    width: '100%',
  },
  guidanceBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guidanceTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  guidanceText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  analyzeButton: {
    marginTop: SPACING.md,
  },
  scheduleNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  scheduleNoteText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  resultSection: {
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  articleTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  articleMeta: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
