// Navigation Param List & Route Definitions for React Navigation

import { NavigatorScreenParams } from '@react-navigation/native';
import { ArticleAnalysis, NewsArticle, NewsEvent } from './models';

export type MainTabParamList = {
  HomeTab: undefined;
  AnalyzeTab: { initialUrl?: string } | undefined;
  CompareTab: { eventId?: string; comparisonId?: string; articleAId?: string; articleBId?: string } | undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  EventDetail: { event: NewsEvent };
  ArticleDetail: { article: NewsArticle; analysis?: ArticleAnalysis };
};
