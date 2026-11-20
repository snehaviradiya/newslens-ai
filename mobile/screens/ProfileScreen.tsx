// Profile Screen with User Details, Account Settings & Connection Status

import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MOCK_USER } from '../constants/mockData';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { api, API_BASE_URL, HealthStatus } from '../services/api';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const res = await api.checkBackendHealth();
    setHealthStatus(res);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLogout = () => {
    // Return to onboarding/welcome using root parent navigator
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } else {
      (navigation as any).navigate('Welcome');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Research Profile"
        subtitle="Account settings, research stats, and backend connectivity"
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{MOCK_USER.name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{MOCK_USER.name}</Text>
            <Text style={styles.userEmail}>{MOCK_USER.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{MOCK_USER.role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{MOCK_USER.savedAnalysesCount}</Text>
            <Text style={styles.statLabel}>Saved Analyses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{MOCK_USER.comparedArticlesCount}</Text>
            <Text style={styles.statLabel}>Compared Articles</Text>
          </View>
        </View>

        {/* System & Backend API Configuration */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Backend Connection Status</Text>
          <Text style={styles.sectionSubtitle}>
            Configured via EXPO_PUBLIC_API_BASE_URL
          </Text>

          <View style={styles.configItem}>
            <Text style={styles.configKey}>Resolved Backend URL:</Text>
            <Text style={styles.configValue}>{API_BASE_URL}</Text>
          </View>

          <View style={styles.statusIndicatorRow}>
            <View style={[styles.statusDot, { backgroundColor: healthStatus?.backend ? COLORS.positive : COLORS.warning }]} />
            <Text style={styles.statusMessage}>
              {healthStatus?.backend ? 'Backend service online' : 'Backend currently offline (Using mock data)'}
            </Text>
          </View>

          <AppButton
            title="Re-check Backend Connection"
            onPress={checkStatus}
            loading={checking}
            variant="secondary"
            size="sm"
            style={styles.recheckButton}
          />
        </View>

        {/* Academic Settings & Methodology */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Methodology Guidelines</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✦</Text>
            <Text style={styles.bulletText}>All analyses evaluate individual articles, not entire news publications.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✦</Text>
            <Text style={styles.bulletText}>Every framing dimension and sentiment score cites verbatim paragraph evidence.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✦</Text>
            <Text style={styles.bulletText}>Hugging Face transformer models scheduled for deployment on 23 Nov 2026.</Text>
          </View>
        </View>

        {/* Logout Action */}
        <AppButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          size="md"
          style={styles.logoutButton}
        />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  roleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statNumber: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  configItem: {
    marginBottom: SPACING.sm,
  },
  configKey: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  configValue: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.primary,
    marginTop: 2,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  recheckButton: {
    marginTop: SPACING.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bullet: {
    fontSize: 11,
    color: COLORS.primaryLight,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
