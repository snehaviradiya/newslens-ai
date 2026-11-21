// Automated News Collection Scheduler

import { env } from '../config/env.js';
import { newsIngestionService } from './newsIngestionService.js';

export class NewsSchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private intervalMinutes: number;
  private enabled: boolean;

  constructor() {
    this.enabled = env.ENABLE_COLLECTION_SCHEDULER ?? false;
    this.intervalMinutes = env.COLLECTION_INTERVAL_MINUTES ?? 60;
  }

  start(): void {
    if (!this.enabled) {
      console.log('[Scheduler] News collection scheduler is disabled via configuration.');
      return;
    }

    if (this.timer) {
      console.log('[Scheduler] Scheduler is already active.');
      return;
    }

    const intervalMs = Math.max(5, this.intervalMinutes) * 60 * 1000;
    console.log(`[Scheduler] Starting background news collection scheduler (interval: ${this.intervalMinutes}m).`);

    // Run initial ingestion after small startup delay (10s)
    setTimeout(() => {
      this.triggerIngestion();
    }, 10000);

    this.timer = setInterval(() => {
      this.triggerIngestion();
    }, intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[Scheduler] News collection scheduler stopped.');
    }
  }

  private async triggerIngestion(): Promise<void> {
    try {
      console.log('[Scheduler] Executing scheduled news collection cycle...');
      const summary = await newsIngestionService.runCollection();
      console.log(
        `[Scheduler] Scheduled cycle complete. Fetched: ${summary.totalFetched}, Inserted: ${summary.totalInserted}, Duplicates: ${summary.totalDuplicates}`
      );
    } catch (err: any) {
      console.error('[Scheduler] Scheduled collection cycle encountered error:', err.message);
    }
  }
}

export const newsScheduler = new NewsSchedulerService();
