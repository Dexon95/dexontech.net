export function createSeededRandom(seed) {
  let state = seed;

  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export async function createBrowserSeed() {
  const fingerprint = JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
  });
  const data = new TextEncoder().encode(fingerprint);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const seed = new DataView(digest).getUint32(0, false);

  return seed;
}
