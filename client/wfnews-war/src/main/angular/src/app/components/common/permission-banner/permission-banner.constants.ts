import { LocationPermissionState } from '@app/services/capacitor-service';

/**
 * Every word that a permission banner or dialog shows. One place, so the same failure
 * reads the same way on each screen, and a wording change is one edit.
 * Headings are "[Feature] [state]"; texts give the reason, then the next step.
 */
export const PERMISSION_BANNER = {
  location: {
    heading: {
      off: 'Location turned off',
    },
    action: {
      turnOn: 'Turn on location',
      appSettings: 'Open settings',
      locationSettings: 'Open location settings',
    },
    message: {
      reportOfFire:
        'Location is required to create a report. Turn on location to continue.',
      nearestFirst: 'Turn on location to see the places nearest to you first.',
    },
    // Report of Fire states that no tap can repair. Continue turns on by itself.
    reportOfFire: {
      searching: {
        heading: 'Searching for location',
        message: 'This may take a few moments.',
      },
      searchingOffline: {
        heading: 'Searching for location',
        message: 'With no network, this may take up to a minute.',
      },
      noPosition: {
        heading: 'Searching for location',
        message:
          'Location is on, but your device has not found your position yet. Moving outside or towards a window may increase chances of success.',
      },
      found: {
        heading: 'Location found',
        message: 'Thank you. You can now continue your report.',
      },
      browserDenied: {
        heading: 'Location turned off',
        message:
          'Location is required to create a report. Allow location for this site in your browser settings to continue.',
      },
      browserServicesOff: {
        heading: 'Location turned off',
        message:
          'Location is required to create a report. Turn on location on your device to continue.',
      },
      unsupported: {
        heading: 'Location unavailable',
        message:
          'This device or browser does not share location. You can still report the fire by phone.',
      },
    },
    callToReport: {
      question: 'Having trouble with location?',
      action: 'Call to report',
    },
  },
  push: {
    heading: 'Notifications turned off',
    action: {
      turnOn: 'Turn on notifications',
      appSettings: 'Open settings',
    },
    message: {
      savedLocations:
        'Turn on notifications for this app to receive wildfire alerts for your saved locations.',
    },
  },
} as const;

/**
 * Keyed by state, then by where the user is: in the app, or in a browser. The screen
 * that opens the dialog puts its reason before the location text.
 */
export const PERMISSION_DIALOG = {
  location: {
    reason: {
      map: 'Location is needed to show where you are on the map.',
      useLocation: 'Location is needed to use your current location.',
    },
    title: {
      off: 'Location turned off',
      noPosition: 'Searching for location',
      unsupported: 'Location unavailable',
    },
    message: {
      prompt: 'Turn on location to continue.',
      denied: {
        app: 'Turn on location in your device settings to continue.',
        web: 'Allow location for this site in your browser settings to continue.',
      },
      servicesOff: {
        app: 'Turn on location in your device settings to continue.',
        web: 'Turn on location on your device to continue.',
      },
      noPosition:
        'Location is on, but your device has not found your position yet. Moving outside or towards a window may increase chances of success.',
      unsupported: 'This device or browser does not share location.',
    },
    action: {
      turnOn: 'Turn on location',
    },
  },
  action: {
    cancel: 'Cancel',
    close: 'Close',
  },
} as const;

/** True when a prompt still works. Otherwise the way back is the settings page. */
export function locationCanPrompt(state: LocationPermissionState): boolean {
  return state === 'prompt' || state === 'denied-once';
}

/** One heading for every way location can be off: the text and action say where. */
export function locationBannerHeading(): string {
  return PERMISSION_BANNER.location.heading.off;
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
