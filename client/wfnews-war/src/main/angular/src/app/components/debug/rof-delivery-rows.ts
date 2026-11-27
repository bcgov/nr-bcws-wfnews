import { QueuedReportState, RofDeliveryState, SentReportState } from '@app/services/rof-delivery-state';

/** `detail` is the Submission ID. Only Copy all shows it: support needs it to search the server log. */
export interface DeliveryRow {
  label: string;
  value: string;
  detail?: string;
}

export type DateFormat = (time: number) => string;

const dateTime: DateFormat = (time) =>
  new Date(time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const timeOnly: DateFormat = (time) =>
  new Date(time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Times and states only: anyone with the phone can open the diagnostics and copy them. */
export function rofDeliveryRows(
  state: RofDeliveryState,
  formatDate: DateFormat = dateTime,
  formatTime: DateFormat = timeOnly,
): DeliveryRow[] {
  const rows: DeliveryRow[] = [
    { label: 'In queue', value: state.queue.length ? String(state.queue.length) : 'None' },
  ];
  for (const item of state.queue) {
    rows.push({ label: formatDate(item.submittedAt), value: queuedStatus(item), detail: item.submissionID });
  }

  rows.push({ label: 'Recently sent', value: state.recentSent.length ? String(state.recentSent.length) : 'None' });
  for (const item of [...state.recentSent].reverse()) {
    rows.push({ label: formatDate(item.submittedAt), value: sentStatus(item, formatTime), detail: item.submissionID });
  }
  return rows;
}

function queuedStatus(item: QueuedReportState): string {
  const parts = ['Waiting to send'];
  if (item.nativeHeld !== null) {
    parts.push(item.nativeHeld ? 'background send ready' : 'app only');
  }
  if (item.syncAttempts) {
    parts.push(`${item.syncAttempts} failed ${item.syncAttempts === 1 ? 'try' : 'tries'}`);
  }
  return parts.join(', ');
}

function sentStatus(item: SentReportState, formatTime: DateFormat): string {
  switch (item.how) {
    case 'direct':
      return 'Sent right away';
    case 'sync':
      return `Sent later by the app at ${formatTime(item.sentAt)}`;
    default:
      // The app learns of a background send when it next opens, so it has no exact time.
      return 'Sent in the background';
  }
}
