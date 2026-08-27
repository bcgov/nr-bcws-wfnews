import { LocationPermissionState } from '@app/services/capacitor-service';

/**
 * Every word that a permission banner shows. One place, so the same failure reads
 * the same way on each screen, and a wording change is one edit.
 */
export const PERMISSION_BANNER = {
  location: {
    heading: {
      off: 'Location is off',
      servicesOff: 'Location services are off',
    },
    action: {
      turnOn: 'Turn on location',
      appSettings: 'Open settings',
      locationSettings: 'Open location settings',
    },
    message: {
      reportOfFire:
        'Enabling location can help improve the accuracy of this report.',
      nearestFirst:
        'These lists sort by how near a place is to you. Turn on location to see that order.',
    },
  },
  push: {
    heading: 'Notifications are off',
    action: {
      turnOn: 'Turn on notifications',
      appSettings: 'Open settings',
    },
    message: {
      savedLocations:
        'Your saved locations cannot send you wildfire alerts until notifications are on for this app.',
    },
  },
} as const;

/** True when a prompt still works. Otherwise the way back is the settings page. */
export function locationCanPrompt(state: LocationPermissionState): boolean {
  return state === 'prompt' || state === 'denied-once';
}

export function locationBannerHeading(state: LocationPermissionState): string {
  return state === 'services-off'
    ? PERMISSION_BANNER.location.heading.servicesOff
    : PERMISSION_BANNER.location.heading.off;
}

/**
 * Location fails two ways, and each way has its own settings page. iOS has one page
 * for both, so its word must not promise the phone location page.
 */
export function locationBannerAction(
  state: LocationPermissionState,
  isIOSPlatform = false,
): string {
  if (locationCanPrompt(state)) {
    return PERMISSION_BANNER.location.action.turnOn;
  }
  return state === 'services-off' && !isIOSPlatform
    ? PERMISSION_BANNER.location.action.locationSettings
    : PERMISSION_BANNER.location.action.appSettings;
}
