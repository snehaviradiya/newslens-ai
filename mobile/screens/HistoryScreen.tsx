import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { HistoryRecord } from '../types/models';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { api } from '../services/api';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'HistoryTab'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    try {
      if (!api.isAuthenticated()) throw new Error('Sign in to view your saved analyses and comparisons.');
      setRecords(await api.getHistory());
      setError(undefined);
    } catch (loadError) {
      setError((loadError as Error).message || 'Could not load history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openRecord = (record: HistoryRecord) => {
    if (record.article) {
      navigation.navigate('ArticleDetail', { article: record.article, analysis: record.article.analysis });
    } else if (record.comparison?.eventId) {
      navigation.navigate('Main', { screen: 'CompareTab', params: { comparisonId: record.comparison.id } });
    }
  };

  const retry = () => { setRefreshing(true); void load(); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Analysis History" subtitle="Reopen saved article analyses and comparisons" />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={retry} />}>
        {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
        {error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{error}</Text>
            {!api.isAuthenticated() ? (
              <AppButton title="Sign in" onPress={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Login')} size="sm" />
            ) : <AppButton title="Retry" onPress={retry} size="sm" />}
          </View>
        ) : null}
        {!loading && !error && records.length === 0 ? <Text style={styles.stateText}>No saved analyses or comparisons yet.</Text> : null}
        {records.map((record) => {
          const article = record.article;
          const comparison = record.comparison;
          const title = article?.title || comparison?.eventTitle || 'Saved report';
          const kind = article ? 'Article analysis' : 'Cross-source comparison';
          return (
            <TouchableOpacity key={record.id} style={styles.card} onPress={() => openRecord(record)} accessibilityRole="button">
              <View style={styles.topRow}>
                <Text style={styles.kind}>{kind}</Text>
                <Text style={styles.date}>{new Date(record.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              {article?.analysis ? <Text style={styles.subtitle}>Tone: {article.analysis.overallTone} · {article.sourceName}</Text> : null}
              {comparison ? <Text style={styles.subtitle}>{comparison.articles?.length || 0} articles · {comparison.keyDivergencePoints?.length || 0} observed differences</Text> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xxxl, flexGrow: 1 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  kind: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700' },
  date: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  title: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs },
  stateCard: { padding: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, gap: SPACING.sm },
  stateText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.md },
});
