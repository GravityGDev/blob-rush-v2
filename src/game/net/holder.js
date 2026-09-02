// Lets the game loop start instantly while the server connection is still opening.
// The loop talks to this stable object; it forwards to the socket once it exists.
export function createNetHolder({ required = false } = {}) {
  return {
    required,
    client: null,
    get connected() { return !!this.client?.connected; },
    get ping() { return this.client?.ping || 0; },
    get bandwidth() { return this.client?.bandwidth || 0; },
    get sync() { return this.client?.sync; },
    sendInput(dir) { this.client?.sendInput(dir); },
    split(times) { this.client?.split(times); },
    feed(pulses) { this.client?.feed(pulses); },
    emoji(id) { this.client?.emoji(id); },
    emote(id) { this.client?.emote(id); },
    close() { this.client?.close(); this.client = null; },
  };
}
