import { registerPlugin } from '@capacitor/core';

/**
 * The native half sends a queued Report of Fire when the OS sees a network, also with the
 * app closed: WorkManager on Android (rof/RofUploaderPlugin.java), a background URLSession
 * on iOS (RofUploader.swift). There is no web half.
 */
export interface RofUploaderPlugin {
  enqueue(options: {
    submissionID: string;
    url: string;
    expiresAt: number;
    resource: string;
    image1?: string;
    image2?: string;
    image3?: string;
  }): Promise<void>;
  /** The Submission IDs it holds and has not sent. */
  pending(): Promise<{ submissionIDs: string[] }>;
  /** The Submission IDs it sent since the last call; each is returned one time. */
  takeSent(): Promise<{ submissionIDs: string[] }>;
  cancel(options: { submissionID: string }): Promise<void>;
}

export const RofUploader = registerPlugin<RofUploaderPlugin>('RofUploader');
