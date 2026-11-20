// News Source Card for Source Diversity Overview

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { NewsSource } from '../types/models';

export interface NewsSourceCardProps {
  source: NewsSource;
  onPress?: () => void;
}

export const NewsSourceCard: React.FC<NewsSourceCardProps> = ({
  source,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Source: ${source.name}`}
    >
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{source.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{source.name}</Text>
          <Text style={styles.meta}>{source.country} • {source.category}</Text>
        </View>
      </View>
      {source.articleCount ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{source.articleCount} Articles Monitored</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 160,
    marginRight: SPACING.md,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  info: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  meta: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  countBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
