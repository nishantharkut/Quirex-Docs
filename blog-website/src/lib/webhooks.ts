const WEBHOOKS_KEY = "quirex_webhooks";

export interface WebhookConfig {
  id: string;
  name: string;
  type: "slack" | "discord" | "custom";
  url: string;
  enabled: boolean;
  events: ("publish" | "update" | "delete")[];
}

function getWebhooks(): WebhookConfig[] {
  try {
    return JSON.parse(localStorage.getItem(WEBHOOKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWebhooks(webhooks: WebhookConfig[]) {
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
}

export function getWebhookConfigs(): WebhookConfig[] {
  return getWebhooks();
}

export function saveWebhookConfig(config: WebhookConfig) {
  const all = getWebhooks();
  const idx = all.findIndex((w) => w.id === config.id);
  if (idx >= 0) all[idx] = config;
  else all.push(config);
  saveWebhooks(all);
}

export function deleteWebhookConfig(id: string) {
  saveWebhooks(getWebhooks().filter((w) => w.id !== id));
}

/**
 * Build a notification payload for different webhook types
 */
function buildPayload(
  type: "slack" | "discord" | "custom",
  event: string,
  title: string,
  url: string,
  details?: string
) {
  const text = `📄 *${event}*: ${title}\n${details || ""}\n🔗 ${url}`;

  if (type === "slack") {
    return { text, blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*${event}*\n*${title}*\n${details || ""}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `<${url}|View document>` }] },
    ]};
  }

  if (type === "discord") {
    return { content: null, embeds: [{
      title: `${event}: ${title}`,
      description: details || "",
      url,
      color: event.includes("Deleted") ? 15548997 : event.includes("Updated") ? 16776960 : 5763719,
      footer: { text: "Quirex Docs" },
      timestamp: new Date().toISOString(),
    }]};
  }

  return { event, title, url, details, timestamp: new Date().toISOString() };
}

/**
 * Fire webhooks for a given event. Returns results for each webhook.
 * Note: Browser CORS may block Slack/Discord webhooks in local dev.
 * Works when self-hosted behind a proxy or via edge functions.
 */
export async function fireWebhooks(
  event: "publish" | "update" | "delete",
  postTitle: string,
  postUrl: string,
  details?: string
): Promise<{ id: string; success: boolean; error?: string }[]> {
  const webhooks = getWebhooks().filter((w) => w.enabled && w.events.includes(event));
  const eventLabel =
    event === "publish" ? "Published" : event === "update" ? "Updated" : "Deleted";

  const results = await Promise.all(
    webhooks.map(async (wh) => {
      try {
        const payload = buildPayload(wh.type, eventLabel, postTitle, postUrl, details);
        const res = await fetch(wh.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors", // Allow sending even if CORS blocks response
        });
        return { id: wh.id, success: true };
      } catch (e: any) {
        return { id: wh.id, success: false, error: e.message };
      }
    })
  );

  return results;
}

/**
 * Send a test notification to a specific webhook
 */
export async function testWebhook(config: WebhookConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = buildPayload(
      config.type,
      "Test Notification",
      "Hello from Quirex!",
      window.location.origin,
      "This is a test notification to verify your webhook is configured correctly."
    );
    await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
