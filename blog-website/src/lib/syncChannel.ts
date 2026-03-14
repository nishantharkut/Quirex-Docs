/**
 * Multi-tab synchronization via BroadcastChannel API.
 * Allows changes made in one tab (e.g., admin edits) to be reflected
 * in other open tabs (e.g., reader views) without page reload.
 */

type SyncEvent =
  | { type: "post_updated"; slug: string }
  | { type: "post_deleted"; slug: string }
  | { type: "post_published"; slug: string }
  | { type: "settings_changed" }
  | { type: "content_refresh" };

type SyncHandler = (event: SyncEvent) => void;

const CHANNEL_NAME = "quirex_sync";

let channel: BroadcastChannel | null = null;
const handlers = new Set<SyncHandler>();

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent<SyncEvent>) => {
      handlers.forEach((handler) => handler(e.data));
    };
  }
  return channel;
}

/**
 * Broadcast a sync event to all other tabs
 */
export function broadcastSync(event: SyncEvent): void {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(event);
    } catch {
      // Channel might be closed
    }
  }
}

/**
 * Subscribe to sync events from other tabs
 */
export function onSync(handler: SyncHandler): () => void {
  getChannel(); // Ensure channel is initialized
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

/**
 * React hook for listening to sync events
 */
export function useSyncListener(handler: SyncHandler) {
  // This should be called inside useEffect in the component
  return onSync(handler);
}
