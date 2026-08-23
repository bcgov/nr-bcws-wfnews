/**
 * The Android permission dialog. Its package and its button ids changed across
 * releases, so try each known id and fall back to the button text.
 */

// Android 10 on a Pixel XL reports com.google.android.permissioncontroller. The other
// two are the older and the AOSP names.
const PACKAGES = [
  'com.google.android.permissioncontroller',
  'com.android.permissioncontroller',
  'com.android.packageinstaller',
];

const BUTTON_IDS = {
  allowForeground: ['permission_allow_foreground_only_button', 'permission_allow_button'],
  allowAlways: ['permission_allow_always_button'],
  deny: ['permission_deny_button'],
  denyDontAsk: ['permission_deny_and_dont_ask_again_button'],
  // Android 12 and later split precise from approximate.
  precise: ['permission_location_accuracy_radio_fine'],
  approximate: ['permission_location_accuracy_radio_coarse'],
};

const TEXT_FALLBACK: Record<keyof typeof BUTTON_IDS, RegExp> = {
  allowForeground: /while using the app|only this time|^allow$/i,
  allowAlways: /all the time/i,
  deny: /^deny$|^don.t allow$/i,
  denyDontAsk: /don.t ask again/i,
  precise: /precise/i,
  approximate: /approximate/i,
};

async function firstExisting(selectors: string[]) {
  for (const selector of selectors) {
    const element = await $(selector);
    if (await element.isExisting()) return element;
  }
  return null;
}

export async function dialogButton(kind: keyof typeof BUTTON_IDS) {
  const ids = PACKAGES.flatMap((pkg) => BUTTON_IDS[kind].map((id) => `id=${pkg}:id/${id}`));
  const byId = await firstExisting(ids);
  if (byId) return byId;

  const pattern = TEXT_FALLBACK[kind].source;
  const byText = await $(`android=new UiSelector().textMatches("(?i)${pattern}")`);
  return (await byText.isExisting()) ? byText : null;
}

export async function isDialogShowing(timeout = 20_000): Promise<boolean> {
  try {
    await driver.waitUntil(async () => (await dialogButton('deny')) !== null, { timeout, interval: 500 });
    return true;
  } catch {
    return false;
  }
}

/** Reads the dialog text, so a test can record whether the app gave a reason. */
export async function dialogMessage(): Promise<string> {
  for (const pkg of PACKAGES) {
    const message = await $(`id=${pkg}:id/permission_message`);
    if (await message.isExisting()) return message.getText();
  }
  return '';
}

export async function tap(kind: keyof typeof BUTTON_IDS, timeout = 15_000): Promise<void> {
  // The dialog animates in, so a button can be missing for a moment after it appears.
  let button: Awaited<ReturnType<typeof dialogButton>> = null;
  try {
    await driver.waitUntil(async () => (button = await dialogButton(kind)) !== null, { timeout, interval: 400 });
  } catch {
    throw new Error(`The permission dialog has no "${kind}" button after ${timeout} ms.`);
  }
  await button!.click();
}
