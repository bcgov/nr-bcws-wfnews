/** How a sent report went: at submit, by a later Sync, or by the Native Uploader. */
export type SentHow = 'direct' | 'sync' | 'background';

export interface QueuedReportState {
  submissionID: string;
  submittedAt: number;
  syncAttempts: number;
  /** Null on the web, which has no Native Uploader. */
  nativeHeld: boolean | null;
}

export interface SentReportState {
  submissionID: string;
  submittedAt: number;
  sentAt: number;
  how: SentHow;
}

export interface RofDeliveryState {
  queue: QueuedReportState[];
  /** Oldest first. */
  recentSent: SentReportState[];
}
