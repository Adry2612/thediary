/* Service worker mínimo para los recordatorios: sin fetch ni caché. */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = typeof payload.title === "string" ? payload.title : "thediary.";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "",
    tag: typeof payload.tag === "string" ? payload.tag : "thediary-daily",
    data: { url: typeof payload.url === "string" ? payload.url : "/" },
    icon: "/web-app-manifest-192x192.png",
    badge: "/favicon-96x96.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clients) {
        if (!client.url.startsWith(self.location.origin)) continue;
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clients) {
        client.postMessage({ type: "pushsubscriptionchange" });
      }
    })(),
  );
});
