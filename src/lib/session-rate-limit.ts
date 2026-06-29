type SessionBucket = {
  count: number;
  resetAt: number;
};

type CooldownBucket = {
  lastAt: number;
};

const GLOBAL_KEY = "__dv_assistant_rate_limit__";
const GLOBAL_COOLDOWN_KEY = "__dv_assistant_rate_cooldown__";

function getStore(): Map<string, SessionBucket> {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, SessionBucket>;
  };

  if (!globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY] = new Map<string, SessionBucket>();
  }

  return globalScope[GLOBAL_KEY]!;
}

function getCooldownStore(): Map<string, CooldownBucket> {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_COOLDOWN_KEY]?: Map<string, CooldownBucket>;
  };

  if (!globalScope[GLOBAL_COOLDOWN_KEY]) {
    globalScope[GLOBAL_COOLDOWN_KEY] = new Map<string, CooldownBucket>();
  }

  return globalScope[GLOBAL_COOLDOWN_KEY]!;
}

export function checkSessionQueryLimit(params: {
  sessionId: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(params.sessionId);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + params.windowMs;
    store.set(params.sessionId, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(params.limit - 1, 0),
      retryAfterSec: Math.ceil(params.windowMs / 1000),
    };
  }

  if (existing.count >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    };
  }

  existing.count += 1;
  store.set(params.sessionId, existing);

  return {
    allowed: true,
    remaining: Math.max(params.limit - existing.count, 0),
    retryAfterSec: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
  };
}

export function checkSessionCooldown(params: {
  sessionId: string;
  cooldownMs: number;
}): { allowed: boolean; retryAfterSec: number } {
  const store = getCooldownStore();
  const now = Date.now();
  const existing = store.get(params.sessionId);

  if (!existing) {
    store.set(params.sessionId, { lastAt: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  const elapsed = now - existing.lastAt;
  if (elapsed < params.cooldownMs) {
    return {
      allowed: false,
      retryAfterSec: Math.max(Math.ceil((params.cooldownMs - elapsed) / 1000), 1),
    };
  }

  store.set(params.sessionId, { lastAt: now });
  return { allowed: true, retryAfterSec: 0 };
}
