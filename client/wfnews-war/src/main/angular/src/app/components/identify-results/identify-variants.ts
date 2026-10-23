import { IDENTIFY_TEXTS } from '@app/constants';

export type IdentifyLayout = 'phone' | 'desktop';

export interface IdentifyVariant {
  texts: typeof IDENTIFY_TEXTS.phone;
  /** "Fire Ban on … Open Fires", with Category 1 named Campfires on the card. */
  banOpenFires: boolean;
  /** The list row names an Area Restriction a "Restricted Area". */
  restrictedAreaName: boolean;
  /** The card title decodes the Area Restriction name. */
  decodeAreaTitle: boolean;
  /** A Closed Recreation Site shows its own closure comment, not the fixed text. */
  closureComment: boolean;
  /** A Protected Land shows its campfire ban. */
  campfireBan: boolean;
  /** A Protected Land with no details says the park is closed. */
  parkClosedFallback: boolean;
  /** A wildfire of note shows its stage dot beside its icon in the list. */
  fireOfNoteDot: boolean;
  /** The wildfire size has thousands separators. */
  sizeSeparators: boolean;
  /** The Fire Centre comes before the size and the discovery date. */
  fireCentreFirst: boolean;
  /** A wildfire of note keeps a gap between its two description texts. */
  fireOfNoteGap: boolean;
}

// Where the phone and desktop results differ today; the business will choose one of each.
export const IDENTIFY_VARIANTS: Record<IdentifyLayout, IdentifyVariant> = {
  phone: {
    texts: IDENTIFY_TEXTS.phone,
    banOpenFires: false,
    restrictedAreaName: false,
    decodeAreaTitle: true,
    closureComment: false,
    campfireBan: true,
    parkClosedFallback: false,
    fireOfNoteDot: false,
    sizeSeparators: false,
    fireCentreFirst: true,
    fireOfNoteGap: false,
  },
  desktop: {
    texts: IDENTIFY_TEXTS.desktop,
    banOpenFires: true,
    restrictedAreaName: true,
    decodeAreaTitle: false,
    closureComment: true,
    campfireBan: false,
    parkClosedFallback: true,
    fireOfNoteDot: true,
    sizeSeparators: true,
    fireCentreFirst: false,
    fireOfNoteGap: true,
  },
};

/** The text of a name that was stored with the wrong encoding. */
export function decodeName(text: string): string {
  return decodeURIComponent(escape(text));
}
