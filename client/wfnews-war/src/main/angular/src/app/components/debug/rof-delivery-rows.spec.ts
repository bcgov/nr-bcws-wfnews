import { QueuedReportState, SentReportState } from '@app/services/rof-delivery-state';
import { rofDeliveryRows } from './rof-delivery-rows';

// Fixed formats, so the result does not depend on the device locale.
const date = (time: number) => `D${time}`;
const time = (value: number) => `T${value}`;

function queued(submissionID: string, submittedAt: number, syncAttempts = 0, nativeHeld: boolean | null = true): QueuedReportState {
  return { submissionID, submittedAt, syncAttempts, nativeHeld };
}

function sent(submissionID: string, submittedAt: number, how: SentReportState['how'], sentAt = 0): SentReportState {
  return { submissionID, submittedAt, sentAt, how };
}

describe('rofDeliveryRows', () => {
  it('says None when nothing is queued or sent', () => {
    expect(rofDeliveryRows({ queue: [], recentSent: [] }, date, time)).toEqual([
      { label: 'In queue', value: 'None' },
      { label: 'Recently sent', value: 'None' },
    ]);
  });

  it('counts the queue and gives each report its time and status', () => {
    const rows = rofDeliveryRows(
      { queue: [queued('a1', 1), queued('b2', 2, 1, false), queued('c3', 3, 3)], recentSent: [] },
      date,
      time,
    );

    expect(rows.slice(0, 4)).toEqual([
      { label: 'In queue', value: '3' },
      { label: 'D1', value: 'Waiting to send, background send ready', detail: 'a1' },
      { label: 'D2', value: 'Waiting to send, app only, 1 failed try', detail: 'b2' },
      { label: 'D3', value: 'Waiting to send, background send ready, 3 failed tries', detail: 'c3' },
    ]);
  });

  it('leaves out the background state on the web', () => {
    const rows = rofDeliveryRows({ queue: [queued('a1', 1, 0, null)], recentSent: [] }, date, time);

    expect(rows[1].value).toBe('Waiting to send');
  });

  it('says how each recent report went, newest first', () => {
    const rows = rofDeliveryRows(
      { queue: [], recentSent: [sent('s1', 10, 'direct'), sent('s2', 20, 'sync', 25), sent('s3', 30, 'background')] },
      date,
      time,
    );

    expect(rows.slice(1)).toEqual([
      { label: 'Recently sent', value: '3' },
      { label: 'D30', value: 'Sent in the background', detail: 's3' },
      { label: 'D20', value: 'Sent later by the app at T25', detail: 's2' },
      { label: 'D10', value: 'Sent right away', detail: 's1' },
    ]);
  });

  it('formats a date for a person by default', () => {
    const rows = rofDeliveryRows({ queue: [queued('a1', new Date(2026, 10, 26, 11, 36).getTime())], recentSent: [] });

    expect(rows[1].label).toMatch(/26/);
    expect(rows[1].label).toMatch(/11:36/);
  });
});
