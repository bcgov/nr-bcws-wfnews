export function isIPhone(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone/.test(userAgent);
}

export function checkIfLandscapeMode() {
  // also return true if this is table portrait mode wfnews-2022.
  if (
    (window.innerWidth > window.innerHeight) ||
    (window.innerWidth <= 1024 && window.innerWidth >= 768 && window.innerHeight > window.innerWidth)) {
    return true;
  } else {
    return false;
  }
}
