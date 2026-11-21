-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'RESEARCHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ToneCategory" AS ENUM ('NEUTRAL', 'CRITICAL', 'ADVOCATING', 'ALARMIST', 'BALANCED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "rssFeedUrl" TEXT,
    "description" TEXT,
    "country" TEXT DEFAULT 'International',
    "category" TEXT DEFAULT 'General',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "author" TEXT,
    "content" TEXT,
    "summary" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAnalysis" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "AnalysisStatus" NOT NULL DEFAULT 'COMPLETED',
    "headlineSentiment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "headlineSensationalism" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overallTone" "ToneCategory" NOT NULL DEFAULT 'NEUTRAL',
    "subjectivityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "framingScores" JSONB NOT NULL,
    "entities" JSONB,
    "quotes" JSONB,
    "topics" JSONB,
    "politicalSignals" JSONB,
    "supportingEvidence" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleComparison" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "articleAId" TEXT NOT NULL,
    "articleBId" TEXT NOT NULL,
    "userId" TEXT,
    "headlineComparison" JSONB,
    "framingContrast" JSONB,
    "quoteComparison" JSONB,
    "coverageOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "keyDivergencePoints" JSONB,
    "synthesisSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "comparisonId" TEXT,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSource_websiteUrl_key" ON "NewsSource"("websiteUrl");

-- CreateIndex
CREATE INDEX "NewsSource_websiteUrl_idx" ON "NewsSource"("websiteUrl");

-- CreateIndex
CREATE INDEX "NewsEvent_eventDate_idx" ON "NewsEvent"("eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_originalUrl_key" ON "NewsArticle"("originalUrl");

-- CreateIndex
CREATE INDEX "NewsArticle_originalUrl_idx" ON "NewsArticle"("originalUrl");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsArticle_sourceId_idx" ON "NewsArticle"("sourceId");

-- CreateIndex
CREATE INDEX "NewsArticle_eventId_idx" ON "NewsArticle"("eventId");

-- CreateIndex
CREATE INDEX "ArticleAnalysis_articleId_idx" ON "ArticleAnalysis"("articleId");

-- CreateIndex
CREATE INDEX "ArticleAnalysis_status_idx" ON "ArticleAnalysis"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleAnalysis_articleId_modelVersion_key" ON "ArticleAnalysis"("articleId", "modelVersion");

-- CreateIndex
CREATE INDEX "ArticleComparison_eventId_idx" ON "ArticleComparison"("eventId");

-- CreateIndex
CREATE INDEX "ArticleComparison_userId_idx" ON "ArticleComparison"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleComparison_articleAId_articleBId_key" ON "ArticleComparison"("articleAId", "articleBId");

-- CreateIndex
CREATE INDEX "AnalysisHistory_userId_idx" ON "AnalysisHistory"("userId");

-- CreateIndex
CREATE INDEX "AnalysisHistory_createdAt_idx" ON "AnalysisHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewsSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAnalysis" ADD CONSTRAINT "ArticleAnalysis_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComparison" ADD CONSTRAINT "ArticleComparison_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NewsEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComparison" ADD CONSTRAINT "ArticleComparison_articleAId_fkey" FOREIGN KEY ("articleAId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComparison" ADD CONSTRAINT "ArticleComparison_articleBId_fkey" FOREIGN KEY ("articleBId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComparison" ADD CONSTRAINT "ArticleComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisHistory" ADD CONSTRAINT "AnalysisHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisHistory" ADD CONSTRAINT "AnalysisHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisHistory" ADD CONSTRAINT "AnalysisHistory_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "ArticleComparison"("id") ON DELETE SET NULL ON UPDATE CASCADE;
