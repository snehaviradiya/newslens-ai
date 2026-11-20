// Reusable Accessible Button Component

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isInteractive = !disabled && !loading;

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = styles.base;

    switch (size) {
      case 'sm':
        base = { ...base, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm };
        break;
      case 'lg':
        base = { ...base, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.lg };
        break;
      default:
        base = { ...base, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md };
    }

    switch (variant) {
      case 'secondary':
        return { ...base, backgroundColor: COLORS.surfaceSubtle, borderWidth: 1, borderColor: COLORS.border };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: COLORS.negative };
      default:
        return { ...base, backgroundColor: COLORS.primary, ...SHADOWS.button };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'secondary':
        return COLORS.textPrimary;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      case 'danger':
        return COLORS.textInverse;
      default:
        return COLORS.textInverse;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={[
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !isInteractive }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              TYPOGRAPHY.button,
              { color: getTextColor(), marginLeft: icon ? SPACING.sm : 0 },
              size === 'sm' && { fontSize: 13 },
              size === 'lg' && { fontSize: 16 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});
