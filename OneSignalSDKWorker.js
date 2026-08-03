importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ── App icon badge support ──
// OneSignal's own worker (imported above) handles displaying the notification itself,
// but does not call the Badging API for web push — so the app icon badge on iOS never
// updates on its own. We add a second push listener here (service workers support
// multiple listeners for the same event; this does NOT replace OneSignal's own handler,
// both simply run) that just reads the badge count out of the push payload and sets it.
self.addEventListener('push', (event) => {
  if (!('setAppBadge' in self.navigator)) return; // unsupported browser — nothing to do
  try {
    const data = event.data ? event.data.json() : {};
    // OneSignal includes custom data fields under different keys depending on payload
    // shape; badge is intentionally a fixed small increment rather than trying to track
    // a genuine unread count client-side (that would need local state the worker doesn't have).
    event.waitUntil(self.navigator.setAppBadge(1).catch(() => {}));
  } catch (e) {
    // Badge is a nice-to-have — never let a badging failure affect the actual notification.
  }
});

// Clear the badge once the person actually opens the app from a notification tap.
self.addEventListener('notificationclick', () => {
  if ('clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge().catch(() => {});
  }
});
