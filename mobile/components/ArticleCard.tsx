// Article Card Component for Event Feeds and Related Coverage

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { NewsArticle } from '../types/models';

export interface ArticleCardProps {
  article: NewsArticle;
  onPress: () => void;
  onAnalyzePress?: () => void;
  compact?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onAnalyzePress,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, compact && styles.compactCard]}
      accessibilityRole="button"
      accessibilityLabel={`Article: ${article.title}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>{article.sourceName}</Text>
        </View>
        <Text style={styles.timeText}>
          {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={compact ? 2 : 3}>
        {article.title}
      </Text>

      {!compact && article.summary ? (
        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
        {onAnalyzePress ? (
          <TouchableOpacity
            onPress={onAnalyzePress}
            style={styles.inspectButton}
            accessibilityRole="button"
            accessibilityLabel="Inspect framing"
          >
            <Text style={styles.inspectText}>Inspect Framing →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  compactCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sourceBadge: {
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
  timeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  categoryPill: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  inspectButton: {
    paddingVertical: 2,
  },
  inspectText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
