// Welcome Screen — Editorial Landing & Onboarding

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Academic Research Initiative</Text>
          </View>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.appName}>NewsLens AI</Text>
          <Text style={styles.tagline}>AI-Based News Bias & Framing Analysis System</Text>
          <Text style={styles.description}>
            Examine how different news outlets frame the same real-world events. Inspect headline slant, quote selection, and linguistic tone with evidence grounded directly in article text.
          </Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet}>
              <Text style={styles.featureIcon}>✦</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Article-Level Granularity</Text>
              <Text style={styles.featureDesc}>No blanket bias ratings. Each published article is evaluated on its specific text and evidence.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureBullet}>
              <Text style={styles.featureIcon}>✦</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Cross-Source Event Comparison</Text>
              <Text style={styles.featureDesc}>Compare coverage of identical events across competing global and national publications.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureBullet}>
              <Text style={styles.featureIcon}>✦</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Traceable Textual Evidence</Text>
              <Text style={styles.featureDesc}>Every framing dimension and sentiment score cites verbatim paragraph excerpts.</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <AppButton
            title="Explore News Perspectives"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            size="lg"
            style={styles.primaryButton}
          />
          <AppButton
            title="Sign In to Account"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
            size="md"
            style={styles.secondaryButton}
          />
        </View>

        <View style={styles.footerNotice}>
          <Text style={styles.footerText}>
            Rule-based article analysis, live news collection, event grouping, and evidence-backed comparisons.
          </Text>
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
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  badgeContainer: {
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  badge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accentSubtle,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerContainer: {
    marginBottom: SPACING.xxl,
  },
  appName: {
    ...TYPOGRAPHY.h1,
    fontSize: 34,
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  tagline: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 16,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featureList: {
    marginBottom: SPACING.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  featureBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  featureIcon: {
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
  },
  footerNotice: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
